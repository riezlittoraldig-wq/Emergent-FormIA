import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { MaintenancePDFDocument } from '@/lib/formia-pdf'
import React from 'react'

export async function POST(request) {
  try {
    const { formData, entity, documentType } = await request.json()

    const pdfDoc = React.createElement(MaintenancePDFDocument, { formData, entity })
    const stream = await renderToStream(pdfDoc)
    
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_${formData.documentNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}
