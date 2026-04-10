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

    // LOG: Vérifier le format des contrôles
    console.log('=== DEBUG PDF GENERATION ===')
    console.log('controlesAccessoires type:', typeof formData.controlesAccessoires)
    console.log('controlesAccessoires[0]:', formData.controlesAccessoires?.[0])
    console.log('controlesAccessoires[0].label:', formData.controlesAccessoires?.[0]?.label)
    console.log('controlesAccessoires[0].label type:', typeof formData.controlesAccessoires?.[0]?.label)
    
    // Nettoyer les données pour éviter les objets React non sérialisables
    const cleanControles = (controles) => {
      if (!Array.isArray(controles)) return []
      
      return controles.map((c, idx) => {
        console.log(`Controle ${idx}:`, c, 'type:', typeof c)
        
        // Si c'est juste une string, créer l'objet
        if (typeof c === 'string') {
          return { label: c, vu: false, observations: '' }
        }
        
        // Si c'est un objet
        if (typeof c === 'object' && c !== null) {
          const label = c.label || c.toString()
          console.log(`  -> label extracted: "${label}" (type: ${typeof label})`)
          
          return {
            label: typeof label === 'string' ? label : String(label),
            vu: Boolean(c.vu),
            observations: typeof c.observations === 'string' ? c.observations : ''
          }
        }
        
        // Fallback
        return { label: String(c), vu: false, observations: '' }
      })
    }

    const cleanedFormData = {
      ...formData,
      controlesAccessoires: cleanControles(formData.controlesAccessoires),
      controlesDisjoncteurBT: cleanControles(formData.controlesDisjoncteurBT),
      controlesCellulesHTA: cleanControles(formData.controlesCellulesHTA),
      controlesTransformateur: cleanControles(formData.controlesTransformateur),
      controlesLocalPoste: cleanControles(formData.controlesLocalPoste)
    }
    
    console.log('Cleaned controlesAccessoires[0]:', cleanedFormData.controlesAccessoires?.[0])
    console.log('=== END DEBUG ===')

    // Générer le PDF avec les données nettoyées
    const pdfDoc = React.createElement(MaintenancePDFDocument, { formData: cleanedFormData, entity })
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
      try {
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
          // Continuer même si l'upload échoue
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
      } catch (dbError) {
        console.error('Database operation error:', dbError)
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
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
