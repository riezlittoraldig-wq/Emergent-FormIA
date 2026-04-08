import nodemailer from 'nodemailer'
import { getSmtpConfig, getOrganizationName } from './formia-client-config'

// Configuration SMTP dynamique depuis client.json ou variables d'environnement
export function createEmailTransporter() {
  const smtpConfig = getSmtpConfig()
  
  if (!smtpConfig.enabled || !smtpConfig.user || !smtpConfig.password) {
    throw new Error('Configuration SMTP non disponible ou incomplète')
  }

  return nodemailer.createTransporter({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.password
    }
  })
}

export async function sendDocumentEmail({ 
  to, 
  cc, 
  subject, 
  documentNumber,
  clientName,
  chantier,
  pdfUrl,
  pdfBuffer 
}) {
  try {
    const transporter = createEmailTransporter()
    const smtpConfig = getSmtpConfig()
    const orgName = getOrganizationName()

    const mailOptions = {
      from: `"FormIA - ${orgName}" <${smtpConfig.user}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      subject: subject || `Rapport d'intervention ${documentNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;"><span style="color: white;">Form</span><span style="color: #fca5a5;">IA</span></h1>
              <p style="margin:10px 0 0 0; font-size: 12px;">by RLD</p>
            </div>
            <div class="content">
              <h2 style="color: #dc2626;">Nouveau rapport d'intervention</h2>
              <p>Bonjour,</p>
              <p>Vous trouverez ci-joint le rapport d'intervention pour le chantier suivant :</p>
              
              <div class="info-box">
                <p><strong>📋 N° Rapport :</strong> ${documentNumber}</p>
                <p><strong>👤 Client :</strong> ${clientName || 'N/A'}</p>
                ${chantier ? `<p><strong>🏗️ Chantier :</strong> ${chantier}</p>` : ''}
                <p><strong>📅 Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>

              ${pdfUrl ? `<a href="${pdfUrl}" class="button">📥 Télécharger le PDF</a>` : ''}

              <p>Le rapport complet est disponible en pièce jointe de cet email.</p>
              
              <p style="margin-top: 30px;">Cordialement,<br>
              <strong>L'équipe FormIA</strong></p>
            </div>
            <div class="footer">
              <p>Cet email a été généré automatiquement par FormIA - Générateur de formulaires professionnels</p>
              <p style="font-size: 10px; color: #999;">by RLD - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `Rapport_${documentNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}
