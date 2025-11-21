import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)
    if (!form) throw new Error("Invalid form data")

    let name = ''
    let description = ''
    let price: number | null = null
    let companyId: number | null = null
    let imagePath: string | null = null

    for (const field of form) {
      if (field.name === 'name') name = field.data.toString()
      if (field.name === 'description') description = field.data.toString()
      if (field.name === 'price') price = parseFloat(field.data.toString())
      if (field.name === 'companyId') companyId = Number(field.data.toString())

      // HANDLE FILE
      if (field.filename) {
        const uploadDir = 'public/uploads/products'
        const fileName = Date.now() + '-' + field.filename
        const fullPath = path.join(uploadDir, fileName)

        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(fullPath, field.data)

        imagePath = '/uploads/products/' + fileName
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image: imagePath,
        companyId: companyId!,
      }
    })

    return { success: true, data: newProduct }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
