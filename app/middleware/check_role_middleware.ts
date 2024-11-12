import type { HttpContext } from '@adonisjs/core/http'

export default class CheckRoleMiddleware {
  public async handle({ auth, response }: HttpContext, next: () => Promise<void>, roles: string[]) {
    // Verifica si el usuario está autenticado
    if (!(await auth.check())) {
      return response.unauthorized('Unauthorized')
    }

    // Obtiene el rol del usuario autenticado
    const userRole = auth.user?.role

    // Si el rol no está presente o no está en la lista de roles permitidos, denegar acceso
    if (!userRole || !roles.includes(userRole)) {
      return response.status(403).json({ 
        message: 'Unauthorized' 
      })
    }

    await next()
  }
}