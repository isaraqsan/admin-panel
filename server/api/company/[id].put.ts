import { PrismaClient } from '@prisma/client'
import { extname, join } from 'path'
import { promises as fs } from 'fs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const formData = await readMultipartFormData(event)

    if (!formData) return { success: false, error: 'No form data provided' }

    const nameField = formData.find(i => i.name === 'name')
    const addressField = formData.find(i => i.name === 'address')
    const phoneField = formData.find(i => i.name === 'phone')
    const emailField = formData.find(i => i.name === 'email')
    const aboutField = formData.find(i => i.name === 'about')
    const logoFile = formData.find(i => i.name === 'logo')

    let logoPath: string | undefined = undefined

    if (logoFile && logoFile.filename && logoFile.data) {
      const ext = extname(logoFile.filename)
      const filename = `${randomUUID()}${ext}`
      const uploadDir = join(process.cwd(), 'public/uploads')

      await fs.mkdir(uploadDir, { recursive: true })

      const filepath = join(uploadDir, filename)
      await fs.writeFile(filepath, logoFile.data)

      logoPath = `/uploads/${filename}`
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: nameField?.data?.toString(),
        address: addressField?.data?.toString(),
        phone: phoneField?.data?.toString(),
        email: emailField?.data?.toString(),
        about: aboutField?.data?.toString(),
        ...(logoPath ? { logo: logoPath } : {}), // only update if new file
      },
    })

    return { success: true, data: company }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})
