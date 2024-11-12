import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import User from '#models/user'
import Attack from '#models/attack'
import Ship from '#models/ship'
import Board from '#models/board'
import { attackValidator } from '#validators/attack'
import axios from 'axios'
import env from '#start/env'

export default class AttackController {
    public async attack({ request, response, auth }: HttpContext) {
        const { id, x, y } = request.only(['id', 'x', 'y'])

        // Validar la solicitud
        await request.validateUsing(attackValidator)

        // Autenticar al usuario
        await auth.use('api').authenticate()
        const email = auth.user?.email

        if (!email) {
            return response.status(401).json({ error: 'Unauthorized' })
        }

        // Buscar al jugador y verificar su existencia
        const player = await User.findBy('email', email)
        if (!player) {
            return response.status(404).json({ error: 'Player not found' })
        }

        // Buscar el juego y verificar su existencia
        const game = await Game.findBy('id', id)
        if (!game) {
            return response.status(404).json({ error: 'Game not found' })
        }

        if (game.status == 'FINISHED') {
            return response.status(400).json({ 
                message: 'Game already finished' 
            })
        }

        const gameId = game.id
        const playerId = player.id

        // Obtener el tablero del oponente
        const opponentBoard = await Board.query()
            .where('game_id', gameId)
            .whereNot('player_id', playerId)
            .first()

        if (!opponentBoard) {
            return response.status(404).json({ error: 'Opponent board not found' })
        }

        // Obtener la lista de barcos del oponente
        const ships = await Ship.query().where('board_id', opponentBoard.id)

        // Verificar si el ataque golpea algún barco
        let hit = false
        let shipInfo = null

        for (const ship of ships) {
            if (ship.x === x && ship.y === y) {
                // Marcar el barco como golpeado
                ship.hits = 1
                await ship.save()

                hit = true
                shipInfo = ship  // Devuelvo la información del barco que fue golpeado
                break
            }
        }

        // Registrar el ataque en la base de datos
        const attack = new Attack()
        attack.gameId = gameId
        attack.playerId = playerId
        attack.x = x
        attack.y = y
        attack.hit = hit

        await attack.save()

        // Enviar notificación de ataque al oponente a través de Slack
        const opponent = await User.find(opponentBoard.playerId)
        const opponentEmail = opponent?.email ?? 'Desconocido'
        const attackerEmail = player.email
        const attackMessage = hit
            ? `🚀 ${attackerEmail} atacó en las coordenadas (${x}, ${y}) y ¡ha golpeado un barco de ${opponentEmail}!`
            : `⚠️ ${attackerEmail} atacó en las coordenadas (${x}, ${y}) pero falló. Ahora es el turno de ${opponentEmail}.`

        const slackToken = env.get('SLACK_BOT_TOKEN')
        const channelId = env.get('SLACK_CHANNEL_ID')

        try {
            await axios.post(
                'https://slack.com/api/chat.postMessage',
                {
                    channel: channelId,
                    text: attackMessage,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${slackToken}`,
                    },
                }
            )
        } catch (error) {
            console.error('Error al enviar mensaje a Slack:', error)
        }

        // Revisar si todos los barcos del oponente están golpeados
        const remainingShips = await Ship.query().where('board_id', opponentBoard.id).andWhere('hits', 0)

        if (remainingShips.length === 0) {
            // Marcar el juego como completado y establecer el ganador y perdedor
            game.status = 'FINISHED'
            game.winnerId = playerId
            game.looserId = opponentBoard.playerId
            await game.save()

            // Notificación final del juego en Slack
            const finalMessage = `🎉 ¡El juego ha terminado! El ganador es: ${attackerEmail}, y el perdedor es: ${opponentEmail}.`
            try {
                await axios.post(
                    'https://slack.com/api/chat.postMessage',
                    {
                        channel: channelId,
                        text: finalMessage,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${slackToken}`,
                        },
                    }
                )
            } catch (error) {
                console.error('Error al enviar mensaje final a Slack:', error)
            }
        }

        // Responder con el estado del ataque y la información del barco si se ha golpeado
        return response.status(201).json({
            message: hit ? '¡Golpeado!' : '¡Fallado!',
            hit,
            shipInfo
        })
    }

    public async getUserAttacks({ auth, params, response }: HttpContext) {
        await auth.use('api').authenticate()

        const email = auth.user?.email

        if (!email) {
            return response.unauthorized({ message: 'Usuario no autenticado' })
        }

        const user = await User.findBy('email', email)

        if (!user) {
            return response.notFound({ message: 'Usuario no encontrado' })
        }

        const userId = user.id

        // Obtener el ID de la partida de los parámetros de la solicitud
        const gameId = params.gameId

        // Consultar ataques realizados por el usuario en la partida específica
        const attacks = await Attack.query()
            .where('player_id', userId)
            .andWhere('game_id', gameId)
            .select('id', 'x', 'y', 'hit') // selecciona solo las columnas necesarias

        return response.ok({ attacks })
    }
}