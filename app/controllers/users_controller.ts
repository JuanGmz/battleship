import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateRoleValidator } from '#validators/user'

export default class UsersController {

    async updateRole({ request, response }: HttpContext) {
        const {email, role} = request.only(['role', 'email'])

        await request.validateUsing(updateRoleValidator)

        if (role !== 'admin' && role !== 'user' && role !== 'guest') {
            return response.status(400).json({
                message: 'Invalid role'
            })
        }

        const user = await User.findByOrFail('email', email)

        if (!user) {
            return response.status(404).json({ message: 'User not found' })
        }

        if (role == 'admin') {
            return response.status(400).json({
                message: 'Cannot update role to admin'
            })
        }

        user.role = role

        user.save()

        return response.status(200).json({
            message: 'Role updated successfully'
        })
    }

    public async disableUser({ request, response }: HttpContext) {
        const {email} = request.only(['email'])

        const user = await User.findByOrFail('email', email)

        if (!user) {
            return response.status(404).json({ message: 'User not found' })
        }

        if (user.role === 'admin') {
            return response.status(400).json({
                message: 'Cannot disable admin user'
            })
        }

        user.active = false

        user.save()

        return response.status(200).json({
            message: 'User disabled successfully'
        })
    }
}