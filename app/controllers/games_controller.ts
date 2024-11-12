import type { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import User from '#models/user'
import Board from '#models/board'
import Ship from '#models/ship'

export default class GamesController {
    public async games({ response }: HttpContext) {
        const games = await Game.all()

        if (!games || games.length === 0) {
            return response.status(404).json({
                error: 'No games found'
            })
        }

        return response.status(200).json(games)
    }

    public async showGame({ params, response }: HttpContext) {
        const game = await Game.find(params.id)

        if (!game) {
            return response.status(404).json({
                error: 'Game not found'
            })
        }

        return response.status(200).json(game)
    }

    public async createGame({ response, auth }: HttpContext) {
        await auth.use('api').authenticate()

        const email = auth.user?.email

        if (!email) {
            return response.status(401).json({
                error: 'Unauthorized'
            })
        }

        const player = await User.findBy('email', email)

        if (!player) {
            return response.status(404).json({
                error: 'Player not found'
            })
        }

        const idplayer = player.id
        const game = new Game()
        game.player1_id = idplayer
        game.status = 'WAITING' // Mark the game as waiting for a second player

        await game.save()

        // Create the board for player 1
        const board = new Board()
        board.gameId = game.id
        board.playerId = idplayer
        board.boardData = JSON.stringify(this.initializeBoard())
        await board.save()

        // Create ships for player 1
        await this.createShipsForPlayer(board.id, idplayer)

        return response.status(201).json({
            message: 'Game created successfully',
            game: game.id
        })
    }

    public async joinGame({ response, request, auth }: HttpContext) {
        await auth.use('api').authenticate()

        const email = auth.user?.email

        if (!email) {
            return response.status(401).json({
                error: 'Unauthorized'
            })
        }

        const player = await User.findBy('email', email)

        if (!player) {
            return response.status(404).json({
                error: 'Player not found'
            })
        }

        const { id } = request.only(['id'])

        if (!id) {
            return response.status(400).json({
                error: 'Game ID is required'
            })
        }

        const game = await Game.findBy('id', id)

        if (!game) {
            return response.status(404).json({
                error: 'Game not found'
            })
        }

        if (game.status !== 'WAITING') {
            return response.status(400).json({
                error: 'Game is not waiting for players'
            })
        }

        if (player.id === game.player1_id || player.id === game.player2_id) {
            return response.status(400).json({
                error: 'You are already a player in this game'
            })
        }

        game.player2_id = player.id
        game.status = 'IN_PROGRESS'

        await game.save()

        // Create the board for player 2
        const board = new Board()
        board.gameId = game.id
        board.playerId = player.id
        board.boardData = JSON.stringify(this.initializeBoard())
        await board.save()

        // Create ships for player 2
        await this.createShipsForPlayer(board.id, player.id)

        return response.status(200).json({
            message: 'Game joined successfully and started',
        })
    }

    private initializeBoard() {
        const emptyBoard = Array.from({ length: 6 }, () => Array(6).fill(0))
        const numShips = 10

        for (let i = 0; i < numShips; i++) {
            this.placeShip(emptyBoard)
        }

        return emptyBoard
    }

    private placeShip(board: any[][]) {
        let placed = false

        while (!placed) {
            const x = Math.floor(Math.random() * 6)
            const y = Math.floor(Math.random() * 6)

            if (board[x][y] === 0) {
                board[x][y] = 1
                placed = true
            }
        }
    }

    private async createShipsForPlayer(boardId: number, playerId: number) {
        const ships = this.placeShipsOnBoard()

        for (const ship of ships) {
            const newShip = new Ship()
            newShip.boardId = boardId
            newShip.x = ship.x
            newShip.y = ship.y
            newShip.hits = 0
            newShip.playerId = playerId
            await newShip.save()
        }
    }

    private placeShipsOnBoard() {
        const ships: { x: number, y: number }[] = []

        for (let i = 0; i < 10; i++) {
            let placed = false

            while (!placed) {
                const x = Math.floor(Math.random() * 6)
                const y = Math.floor(Math.random() * 6)

                if (!ships.some(ship => ship.x === x && ship.y === y)) {
                    ships.push({ x, y })
                    placed = true
                }
            }
        }

        return ships
    }

    public async playerGames({ response, auth }: HttpContext) {
        await auth.use('api').authenticate()

        const email = auth.user?.email

        if (!email) {
            return response.status(401).json({
                error: 'Unauthorized'
            })
        }

        const player = await User.findBy('email', email)

        if (!player) {
            return response.status(404).json({
                error: 'Player not found'
            })
        }

        const games = await Game.query().where('player1_id', player.id).orWhere('player2_id', player.id)

        if (!games || games.length === 0) {
            return response.status(404).json({
                error: 'No games found'
            })
        }

        return response.status(200).json(games)
    }

    public async waitingOpponent({ response, auth }: HttpContext) {
        await auth.use('api').authenticate()

        const email = auth.user?.email

        if (!email) {
            return response.status(401).json({
                error: 'Unauthorized'
            })
        }

        const player = await User.findBy('email', email)

        if (!player) {
            return response.status(404).json({
                error: 'Player not found'
            })
        }

        const games = await Game.query().where('player1_id', player.id).where('status', 'WAITING')

        if (!games || games.length === 0) {
            return response.status(404).json({
                error: 'No games found'
            })
        }

        return response.status(200).json(games)
    }
}
