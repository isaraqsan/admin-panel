import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const companyId = query.companyId ? Number(query.companyId) : null

    if (companyId) {
      // GET satu company
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })
      return { success: true, data: company }
    }

    // GET semua company
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: companies }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
