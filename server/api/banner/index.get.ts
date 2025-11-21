import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const sectionId = query.sectionId ? Number(query.sectionId) : null

    if (sectionId !== null) {
      // GET semua banner untuk section tertentu
      const banners = await prisma.banner.findMany({
        where: { sectionId: 2 }
      })
      return { success: true, data: banners }
    }

    // GET semua banner tanpa filter
    const banners = await prisma.banner.findMany({ where: { sectionId: 2 } })
    return { success: true, data: banners }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
