// server/api/banner.post.ts
import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData) {
      return { success: false, error: 'No form data provided' }
    }

    const titleField = formData.find(i => i.name === 'title')
    const orderField = formData.find(i => i.name === 'order')
    const imageFile = formData.find(i => i.name === 'image')

    if (!imageFile?.data || !imageFile?.filename) {
      return { success: false, error: 'Image is required.' }
    }

    const order = orderField?.data ? parseInt(orderField.data.toString(), 10) : 0
    const sectionId = 2 // selalu 2

    // Simpan file image
    const ext = extname(imageFile.filename)
    const filename = `${randomUUID()}${ext}`
    const uploadDir = join(process.cwd(), 'public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const filepath = join(uploadDir, filename)
    await fs.writeFile(filepath, imageFile.data)
    const imagePath = `/uploads/${filename}`

    const banner = await prisma.banner.create({
      data: {
        title: titleField?.data?.toString() || null,
        image: imagePath,
        order,
        sectionId
      }
    })

    return { success: true, data: banner }
  } catch (e: any) {
    console.error('Error creating banner:', e)
    return { success: false, error: e.message }
  }
})
