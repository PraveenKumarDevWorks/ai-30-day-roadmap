import pdfParse from 'pdf-parse'

interface UploadedFile {
  originalname: string
  mimetype: string
  buffer: Buffer
}

/**
 * Turns an uploaded file into plain text.
 * - PDF: uses the pdf-parse library to pull text out of the PDF's pages.
 * - Anything else (.txt, .md, etc.): just reads the raw bytes as UTF-8 text.
 */
export async function extractTextFromFile(file: UploadedFile): Promise<string> {
  const isPdf =
    file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')

  if (isPdf) {
    const parsed = await pdfParse(file.buffer)
    return parsed.text
  }

  return file.buffer.toString('utf-8')
}
