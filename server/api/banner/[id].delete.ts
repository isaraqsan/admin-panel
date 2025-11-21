import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)   // <----- FIX DI SINI

    if (!id) return { success: false, error: 'ID is required' }

    const bannerId = Number(id)

    const banner = await prisma.banner.findUnique({ where: { id: bannerId } })
    if (!banner) return { success: false, error: 'Banner not found' }

    // Delete file from public folder
    if (banner.image) {
      const fullPath = join(process.cwd(), 'public', banner.image)
      fs.unlink(fullPath).catch(() => {})
    }

    await prisma.banner.delete({ where: { id: bannerId } })

    return { success: true, message: 'Banner deleted successfully' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
