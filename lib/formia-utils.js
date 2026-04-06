// Helper pour convertir les fichiers en base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Convertir toutes les photos d'un formulaire en base64
export const convertFormPhotosToBase64 = async (formData) => {
  const converted = { ...formData }

  // Convertir photos avant intervention
  if (converted.photosAvant && converted.photosAvant.length > 0) {
    converted.photosAvant = await Promise.all(
      converted.photosAvant.map(async (photo) => {
        if (photo.file) {
          const base64 = await fileToBase64(photo.file)
          return { ...photo, base64, preview: base64 }
        }
        return photo
      })
    )
  }

  // Convertir photo transformateur
  if (converted.transformateur?.photo?.file) {
    const base64 = await fileToBase64(converted.transformateur.photo.file)
    converted.transformateur.photo = {
      ...converted.transformateur.photo,
      base64,
      preview: base64
    }
  }

  // Convertir photos cellules protection
  if (converted.cellulesProtection && converted.cellulesProtection.length > 0) {
    converted.cellulesProtection = await Promise.all(
      converted.cellulesProtection.map(async (cellule) => {
        if (cellule.photo?.file) {
          const base64 = await fileToBase64(cellule.photo.file)
          return {
            ...cellule,
            photo: {
              ...cellule.photo,
              base64,
              preview: base64
            }
          }
        }
        return cellule
      })
    )
  }

  return converted
}
