import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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
  sectionTitlePage: {
    backgroundColor: '#E63946',
    color: '#ffffff',
    padding: 30,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 200
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
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #ccc',
    padding: 8,
    minHeight: 30
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    borderBottom: '2px solid #E63946'
  },
  tableColCheck: {
    width: '10%',
    textAlign: 'center'
  },
  tableColLabel: {
    width: '50%'
  },
  tableColObs: {
    width: '40%'
  },
  checkmark: {
    color: '#E63946',
    fontSize: 12,
    fontWeight: 'bold'
  },
  observationsBox: {
    border: '1px solid #E63946',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    minHeight: 100
  },
  signaturesBox: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20
  },
  signatureSection: {
    flex: 1,
    border: '1px solid #E63946',
    padding: 15,
    borderRadius: 5,
    minHeight: 80
  },
  signatureLabel: {
    fontWeight: 'bold',
    color: '#E63946',
    marginBottom: 10
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
  },
  techniciensBox: {
    border: '2px solid #2563eb',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#eff6ff'
  },
  techniciensTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10
  },
  technicienRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1px solid #cbd5e1'
  },
  technicienName: {
    flex: 1,
    color: '#333',
    fontSize: 10
  },
  technicienRole: {
    width: 80,
    fontSize: 9,
    color: '#1e40af',
    fontWeight: 'bold'
  },
  technicienTemps: {
    width: 60,
    fontSize: 10,
    color: '#333',
    textAlign: 'right'
  },
  tempsTotal: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2px solid #1e40af'
  },
  tempsTotalLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  tempsTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af'
  }
})

export function MaintenancePDFDocument({ formData, entity }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text>
        {entity.contact_info?.agency} - {entity.contact_info?.address} {entity.contact_info?.postal_code} {entity.contact_info?.city}
      </Text>
      <Text>
        Tél : {entity.contact_info?.phone} | Mail : {entity.contact_info?.email}
      </Text>
    </View>
  )

  return (
    <Document>
      {/* Page 1: Informations générales */}
      <Page size="A4" style={styles.page}>
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

        <View style={styles.titleSection}>
          <Text style={styles.titleText}>RAPPORT DE MAINTENANCE HT/BT</Text>
          <Text style={styles.documentNumber}>N°{formData.documentNumber}</Text>
        </View>

        <Text style={styles.clientName}>{formData.clientName}</Text>

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

        {/* Section Techniciens Intervenants */}
        {(formData.technicienPrincipal || formData.autresTechniciens?.length > 0) && (
          <View style={styles.techniciensBox}>
            <Text style={styles.techniciensTitle}>TECHNICIENS INTERVENANTS</Text>
            
            {/* Technicien principal */}
            {formData.technicienPrincipal && (formData.technicienPrincipal.prenom || formData.technicienPrincipal.nom) && (
              <View style={styles.technicienRow}>
                <Text style={styles.technicienRole}>Principal</Text>
                <Text style={styles.technicienName}>
                  {formData.technicienPrincipal.prenom} {formData.technicienPrincipal.nom}
                </Text>
                {formData.technicienPrincipal.temps_intervention && (
                  <Text style={styles.technicienTemps}>
                    {formData.technicienPrincipal.temps_intervention}h
                  </Text>
                )}
              </View>
            )}

            {/* Autres techniciens */}
            {formData.autresTechniciens?.map((tech, index) => (
              tech.prenom && tech.nom && (
                <View key={index} style={styles.technicienRow}>
                  <Text style={styles.technicienRole}>Intervenant</Text>
                  <Text style={styles.technicienName}>
                    {tech.prenom} {tech.nom}
                  </Text>
                  {tech.temps_intervention && (
                    <Text style={styles.technicienTemps}>
                      {tech.temps_intervention}h
                    </Text>
                  )}
                </View>
              )
            ))}

            {/* Temps total */}
            {(formData.technicienPrincipal?.temps_intervention || formData.autresTechniciens?.some(t => t.temps_intervention)) && (
              <View style={styles.tempsTotal}>
                <Text style={styles.tempsTotalLabel}>TEMPS TOTAL D'INTERVENTION</Text>
                <Text style={styles.tempsTotalValue}>
                  {(
                    parseFloat(formData.technicienPrincipal?.temps_intervention || 0) +
                    (formData.autresTechniciens?.reduce((sum, t) => sum + parseFloat(t.temps_intervention || 0), 0) || 0)
                  ).toFixed(1)}h
                </Text>
              </View>
            )}
          </View>
        )}


        <Footer />
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
          <Footer />
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
          <Footer />
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 4: Cellules Protection HT */}
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
                    src={cellule.photo.base64 || cellule.photo.preview || cellule.photo.url} 
                    style={{ width: 150, height: 120, objectFit: 'contain' }}
                  />
                </View>
              )}
            </View>
          ))}
          <Footer />
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 5: Disjoncteur général basse tension */}
      {formData.disjoncteurGeneral && (formData.disjoncteurGeneral.marque || formData.disjoncteurGeneral.type) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>DISJONCTEUR GENERAL BASSE TENSION</Text>
          <View style={styles.transformateurBox}>
            {formData.disjoncteurGeneral.marque && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Marque :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.marque}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.type && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Type :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.type}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.numeroSerie && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>N° série :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.numeroSerie}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.norme && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Norme :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.norme}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.familleDeclencheur && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Famille décl. :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.familleDeclencheur}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.typeDeclencheur && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Type décl. :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.typeDeclencheur}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.pouvoirCoupure && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Pouvoir coupure :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.pouvoirCoupure}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.in && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>In :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.in}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.nombrePoles && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Nb pôles :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.nombrePoles}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.paramProtection && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Param. prot. :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.paramProtection}</Text>
              </View>
            )}
            {formData.disjoncteurGeneral.divers && (
              <View style={styles.transformateurRow}>
                <Text style={styles.transformateurLabel}>Divers :</Text>
                <Text style={styles.transformateurValue}>{formData.disjoncteurGeneral.divers}</Text>
              </View>
            )}
          </View>
          {formData.disjoncteurGeneral.photo && (
            <View style={{ marginTop: 20 }}>
              <Image 
                src={formData.disjoncteurGeneral.photo.base64 || formData.disjoncteurGeneral.photo.preview || formData.disjoncteurGeneral.photo.url} 
                style={{ width: 250, height: 200, objectFit: 'contain' }}
              />
            </View>
          )}
          <Footer />
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 6: Page de séparation CONTRÔLES */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitlePage}>CONTRÔLES</Text>
        <Footer />
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Pages 7-9: Tableaux de contrôles */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>ACCESSOIRES DE SÉCURITÉ</Text>
        <ControleTable data={formData.controlesAccessoires} />
        
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>DISJONCTEUR BASSE TENSION</Text>
        <ControleTable data={formData.controlesDisjoncteurBT} />
        
        <Footer />
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>CELLULES HTA</Text>
        <ControleTable data={formData.controlesCellulesHTA} />
        
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>TRANSFORMATEUR</Text>
        <ControleTable data={formData.controlesTransformateur} />
        
        <Footer />
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>LOCAL POSTE DE TRANSFORMATION</Text>
        <ControleTable data={formData.controlesLocalPoste} />
        
        <Footer />
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Page 10: Photos après intervention */}
      {formData.photosApres && formData.photosApres.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>PHOTOS APRÈS INTERVENTION</Text>
          <View style={styles.photosGrid}>
            {formData.photosApres.slice(0, 4).map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image src={photo.base64 || photo.preview || photo.url} style={styles.photo} />
              </View>
            ))}
          </View>
          <Footer />
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Page 11: Observations et Signatures */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>OBSERVATIONS PARTICULIÈRES</Text>
        <View style={styles.observationsBox}>
          <Text>{formData.observationsSignatures?.observations || ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>SIGNATURES</Text>
        <View style={styles.signaturesBox}>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLabel}>Intervenant</Text>
            <Text style={{ marginTop: 40 }}>{formData.observationsSignatures?.signatureIntervenant || ''}</Text>
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLabel}>Client</Text>
            <Text style={{ marginTop: 40 }}>{formData.observationsSignatures?.signatureClient || ''}</Text>
          </View>
        </View>

        <Footer />
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  )
}

// Composant pour les tableaux de contrôles
function ControleTable({ data }) {
  // Afficher le tableau même si vide, pour montrer les cases non cochées
  if (!data) return null
  
  return (
    <View style={{ marginBottom: 20 }}>
      {data.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={styles.tableColCheck}>
            <Text style={styles.checkmark}>{item.vu ? '☑' : '☐'}</Text>
          </View>
          <View style={styles.tableColObs}>
            <Text>{item.label || item.observations || '-'}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
