import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    // GET all home sections
    try {
      const homeSections = await prisma.homeSection.findMany({
        orderBy: { createdAt: 'desc' },
        include: { banners: true, company: true },
      })
      return { success: true, data: homeSections }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  if (method === 'POST') {
    // POST / create
    try {
      const body = await readBody(event)
      const { companyId, headline, subheadline } = body

      const newSection = await prisma.homeSection.create({
        data: {
          companyId,
          headline,
          subheadline,
        },
      })

      return { success: true, data: newSection }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return { success: false, error: 'Method not allowed' }
})
