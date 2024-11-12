import axios from 'axios'
import type { HttpContext } from '@adonisjs/core/http'

export default class SlacksController {
    async slack({ response, }: HttpContext) {
        const slackToken = process.env.SLACK_BOT_TOKEN
        const channelId = process.env.SLACK_CHANNEL_ID

        const message = 'Hola puto'

        try {
            // Hacer la solicitud POST a la API de Slack
            const result = await axios.post('https://slack.com/api/chat.postMessage', {
                channel: channelId,
                text: message,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${slackToken}`,
                },
            })

            if (result.data.ok) {
                return response.ok({ success: true, message: 'Mensaje enviado a Slack correctamente' })
            } else {
                return response.badRequest({ success: false, error: result.data.error })
            }
        } catch (error) {
            console.error('Error al enviar mensaje a Slack:', error)
            return response.internalServerError({ success: false, error: error.message })
        }
    }
}