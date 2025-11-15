import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    await prisma.team.delete({ where: { id } })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
