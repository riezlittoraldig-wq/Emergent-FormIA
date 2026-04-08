# Configuration des Centres de Travaux - FormIA

## ⚠️ Action requise : Créer la table dans Supabase

La table `formia_centres_travaux` doit être créée dans votre base de données Supabase avant d'utiliser cette fonctionnalité.

### Étapes à suivre :

1. **Ouvrir Supabase SQL Editor**
   - Allez sur : https://supabase.com/dashboard/project/cywwdjmzaytjreprgatf/editor
   - Ou depuis votre dashboard Supabase : `SQL Editor`

2. **Exécuter le script SQL suivant :**

```sql
-- Table des centres de travaux (rattachés aux agences)
CREATE TABLE IF NOT EXISTS formia_centres_travaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES formia_agencies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  responsable VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_formia_centres_agency ON formia_centres_travaux(agency_id);

-- Commentaire
COMMENT ON TABLE formia_centres_travaux IS 'Centres de travaux rattachés aux agences (surtout ALLEZ ENERGIES)';
```

3. **Cliquer sur "Run" pour exécuter le script**

### ✅ Vérification

Une fois le script exécuté :
- La table `formia_centres_travaux` apparaîtra dans votre liste de tables
- Vous pourrez utiliser l'onglet "Centres de travaux" dans FormIA Admin
- L'import Excel créera automatiquement les centres lors de l'import des agences

---

## 📋 Utilisation après création de la table

### Option 1 : Import Excel (recommandé)
Dans l'onglet **Agences**, utilisez l'import Excel avec le format :
- **Entité** : Nom de l'entité (ex: ALLEZ ENERGIES, AEB, LEMAIRE)
- **Nom de l'agence** : Nom complet de l'agence
- **Centre de travaux (code ERP)** : Code dans votre ERP (ex: SGIX, SAR) - Peut être vide
- **Centres de travaux** : Noms séparés par virgule (ex: "Centre Olonne, Centre Challans") - Optionnel
- **Adresse, Téléphone, Email** : Coordonnées de l'agence

Lors de l'import, les centres de travaux mentionnés seront automatiquement créés et liés à l'agence.

### Option 2 : Création manuelle
Dans l'onglet **Centres de travaux** :
1. Cliquez sur "Nouveau centre"
2. Sélectionnez l'agence de rattachement
3. Remplissez le code ERP (ex: SGIX pour St Gilles Indus)
4. Remplissez le nom et les autres informations
5. Enregistrez

---

## 🔧 Structure hiérarchique

```
Groupe AEB
├── Entité: ALLEZ ENERGIES
│   ├── Agence: Saint-Gilles-Croix-de-Vie
│   │   ├── Centre: St Gilles Indus (SGIX)
│   │   └── Centre: Les Sables d'Olonne
│   └── Agence: Sarlat
│       └── Centre: Sarlat (SAR)
├── Entité: AEB
│   └── Agence: AEB Nantes
└── Entité: LEMAIRE
    └── Agence: La Roche sur Yon
```

---

## 📝 Exemple de fichier Excel

| Entité | Nom de l'agence | Centres de travaux | Adresse | Code postal | Ville | Téléphone | Email |
|--------|-----------------|--------------------|---------|--------------|----|-----------|-------|
| ALLEZ ENERGIES | Agence Saint-Gilles | Centre Olonne, Centre Challans | 15 rue des Couvreurs | 85800 | SAINT GILLES CROIX DE VIE | 02.51.60.00.00 | stgilles@allez.fr |
| AEB | Agence Unique AEB | | 5 avenue du Commerce | 44100 | NANTES | 02.51.00.00.00 | contact@aeb.fr |

---

## 🚀 Prochaines étapes (une fois la table créée)

1. ✅ Importer vos agences via Excel (avec ou sans centres de travaux)
2. ✅ Gérer manuellement les centres de travaux dans l'onglet dédié
3. ✅ Lier les chantiers aux agences et centres de travaux
