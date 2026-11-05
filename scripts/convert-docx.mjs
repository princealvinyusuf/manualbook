import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mammoth from 'mammoth'
import { JSDOM } from 'jsdom'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sourcePath =
  process.argv[2] ??
  'C:\\Users\\paske\\Downloads\\Handbook dan Manualbook Karirhub Console - Master Draft.docx'
const assetsDir = path.join(rootDir, 'public', 'manual-assets')
const contentDir = path.join(rootDir, 'src', 'content')

const extensionByType = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/x-emf': 'emf',
  'image/x-wmf': 'wmf',
}

await rm(assetsDir, { recursive: true, force: true })
await mkdir(assetsDir, { recursive: true })
await mkdir(contentDir, { recursive: true })

let imageIndex = 0
const writtenImages = new Set()
const imageConverter = mammoth.images.imgElement(async (image) => {
  imageIndex += 1
  const base64 = await image.read('base64')
  const buffer = Buffer.from(base64, 'base64')
  const extension = extensionByType[image.contentType] ?? 'bin'
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 8)
  const fileName = `figure-${hash}.${extension}`
  if (!writtenImages.has(fileName)) {
    await writeFile(path.join(assetsDir, fileName), buffer)
    writtenImages.add(fileName)
  }
  return { src: `manual-assets/${fileName}` }
})

const result = await mammoth.convertToHtml(
  { path: sourcePath },
  {
    convertImage: imageConverter,
    includeDefaultStyleMap: true,
    styleMap: [
      "p[style-name='Title'] => h1.document-title:fresh",
      "p[style-name='Subtitle'] => p.document-subtitle:fresh",
      "p[style-name='Caption'] => p.figure-caption:fresh",
    ],
  },
)

const dom = new JSDOM(`<article id="manual-article">${result.value}</article>`)
const document = dom.window.document
const article = document.querySelector('article')

if (!article) {
  throw new Error('The converted document did not contain an article.')
}

// The DOCX already contains a generated Word table of contents. The portal
// builds its own interactive navigation, so remove that duplicated block.
const directChildren = [...article.children]
const tocStartIndex = directChildren.findIndex(
  (element) => element.textContent?.trim().toUpperCase() === 'DAFTAR ISI',
)
const updateIndex = directChildren.findIndex(
  (element, index) =>
    index > tocStartIndex &&
    element.textContent?.trim().toUpperCase() === 'LIST OF UPDATE',
)

if (tocStartIndex >= 0 && updateIndex > tocStartIndex) {
  directChildren
    .slice(tocStartIndex, updateIndex)
    .forEach((element) => element.remove())
}

const slugCounts = new Map()
const slugify = (value) => {
  const base =
    value
      .toLocaleLowerCase('id')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'bagian'
  const count = (slugCounts.get(base) ?? 0) + 1
  slugCounts.set(base, count)
  return count === 1 ? base : `${base}-${count}`
}

const headings = [...article.querySelectorAll('h1, h2, h3, h4, h5, h6')]
  .map((heading) => {
    const text = heading.textContent?.trim().replace(/\s+/g, ' ') ?? ''
    if (!text) {
      heading.remove()
      return null
    }
    const id = slugify(text)
    heading.id = id
    heading.setAttribute('tabindex', '-1')
    return {
      id,
      text,
      level: Number(heading.tagName.slice(1)),
    }
  })
  .filter(Boolean)

article.querySelectorAll('img').forEach((image) => {
  const parentText = image.parentElement?.nextElementSibling?.textContent?.trim()
  image.alt = parentText?.startsWith('Gambar') ? parentText : 'Tampilan Karirhub'
  image.loading = 'lazy'
  image.decoding = 'async'
})

article.querySelectorAll('a').forEach((link) => {
  const href = link.getAttribute('href')
  if (href?.startsWith('http')) {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noreferrer')
  }
})

article.querySelectorAll('p').forEach((paragraph) => {
  if (!paragraph.textContent?.trim() && !paragraph.querySelector('img')) {
    paragraph.remove()
  }
})

const html = article.innerHTML
  .replaceAll('\uFFFD', '–')
  .replaceAll('�', '–')
  .trim()

const metadata = {
  title: 'Panduan Penggunaan dan Operasional Karirhub',
  subtitle: 'Handbook Admin Karirhub Console dan Manualbook Pengguna Karirhub',
  version: '1.0',
  updatedAt: '21 Oktober 2026',
  headings,
  imageCount: writtenImages.size,
}

await writeFile(path.join(contentDir, 'manual.html'), `${html}\n`, 'utf8')
await writeFile(
  path.join(contentDir, 'manual-meta.json'),
  `${JSON.stringify(metadata, null, 2)}\n`,
  'utf8',
)

console.log(
  `Converted ${headings.length} headings and ${writtenImages.size} unique images from ${sourcePath}`,
)

if (result.messages.length > 0) {
  console.log('Conversion notes:')
  result.messages.forEach((message) => console.log(`- ${message.message}`))
}
