import vine from '@vinejs/vine'

export const attackValidator = vine.compile(
    vine.object({
        id: vine.number(),
        x: vine.number().min(0).max(6),
        y: vine.number().min(0).max(6),
    })
)