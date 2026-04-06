import { NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import { MaintenancePDFDocument } from '@/lib/formia-pdf'
import React from 'react'

export async function POST(request) {
  try {
    const { formData, entity, documentType } = await request.json()

    const pdfDoc = React.createElement(MaintenancePDFDocument, { formData, entity })
    const pdfBuffer = await ReactPDF.renderToBuffer(pdfDoc)

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
