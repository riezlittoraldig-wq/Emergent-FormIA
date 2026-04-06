import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #E63946',
    paddingBottom: 15
  },
  logo: {
    width: 120,
    marginBottom: 10
  },
  agencyInfo: {
    fontSize: 8,
    color: '#333',
    marginBottom: 3,
    textAlign: 'center'
  },
  titleSection: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  documentNumber: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center'
  },
  clientName: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    fontWeight: 'bold'
  },
  infoBox: {
    border: '2px solid #E63946',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 120,
    color: '#E63946'
  },
  infoValue: {
    flex: 1,
    color: '#333'
  },
  sectionTitle: {
    backgroundColor: '#E63946',
    color: '#ffffff',
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 5
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  photoContainer: {
    width: '48%',
    border: '2px solid #E63946',
    borderRadius: 5,
    padding: 5
  },
  photo: {
    width: '100%',
    height: 150,
    objectFit: 'cover'
  },
  transformateurBox: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15
  },
  transformateurRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  transformateurLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
    width: 100
  },
  transformateurValue: {
    color: '#ffffff',
    flex: 1
  },
  celluleBox: {
    border: '1px solid #E63946',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  celluleRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  celluleLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#E63946'
  },
  celluleValue: {
    flex: 1,
    color: '#333'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1px solid #ccc',
    paddingTop: 10
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 10,
    color: '#666'
  }
})

export function MaintenancePDFDocument({ formData, entity }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <Document>
      {/* Page 1: Informations générales */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {entity.logo_url && (
            <Image src={entity.logo_url} style={styles.logo} />
          )}
          {entity.contact_info?.agency && (
            <Text style={styles.agencyInfo}>{entity.contact_info.agency}</Text>
          )}
          {entity.contact_info?.service && (
            <Text style={styles.agencyInfo}>{entity.contact_info.service}</Text>
          )}
          {entity.contact_info?.address && (
            <Text style={styles.agencyInfo}>
              {entity.contact_info.address}, {entity.contact_info.postal_code} {entity.contact_info.city}
            </Text>
          )}
          {entity.contact_info?.phone && entity.contact_info?.email && (
            <Text style={styles.agencyInfo}>
              Tél. : {entity.contact_info.phone} | Mail : {entity.contact_info.email}
            </Text>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>RAPPORT DE MAINTENANCE HT/BT</Text>
          <Text style={styles.documentNumber}>N°{formData.documentNumber}</Text>
        </View>

        {/* Client Name */}
        <Text style={styles.clientName}>{formData.clientName}</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° d'affaire :</Text>
            <Text style={styles.infoValue}>{formData.numeroAffaire}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>{formatDate(formData.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Intervenant :</Text>
            <Text style={styles.infoValue}>{formData.intervenant}</Text>
          </View>
          {formData.contactName && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact sur site :</Text>
                <Text style={styles.infoValue}>{formData.contactName}</Text>
              </View>
              {formData.contactPhone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}></Text>
                  <Text style={styles.infoValue}>{formData.contactPhone}</Text>
                </View>
              )}
              {formData.contactEmail && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}></Text>
                  <Text style={styles.infoValue}>{formData.contactEmail}</Text>
                </View>
              )}
            </>
          )}
          {formData.address && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse :</Text>
                <Text style={styles.infoValue}>{formData.address}</Text>
              </View>
              {(formData.postalCode || formData.city) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}></Text>
                  <Text style={styles.infoValue}>
                    {formData.postalCode} {formData.city}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {entity.contact_info?.agency} - {entity.contact_info?.address} {entity.contact_info?.postal_code} {entity.contact_info?.city}
          </Text>
          <Text>
            Tél : {entity.contact_info?.phone} | Mail : {entity.contact_info?.email}
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Page 2: Photos avant intervention */}
      {formData.photosAvant && formData.photosAvant.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>PHOTOS AVANT INTERVENTION</Text>
          <View style={styles.photosGrid}>
            {formData.photosAvant.slice(0, 4).map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image src={photo.base64 || photo.preview || photo.url} style={styles.photo} />
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <Text>
              {entity.contact_info?.agency} - {entity.contact_info?.address} {entity.contact_info?.postal_code} {entity.contact_info?.city}
            </Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 3: Transformateur */}
      {formData.transformateur && (formData.transformateur.marque || formData.transformateur.puissance) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>TRANSFORMATEUR</Text>
          <View style={styles.transformateurBox}>
            {formData.transformateur.marque && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Marque :</Text>
                <Text style={styles.transformateurValue}>{formData.transformateur.marque}</Text>
              </View>
            )}
            {formData.transformateur.puissance && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Puissance :</Text>
                <Text style={styles.transformateurValue}>{formData.transformateur.puissance}</Text>
              </View>
            )}
            {formData.transformateur.annee && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Année :</Text>
                <Text style={styles.transformateurValue}>{formData.transformateur.annee}</Text>
              </View>
            )}
            {formData.transformateur.numeroOrigine && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>N° d'origine :</Text>
                <Text style={styles.transformateurValue}>{formData.transformateur.numeroOrigine}</Text>
              </View>
            )}
            {formData.transformateur.reference && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Référence :</Text>
                <Text style={styles.transformateurValue}>{formData.transformateur.reference}</Text>
              </View>
            )}
          </View>
          {formData.transformateur.photo && (
            <View style={{ marginTop: 20 }}>
              <Image 
                src={formData.transformateur.photo.base64 || formData.transformateur.photo.preview || formData.transformateur.photo.url} 
                style={{ width: 250, height: 200, objectFit: 'contain' }}
              />
            </View>
          )}
          <View style={styles.footer}>
            <Text>
              {entity.contact_info?.agency} - {entity.contact_info?.address} {entity.contact_info?.postal_code} {entity.contact_info?.city}
            </Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 4+: Cellules protection */}
      {formData.cellulesProtection && formData.cellulesProtection.filter(c => c.marque || c.type).length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>CELLULE PROTECTION HT</Text>
          {formData.cellulesProtection.filter(c => c.marque || c.type).map((cellule, index) => (
            <View key={index} style={styles.celluleBox}>
              <View style={styles.celluleRow}>
                <Text style={styles.celluleLabel}>Marque :</Text>
                <Text style={styles.celluleValue}>{cellule.marque}</Text>
              </View>
              {cellule.type && (
                <View style={styles.celluleRow}>
                  <Text style={styles.celluleLabel}>Type :</Text>
                  <Text style={styles.celluleValue}>{cellule.type}</Text>
                </View>
              )}
              {cellule.reference && (
                <View style={styles.celluleRow}>
                  <Text style={styles.celluleLabel}>Référence :</Text>
                  <Text style={styles.celluleValue}>{cellule.reference}</Text>
                </View>
              )}
              {cellule.designation && (
                <View style={styles.celluleRow}>
                  <Text style={styles.celluleLabel}>Désignation :</Text>
                  <Text style={styles.celluleValue}>{cellule.designation}</Text>
                </View>
              )}
              {cellule.observations && (
                <View style={styles.celluleRow}>
                  <Text style={styles.celluleLabel}>Observations :</Text>
                  <Text style={styles.celluleValue}>{cellule.observations}</Text>
                </View>
              )}
              {cellule.photo && (
                <View style={{ marginTop: 10 }}>
                  <Image 
                    src={cellule.photo.preview || cellule.photo.url} 
                    style={{ width: 150, height: 120, objectFit: 'contain' }}
                  />
                </View>
              )}
            </View>
          ))}
          <View style={styles.footer}>
            <Text>
              {entity.contact_info?.agency} - {entity.contact_info?.address} {entity.contact_info?.postal_code} {entity.contact_info?.city}
            </Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}
    </Document>
  )
}
>
  )
}
