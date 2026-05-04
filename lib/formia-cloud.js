/**
 * formia-cloud.js
 * Upload PDF vers Google Drive et/ou FTP
 * Côté serveur uniquement (API routes Next.js)
 */

// ─── Google Drive ─────────────────────────────────────────────────────────────

/**
 * Upload un buffer PDF vers Google Drive via Service Account
 * @param {Buffer} pdfBuffer
 * @param {string} fileName
 * @param {object} config { serviceAccountEmail, privateKey, folderId }
 * @returns {Promise<{ url: string, fileId: string }>}
 */
export async function uploadToGoogleDrive(pdfBuffer, fileName, config) {
  const { serviceAccountEmail, privateKey, folderId } = config

  if (!serviceAccountEmail || !privateKey || !folderId) {
    throw new Error('Configuration Google Drive incomplète (email, clé privée, dossier requis)')
  }

  // JWT pour le Service Account
  const jwt = await createServiceAccountJWT(serviceAccountEmail, privateKey)
  const accessToken = await getGoogleAccessToken(jwt)

  // Upload multipart vers Drive API v3
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/pdf'
  }

  const boundary = '-------FormIA_boundary'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadataPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
  const mediaPart = `Content-Type: application/pdf\r\n\r\n`

  // Construire le body multipart manuellement
  const encoder = new TextEncoder()
  const metaBytes = encoder.encode(delimiter + metadataPart + delimiter + mediaPart)
  const closeBytes = encoder.encode(closeDelimiter)

  const body = new Uint8Array(metaBytes.length + pdfBuffer.length + closeBytes.length)
  body.set(metaBytes, 0)
  body.set(new Uint8Array(pdfBuffer), metaBytes.length)
  body.set(closeBytes, metaBytes.length + pdfBuffer.length)

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': String(body.length)
      },
      body: body
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google Drive upload échoué : ${err}`)
  }

  const data = await response.json()
  return { url: data.webViewLink, fileId: data.id }
}

async function createServiceAccountJWT(email, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  // Encoder header + payload en base64url
  const header = { alg: 'RS256', typ: 'JWT' }
  const b64Header = base64url(JSON.stringify(header))
  const b64Payload = base64url(JSON.stringify(payload))
  const signingInput = `${b64Header}.${b64Payload}`

  // Signer avec la clé privée RSA via Web Crypto
  const cleanedKey = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const keyBuffer = Uint8Array.from(atob(cleanedKey), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const b64Sig = base64url(Buffer.from(signature).toString('binary'))
  return `${signingInput}.${b64Sig}`
}

async function getGoogleAccessToken(jwt) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Impossible d'obtenir le token Google : ${err}`)
  }

  const data = await response.json()
  return data.access_token
}

function base64url(str) {
  return btoa(typeof str === 'string' ? str : String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// ─── FTP / SFTP ───────────────────────────────────────────────────────────────

/**
 * Upload un buffer PDF vers un serveur FTP/SFTP
 * @param {Buffer} pdfBuffer
 * @param {string} fileName
 * @param {object} config { host, port, user, password, path, secure }
 */
export async function uploadToFTP(pdfBuffer, fileName, config) {
  const { host, port = 21, user, password, path = '/formia/', secure = false } = config

  if (!host || !user || !password) {
    throw new Error('Configuration FTP incomplète (host, user, password requis)')
  }

  // Import dynamique de basic-ftp (server-side only)
  const ftp = await import('basic-ftp')
  const client = new ftp.Client()
  client.ftp.verbose = false

  try {
    await client.access({
      host,
      port: Number(port),
      user,
      password,
      secure
    })

    // S'assurer que le dossier existe
    const remotePath = path.endsWith('/') ? path : `${path}/`
    await client.ensureDir(remotePath)
    await client.cd(remotePath)

    // Upload depuis un stream Buffer
    const { Readable } = await import('stream')
    const stream = Readable.from(pdfBuffer)
    await client.uploadFrom(stream, fileName)

    return { url: `ftp://${host}${remotePath}${fileName}` }
  } finally {
    client.close()
  }
}

// ─── Dispatcher principal ────────────────────────────────────────────────────

/**
 * Upload vers toutes les destinations cloud activées
 * @param {Buffer} pdfBuffer
 * @param {string} fileName
 * @param {object} cloudConfig — ligne de formia_cloud_config
 * @returns {Promise<{ drive?: object, ftp?: object, errors: string[] }>}
 */
export async function uploadToCloud(pdfBuffer, fileName, cloudConfig) {
  const results = { errors: [] }

  if (cloudConfig?.drive_enabled) {
    try {
      results.drive = await uploadToGoogleDrive(pdfBuffer, fileName, {
        serviceAccountEmail: cloudConfig.drive_service_account_email,
        privateKey: cloudConfig.drive_private_key,
        folderId: cloudConfig.drive_folder_id
      })
      console.log('[Cloud] Drive upload OK:', results.drive.url)
    } catch (err) {
      console.error('[Cloud] Drive upload échoué:', err.message)
      results.errors.push(`Google Drive : ${err.message}`)
    }
  }

  if (cloudConfig?.ftp_enabled) {
    try {
      results.ftp = await uploadToFTP(pdfBuffer, fileName, {
        host: cloudConfig.ftp_host,
        port: cloudConfig.ftp_port,
        user: cloudConfig.ftp_user,
        password: cloudConfig.ftp_password,
        path: cloudConfig.ftp_path,
        secure: cloudConfig.ftp_secure
      })
      console.log('[Cloud] FTP upload OK:', results.ftp.url)
    } catch (err) {
      console.error('[Cloud] FTP upload échoué:', err.message)
      results.errors.push(`FTP : ${err.message}`)
    }
  }

  return results
}
