import { PrismaClient } from '@prisma/client'
import { readBody } from 'h3'
import type { TeamResponse } from '../../../app/types' // import type response

const prisma = new PrismaClient()

export default defineEventHandler(async (event): Promise<TeamResponse> => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return { success: false, error: 'Invalid team ID' }

    const body = await readBody(event)
    const { name, position, bio, photo } = body

    const updated = await prisma.team.update({
      where: { id },
      data: {
        name,
        position,
        bio,
        photo
      }
    })

    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
