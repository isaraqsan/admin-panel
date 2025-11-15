import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: galleries }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
