export const TABLEAUX_CONTROLES = {
  accessoiresSecurite: {
    titre: 'Accessoires de sécurité',
    controles: [
      { label: 'Perche de sauvetage', index: 0 },
      { label: 'Perche vérification absence de tension', index: 1 },
      { label: 'Tabouret (ou tapis isolant)', index: 2 },
      { label: 'Bloc de secours', index: 3 },
      { label: 'Bloc portatif', index: 4 },
      { label: 'Jeux de fusibles de rechange', index: 5 },
      { label: 'Gants', index: 6 },
      { label: 'Extincteur', index: 7 },
      { label: 'Affiche poste', index: 8 },
      { label: 'Affiches obligatoires', index: 9 }
    ]
  },
  disjoncteurBT: {
    titre: 'Disjoncteur basse tension',
    controles: [
      { label: "Vérification de l'ensemble", index: 0 },
      { label: 'Dépoussiérage avec nettoyage général', index: 1 },
      { label: 'Vérification des prises de connexion', index: 2 },
      { label: 'Contrôle du serrage des borniers, visserie et jeux de barres', index: 3 },
      { label: 'Vérification des dispositifs de verrouillage et de sécurité', index: 4 },
      { label: 'Contrôle des mécanismes de débrochage et de coupure visible', index: 5 },
      { label: "Vérification de l'état des contacts et entretien", index: 6 },
      { label: 'Vérification du fonctionnement des mécanismes', index: 7 },
      { label: 'Vérification du relayage', index: 8 },
      { label: 'Remise sous tension et essais', index: 9 },
      { label: 'Observations générales', index: 10 }
    ]
  },
  cellulesHTA: {
    titre: 'Cellules HTA',
    controles: [
      { label: 'Consignation de poste', index: 0 },
      { label: "Vérification visuelle de l'ensemble", index: 1 },
      { label: 'Dépoussiérage et nettoyage général intérieur et extérieur', index: 2 },
      { label: 'Manoeuvre et graissage des organes mobiles', index: 3 },
      { label: 'Contrôle du serrage des borniers, visserie et jeux de barres', index: 4 },
      { label: "Contrôle de l'état des isolateurs et traversées", index: 5 },
      { label: 'Vérification du fonctionnement des mécanismes', index: 6 },
      { label: 'Essais manuels du système mécanique de déclenchement', index: 7 },
      { label: "Contrôle de l'état des têtes de câbles", index: 8 },
      { label: 'Contrôle avant consignation et après remise en service des voyants capacitifs', index: 9 },
      { label: 'Vérification des dispositifs de verrouillage et de sécurité', index: 10 },
      { label: 'Remise sous tension et essais', index: 11 },
      { label: 'Observations générales', index: 12 }
    ]
  },
  transformateur: {
    titre: 'Transformateur',
    controles: [
      { label: "Examen visuel d'étanchéité", index: 0 },
      { label: 'Nettoyage et dépoussiérage', index: 1 },
      { label: "Contrôle de l'étanchéité du joint de couvercle et du DGPT2", index: 2 },
      { label: 'Contrôle et serrage des connexions BT', index: 3 },
      { label: "Contrôle de l'efficacité de l'interverrouillage mécanique", index: 4 },
      { label: 'Observations générales', index: 5 }
    ]
  },
  localPoste: {
    titre: 'Local poste de transformation',
    controles: [
      { label: 'Contrôle des accessoires de sécurité', index: 0 },
      { label: 'Contrôle de la date de péremption des fusibles de rechange', index: 1 },
      { label: 'Nettoyage et dépoussiérage', index: 2 },
      { label: 'Observations générales', index: 3 }
    ]
  }
}
