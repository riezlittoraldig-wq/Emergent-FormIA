# ⚠️ SÉCURITÉ - Action requise

## Token GitHub à révoquer

Le token GitHub `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` a été utilisé pour pousser le code.

**Action à faire IMMÉDIATEMENT :**

1. Allez sur https://github.com/settings/tokens
2. Trouvez le token utilisé
3. **Révoquez-le** (Revoke)
4. Créez un nouveau token si nécessaire

## Fichier .env

Le fichier `.env` contenant vos credentials Supabase a été poussé sur GitHub dans le premier commit.

**Actions de sécurité :**

1. ✅ `.env` ajouté au `.gitignore` (fait)
2. ✅ `.env.example` créé (fait)
3. ⚠️ Considérez régénérer vos clés Supabase (optionnel mais recommandé)
4. ⚠️ Supprimez `.env` de l'historique Git (optionnel, commande ci-dessous)

### Supprimer .env de l'historique Git (optionnel)

```bash
cd /app
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

**Note :** Cette opération réécrit l'historique Git. À faire uniquement si vous êtes le seul à travailler sur le projet.

---

**Date :** 8 avril 2025  
**Créé automatiquement lors de la configuration Git**
