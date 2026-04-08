# FormIA - Notes sur l'architecture et le modèle de vente

## 💡 Réflexions utilisateur

### **Modèle de vente à affiner**

**Question clé** : Multi-agence ou mono-agence ?

#### **Option 1 : Une appli par agence** (Plus simple)
- Chaque agence achète sa propre instance FormIA
- Gestion simplifiée : 1 agence = 1 déploiement
- Les centres de travaux sont rattachés à cette agence unique
- Pas de gestion multi-entités nécessaire

**Architecture simplifiée** :
```
Instance FormIA (Agence Saint-Gilles)
├── Agence Saint-Gilles (principale)
├── Centre: St Gilles Indus (SGIX)
├── Centre: Sarlat (SAR)
└── Utilisateurs (techniciens de cette agence uniquement)
```

**Avantages** :
- Plus simple à vendre (500€/an par agence)
- Isolation totale des données
- Personnalisation par agence (logo, couleurs)
- Pas de complexité multi-tenant

**Inconvénients** :
- Plus de déploiements à gérer
- Pas de vision globale pour un groupe

---

#### **Option 2 : Multi-agence avec restriction par utilisateur** (Actuel)
- Une seule instance pour toutes les agences d'un groupe
- Les utilisateurs sont liés à une agence/centre
- Chaque utilisateur ne voit que ses données

**Architecture actuelle** :
```
Instance FormIA (Groupe AEB)
├── Entité: ALLEZ ENERGIES
│   ├── Agence: Saint-Gilles
│   │   ├── Centre: SGIX
│   │   └── Techniciens rattachés
│   └── Agence: Sarlat
├── Entité: AEB
└── Entité: CONTANT
```

**Avantages** :
- Vision globale pour le groupe
- Centralisation des données
- Facile d'ajouter des agences

**Inconvénients** :
- Plus complexe à gérer
- Risque de voir les données d'autres agences

---

### **Recommandation : Hybride**

**Vente par agence, mais architecture multi-agence optionnelle**

1. **Par défaut** : Une instance = Une agence + ses centres
2. **Option Premium** : Instance multi-agence pour les groupes

**Pricing** :
- **Mono-agence** : 500€/an + 60€/utilisateur
- **Multi-agence** (groupe) : 1500€/an + 50€/utilisateur

---

## 🎯 Parcours utilisateur idéal

### **Connexion et accès direct**

Actuellement, l'utilisateur doit :
1. Se connecter
2. Sélectionner une entité
3. Sélectionner une agence
4. Accéder au formulaire

**Amélioration proposée** :

L'utilisateur technicien devrait :
1. Se connecter
2. **Arriver directement sur la liste de ses documents/formulaires**
3. Cliquer sur "Nouveau rapport" ou ouvrir un brouillon

**Parcours simplifié** :
```
Login → Dashboard Technicien
├── 📋 Mes rapports en cours (brouillons)
├── 📄 Mes rapports complétés
└── ➕ Nouveau rapport
    ↓
    Formulaire pré-rempli avec :
    - Agence/Centre (automatique)
    - Technicien principal (automatique)
    - Sélection du chantier
```

---

## 🔧 Modifications à apporter

### **Phase 1 : Simplification mono-agence**

Si vous choisissez le modèle **une appli par agence** :

1. **Supprimer la sélection d'entité**
   - Configuration unique dans setup : 1 agence
   - Pas besoin de gérer plusieurs entités

2. **Simplifier la base**
   - Garder `formia_agencies` pour l'agence principale + centres
   - Supprimer ou simplifier `formia_entities`

3. **Page d'accueil utilisateur**
   - Dashboard avec liste des rapports
   - Accès direct au formulaire

4. **Setup initial**
   - Configuration de l'agence unique
   - Logo de l'agence
   - Liste des centres de travaux

---

### **Phase 2 : Dashboard utilisateur**

**Pour tous les rôles** :

**Technicien** :
- Mes rapports en cours
- Mes rapports complétés
- Nouveau rapport (bouton principal)
- Statistiques : heures travaillées ce mois

**Admin Agence** :
- Tous les rapports de l'agence
- Gestion des techniciens
- Gestion des centres
- Statistiques globales

**Super Admin** (si multi-agence) :
- Vue globale toutes agences
- Gestion utilisateurs
- Paramètres système

---

## 📝 Décisions à prendre

### **Questions pour l'utilisateur** :

1. **Modèle de vente** :
   - [ ] Une appli par agence (simple)
   - [ ] Multi-agence optionnel (complexe)
   - [ ] Hybride (mono par défaut, multi en premium)

2. **Page d'accueil** :
   - [ ] Dashboard avec liste rapports (recommandé)
   - [ ] Formulaire direct (actuel)

3. **Gestion des centres** :
   - [ ] Garder la hiérarchie Agence → Centres
   - [ ] Simplifier : tout au même niveau

4. **Priorité développement** :
   - [ ] Dashboard utilisateur (1-2h)
   - [ ] Système de licence d'abord
   - [ ] Mode hors ligne d'abord

---

## 🚀 Prochaines étapes recommandées

### **Court terme (cette semaine)** :
1. Tester l'authentification actuelle
2. Décider du modèle de vente (mono vs multi)
3. Créer un dashboard simple pour les techniciens

### **Moyen terme** :
1. Simplifier l'architecture selon le choix
2. Finir Phase 2B (sauvegarde + email)
3. Système de licence adapté au modèle choisi

---

**Dernière mise à jour** : 8 Avril 2026
**À discuter** : Modèle de vente et architecture cible
