import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
    vine.object({
        full_name: vine.string().trim().minLength(3),
        email: vine.string().trim().email(),
        password: vine.string().trim().minLength(8),
    })
)

export const updateRoleValidator = vine.compile(
    vine.object({
        role: vine.string().trim(),
        email: vine.string().trim().email(),
    })
)