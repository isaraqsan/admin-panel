import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: teams }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
