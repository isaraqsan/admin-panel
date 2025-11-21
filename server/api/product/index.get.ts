import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: products }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
