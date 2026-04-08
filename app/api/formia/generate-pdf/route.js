import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { MaintenancePDFDocument } from '@/lib/formia-pdf'
import { sendDocumentEmail } from '@/lib/formia-email'
import { getSupabaseCredentials, getEmailConfig } from '@/lib/formia-client-config'
import { createClient } from '@supabase/supabase-js'
import React from 'react'

// Charger les credentials Supabase depuis la config ou les variables d'environnement
const { url: supabaseUrl, anonKey: supabaseKey } = getSupabaseCredentials()
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
  try {
    const { formData, entity, agency, saveToDatabase = true, sendEmail = true, userId } = await request.json()

    // Générer le PDF
    const pdfDoc = React.createElement(MaintenancePDFDocument, { formData, entity })
    const stream = await renderToStream(pdfDoc)
    
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    let documentId = null
    let pdfUrl = null

    // Sauvegarder en base de données si demandé
    if (saveToDatabase) {
      // 1. Uploader le PDF sur Supabase Storage
      const fileName = `${formData.documentNumber}_${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('formia-assets')
        .upload(`documents/${fileName}`, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
      } else {
        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('formia-assets')
          .getPublicUrl(`documents/${fileName}`)
        
        pdfUrl = publicUrl
      }

      // 2. Sauvegarder le document dans formia_documents
      const { data: docData, error: docError } = await supabase
        .from('formia_documents')
        .insert({
          document_number: formData.documentNumber,
          entity_id: entity?.id || null,
          agency_id: agency?.id || null,
          document_type: 'maintenance_htbt',
          client_name: formData.clientName,
          chantier_id: formData.chantier?.id || null,
          data_json: formData,
          pdf_url: pdfUrl,
          status: 'completed',
          created_by: userId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (docError) {
        console.error('Document save error:', docError)
      } else {
        documentId = docData.id

        // 3. Sauvegarder les techniciens
        const techniciens = []
        
        // Technicien principal
        if (formData.technicienPrincipal?.user_id) {
          techniciens.push({
            document_id: documentId,
            user_id: formData.technicienPrincipal.user_id,
            role: 'principal',
            temps_intervention: parseFloat(formData.technicienPrincipal.temps_intervention) || null
          })
        }

        // Autres techniciens
        if (formData.autresTechniciens?.length > 0) {
          formData.autresTechniciens.forEach(tech => {
            if (tech.user_id) {
              techniciens.push({
                document_id: documentId,
                user_id: tech.user_id,
                role: 'intervenant',
                temps_intervention: parseFloat(tech.temps_intervention) || null
              })
            }
          })
        }

        if (techniciens.length > 0) {
          const { error: techError } = await supabase
            .from('formia_document_technicians')
            .insert(techniciens)

          if (techError) {
            console.error('Technicians save error:', techError)
          }
        }
      }
    }

    // Envoyer l'email automatiquement si demandé
    if (sendEmail && pdfUrl) {
      // Récupérer les emails destinataires
      const emailRecipients = []
      const emailCC = []

      // Email du responsable d'affaire (si défini dans le chantier)
      if (formData.responsableAffaire) {
        emailRecipients.push(formData.responsableAffaire)
      }

      // Emails supplémentaires du chantier
      if (formData.emailsDestinataires && formData.emailsDestinataires.length > 0) {
        emailRecipients.push(...formData.emailsDestinataires)
      }

      // Email de la secrétaire (depuis la config client ou variable d'environnement)
      const emailConfig = getEmailConfig()
      if (emailConfig.secretaire) {
        emailCC.push(emailConfig.secretaire)
      }

      if (emailRecipients.length > 0 || emailCC.length > 0) {
        await sendDocumentEmail({
          to: emailRecipients,
          cc: emailCC,
          subject: `Rapport d'intervention ${formData.documentNumber} - ${formData.clientName}`,
          documentNumber: formData.documentNumber,
          clientName: formData.clientName,
          chantier: formData.codeChantier,
          pdfUrl,
          pdfBuffer
        })
      }
    }

    // Retourner le PDF avec les métadonnées
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_${formData.documentNumber}.pdf"`,
        'X-Document-Id': documentId || '',
        'X-PDF-Url': pdfUrl || ''
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
