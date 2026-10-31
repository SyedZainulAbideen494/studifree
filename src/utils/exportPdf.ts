import jsPDF from 'jspdf'
import type { ExplainResult } from '../services/gemini/explain'

export function exportLessonPdf(result: ExplainResult, topic: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  let y = margin
  const pageHeight = doc.internal.pageSize.getHeight()
  const width = doc.internal.pageSize.getWidth() - margin * 2

  const write = (text: string, size = 11, bold = false, space = 6) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, width)
    for (const line of lines) {
      if (y > pageHeight - margin) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += size + 2
    }
    y += space
  }

  write(result.title || topic, 18, true, 10)
  write(result.definition, 12, false, 10)
  for (const s of result.sections) {
    write(s.heading, 13, true, 4)
    write(s.content.replace(/[#*`$]/g, ''), 11, false, 8)
  }
  if (result.importantPoints?.length) {
    write('Important points', 13, true, 4)
    result.importantPoints.forEach((p) => write('• ' + p, 11, false, 2))
    y += 6
  }
  if (result.commonMisconceptions?.length) {
    write('Common misconceptions', 13, true, 4)
    result.commonMisconceptions.forEach((p) => write('• ' + p, 11, false, 2))
    y += 6
  }
  if (result.memoryTrick) write('Memory trick: ' + result.memoryTrick, 11, true, 8)
  if (result.knowledgeCheck) {
    write('Knowledge check', 13, true, 4)
    write(result.knowledgeCheck.question, 11, false, 4)
    result.knowledgeCheck.options.forEach((o) => write('  ' + o, 11, false, 2))
    write('Answer: ' + result.knowledgeCheck.correctAnswer, 11, true, 2)
    write(result.knowledgeCheck.explanation, 11, false, 8)
  }
  doc.save(`${(result.title || topic).replace(/\s+/g, '_')}.pdf`)
}
