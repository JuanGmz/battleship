import { type HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import Route from '@adonisjs/core/services/router'
import { createUserValidator } from '#validators/user'
import User from '#models/user'

export default class AuthController {
    async register({ request, response }: HttpContext) {
        const data = request.only(['full_name', 'email', 'password'])

        await request.validateUsing(createUserValidator)

        if (await User.findBy('email', data.email)) {
            return response.status(400).json({ message: 'User already exists' })
        }

        const user = new User()

        user.fullName = data.full_name
        user.email = data.email
        user.password = data.password

        const url = Route.makeSignedUrl(
            'activate',
            { email: user.email },
            { expiresIn: '1m' }
        )

        user.save()

        if (user.id === 1) {
            user.role = 'admin'
            user.save()
        }

        const activateUrl = 'http://localhost:3333' + url

        await mail.send((activation) => {
            activation
                .to(user.email)
                .subject('Verify your email address')
                .from('info@example.org')
                .htmlView('emails/activation', { user, activateUrl })
        })

        return response.status(201).json({
            message: 'User created successfully, please check your email'
        })
    }

    async login({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        const user = await User.findBy('email', email)

        if (!user) {
            return response.status(401).json({
                message: 'User not found'
            })
        }

        if (!user?.active) {
            return response.status(403).json({
                message: 'Account not activated'
            })
        }

        const isPasswordValid = await hash.verify(user.password, password)

        if (!isPasswordValid) {
            return response.status(403).json({
                message: 'Invalid credentials'
            })
        }

        const token = await User.accessTokens.create(user)

        return response.status(200).json({
            message: 'Login successful',
            token: token.value!.release(),
        })
    }

    async activate({ request, response }: HttpContext) {
        if (!request.hasValidSignature()) {
            return response.status(403).json({ message: 'Link expired or invalid' })
        }

        const user = await User.findByOrFail('email', request.param('email'))

        if (!user) {
            return response.status(404).json({ message: 'User not found' })
        }

        if (user.active === true) {
            return response.status(400).json({ message: 'User already activated' })
        }

        user.active = true
        user.role = 'jugador'

        user.save()

        const admin = await User.findBy('role', 'admin')

        if (!admin) {
            return response.status(404).json({ message: 'Admin user not found' })
        }

        await mail.send((activation) => {
            activation
                .to(admin.email)
                .subject('Account activated')
                .from(user.email)
                .htmlView('emails/notification', { user, admin })
        })

        return response.json({ message: 'User activated successfully' })
    }
}