# FormIA - Configuration Simplifiée Agences/Centres de travaux

## 📋 **Vue d'ensemble**

La gestion a été **simplifiée** : au lieu d'avoir une hiérarchie complexe (Entité → Agence → Centre), nous avons maintenant une structure unique :

```
Entité → Agence/Centre (avec champ Type)
```

Chaque **agence** ou **centre de travaux** est géré de la même manière avec :
- Un **code ERP unique** (SGCV, SGIX, SAR, AEB01, etc.)
- Un **type** : "Agence" ou "Centre de travaux"
- Un lien optionnel vers l'**agence parente** (pour les centres uniquement)

---

## ⚠️ **ACTION REQUISE : Mettre à jour la table dans Supabase**

Avant d'utiliser cette nouvelle structure, vous devez exécuter le script SQL suivant dans **Supabase SQL Editor** :

### **URL** : https://supabase.com/dashboard/project/cywwdjmzaytjreprgatf/editor

### **Script SQL à exécuter** :

```sql
-- Ajouter le champ 'type' pour différencier Agence et Centre de travaux
ALTER TABLE formia_agencies 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'agence' CHECK (type IN ('agence', 'centre'));

-- Ajouter le champ 'parent_agency_id' pour lier un centre à son agence principale
ALTER TABLE formia_agencies 
ADD COLUMN IF NOT EXISTS parent_agency_id UUID REFERENCES formia_agencies(id) ON DELETE SET NULL;

-- Index pour performance sur parent_agency_id
CREATE INDEX IF NOT EXISTS idx_formia_agencies_parent ON formia_agencies(parent_agency_id);

-- Mettre à jour toutes les agences existantes en tant que type 'agence' (par défaut)
UPDATE formia_agencies SET type = 'agence' WHERE type IS NULL;

-- Commentaires
COMMENT ON COLUMN formia_agencies.type IS 'Type: agence (principale) ou centre (de travaux)';
COMMENT ON COLUMN formia_agencies.parent_agency_id IS 'Agence principale de rattachement (pour les centres de travaux)';
```

---

## 🎯 **Utilisation**

### **1. Import Excel (Recommandé)**

#### **Format du fichier Excel** :

| Entité | Code ERP | Nom | Type | Code agence parente | Adresse | Code postal | Ville | Téléphone | Email |
|--------|----------|-----|------|---------------------|---------|-------------|-------|-----------|-------|
| ALLEZ ENERGIES | SGCV | Saint-Gilles-Croix-de-Vie | agence | | 15 rue des Couvreurs | 85800 | SAINT GILLES CROIX DE VIE | 02.51.60.00.00 | stgilles@allez.fr |
| ALLEZ ENERGIES | SGIX | St Gilles Indus | centre | SGCV | | | | | |
| ALLEZ ENERGIES | SAR | Sarlat | centre | SGCV | | | | | |
| AEB | AEB01 | Agence Unique AEB | agence | | 5 avenue du Commerce | 44100 | NANTES | 02.51.00.00.00 | contact@aeb.fr |

#### **Colonnes obligatoires** :
- `Entité` : Nom de l'entité (ex: ALLEZ ENERGIES, AEB, CONTANT)
- `Code ERP` : Code unique (ex: SGCV, SGIX, SAR)
- `Nom` : Nom de l'agence ou du centre
- `Type` : "agence" ou "centre"

#### **Colonnes optionnelles** :
- `Code agence parente` : Code ERP de l'agence principale (uniquement pour les centres)
- Adresse, Téléphone, Email, etc.

#### **Comment importer** :
1. Allez dans l'onglet **Agences** de l'Admin
2. Cliquez sur **"Télécharger le template"** pour avoir un exemple
3. Remplissez votre fichier Excel
4. Glissez-déposez le fichier dans la zone d'import
5. Vérifiez l'aperçu
6. Cliquez sur **"Importer les données"**

---

### **2. Création manuelle**

Dans l'onglet **Agences** :

1. Cliquez sur **"Nouvelle agence/centre"**
2. Remplissez les champs :
   - **Nom** : Saint-Gilles-Croix-de-Vie ou St Gilles Indus
   - **Code ERP** : SGCV, SGIX, SAR...
   - **Type** : Agence ou Centre de travaux
   - Si **Type = Centre**, sélectionnez l'**Agence parente** dans le dropdown
   - Adresse, Téléphone, Email (optionnels)
3. Cliquez sur **"Enregistrer"**

---

## 📊 **Structure hiérarchique**

```
Groupe AEB
├── Entité: ALLEZ ENERGIES
│   ├── Agence: Saint-Gilles-Croix-de-Vie (SGCV) [Type: Agence]
│   ├── Centre: St Gilles Indus (SGIX) [Type: Centre, Parent: SGCV]
│   └── Centre: Sarlat (SAR) [Type: Centre, Parent: SGCV]
├── Entité: AEB
│   └── Agence: Agence Unique AEB (AEB01) [Type: Agence]
└── Entité: CONTANT
    └── Agence: Agence Unique CONTANT (CTN01) [Type: Agence]
```

---

## 🔐 **Gestion des accès (Future)**

Plus tard, le **super admin** pourra :
- Assigner des utilisateurs à une agence ou un centre spécifique
- Donner accès à un administrateur d'agence pour voir tous les centres rattachés
- Gérer les permissions par entité/agence/centre

---

## ✅ **Avantages de cette simplification**

1. **Plus simple** : Une seule table au lieu de deux
2. **Plus flexible** : Chaque entrée a son code ERP unique
3. **Facile à gérer** : Import Excel unifié
4. **Évolutif** : Possibilité d'ajouter facilement des niveaux hiérarchiques plus tard

---

## 🚀 **Prochaines étapes**

Une fois la table mise à jour dans Supabase :
1. ✅ Importer vos agences via Excel
2. ✅ Créer des centres de travaux manuellement ou via import
3. ✅ Lier les chantiers aux agences/centres
4. 🔜 Implémenter l'authentification et la gestion des accès
5. 🔜 Ajouter la gestion des techniciens et rapports
