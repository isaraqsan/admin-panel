import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const companyId = Number(query.companyId) || 4

  try {
    // ambil semua section untuk company sesuai order, sekaligus ambil relasi banners
    const sectionsDb = await prisma.section.findMany({
      where: { companyId },
      orderBy: { order: 'asc' },
      include: {
        banners: true // ambil banner untuk section ini
      }
    })

    // ambil konten table sekaligus
    const [
      services,
      products,
      galleries,
      teams,
      blogs,
      testimonials,
      pages,
      setting
    ] = await Promise.all([
      prisma.service.findMany({ where: { companyId } }),
      prisma.product.findMany({ where: { companyId } }),
      prisma.gallery.findMany({ where: { companyId } }),
      prisma.team.findMany({ where: { companyId } }),
      prisma.blogPost.findMany({ where: { companyId } }),
      prisma.testimonial.findMany({ where: { companyId } }),
      prisma.page.findMany({ where: { companyId } }),
      prisma.setting.findUnique({ where: { companyId } })
    ])

    // mapping konten table
    const contentMap: Record<string, unknown> = {
      features: services,
      products: products,
      gallery: galleries,
      team: teams,
      blog: blogs,
      testimonials,
      hero: pages.find(p => p.slug === 'hero') || null,
      setting
    }

    // buat array sections sesuai order
    const sections: any[] = []

    for (const section of sectionsDb) {
      // skip section jika description null atau kosong
      if (!section.description || section.description.trim() === '') continue

      const key = section.name
      const content = contentMap[key]

      // cek content
      const hasContent = content && ((Array.isArray(content) && content.length) || (!Array.isArray(content)))

      // cek banners
      const hasBanners = section.banners && section.banners.length

      // buat object section
      const sectionContent: any = {}
      if (hasContent) sectionContent.content = content
      if (hasBanners) sectionContent.banners = section.banners

      sections.push({
        name: key,
        title: section.title,
        description: section.description,
        ...sectionContent
      })
    }


    return { success: true, data: sections }
  } catch (err) {
    return { success: false, message: (err as Error).message }
  }
})
