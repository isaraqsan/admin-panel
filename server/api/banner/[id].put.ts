import { PrismaClient } from '@prisma/client'
import { readMultipartFormData } from 'h3'
import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData) return { success: false, error: 'No form data provided' }

    const idField = formData.find(i => i.name === 'id')
    const titleField = formData.find(i => i.name === 'title')
    const orderField = formData.find(i => i.name === 'order')
    const imageFile = formData.find(i => i.name === 'image')

    if (!idField?.data) {
      return { success: false, error: 'ID is required.' }
    }

    const id = parseInt(idField.data.toString(), 10)

    // Ambil banner lama untuk hapus image jika diganti
    const existing = await prisma.banner.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Banner not found' }

    let newImagePath = existing.image

    // Jika upload image baru
    if (imageFile?.filename && imageFile?.data) {
      const ext = extname(imageFile.filename)
      const filename = `${randomUUID()}${ext}`
      const uploadDir = join(process.cwd(), 'public/uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const filepath = join(uploadDir, filename)

      await fs.writeFile(filepath, imageFile.data)
      newImagePath = `/uploads/${filename}`

      // Hapus file lama jika ada
      if (existing.image) {
        const oldPath = join(process.cwd(), 'public', existing.image)
        fs.unlink(oldPath).catch(() => {})
      }
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title: titleField?.data?.toString() ?? existing.title,
        order: orderField?.data ? parseInt(orderField.data.toString(), 10) : existing.order,
        image: newImagePath,
        sectionId: 2, // FIXED
      }
    })

    return { success: true, data: updated }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})
