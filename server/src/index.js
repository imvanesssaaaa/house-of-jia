
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { pool } from './db.js'
import multer from 'multer'
import cloudinary from './cloudinary.js'
import { Readable } from 'node:stream'

const photoshootUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB per image
    files: 10, // Allow up to 10 images per photoshoot
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error('Only JPG, PNG, and WebP images are allowed.')
      );
    }

    cb(null, true);
  },
});

const productDownloadPngUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'image/png') {
      return cb(new Error('The downloadable product file must be a PNG with a transparent background.'))
    }
    cb(null, true)
  },
})

const modelApplicationPhotosUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WebP photos are allowed.'))
    }
    cb(null, true)
  },
})

const app = express()
const PORT = Number(process.env.PORT || 3000)

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set a strong JWT_SECRET in server/.env')
}

if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL is missing from server/.env')
}

app.disable('x-powered-by')
app.use(helmet())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '60kb' }))

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})

const publicSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
})


function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'houseofjiaezelle-api',
      audience: 'houseofjiaezelle-admin',
    })

    if (!payload.sub || !['admin', 'editor'].includes(payload.role)) {
      return res.status(401).json({ error: 'Invalid authentication token.' })
    }

    req.admin = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid.' })
  }
}

function requireAdminRole(req, res, next) {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' })
  }

  next()
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS username
    `)

    console.log('PostgreSQL connection verified:', result.rows[0])

    res.json({
      status: 'ok',
      database: 'connected',
    })
  } catch (error) {
    console.error(
      'Health check database error:',
      error.code || 'UNKNOWN',
      error.message,
    )

    res.status(503).json({
      status: 'error',
      database: 'unavailable',
    })
  }
})

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : ''

  const password = typeof req.body?.password === 'string'
    ? req.body.password
    : ''

  if (
    !email ||
    email.length > 254 ||
    password.length < 1 ||
    password.length > 128
  ) {
    return res.status(400).json({ error: 'Enter a valid email and password.' })
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role
       FROM admins
       WHERE email = $1`,
      [email],
    )

    const admin = result.rows[0]

    const validPassword = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : false

    if (!admin || !validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      {
        role: admin.role,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        subject: String(admin.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '30m',
        algorithm: 'HS256',
        issuer: 'houseofjiaezelle-api',
        audience: 'houseofjiaezelle-admin',
      },
    )

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Login database error:', error.message)
    res.status(500).json({ error: 'Unable to sign in right now.' })
  }
})

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin })
})


// ==========================================
// PUBLIC WEBSITE CONTENT
// These endpoints return published content only; no admin token is required.
// ==========================================

app.get('/api/announcements', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, category, summary, content, image_urls,
             status, published_at, created_at, updated_at
      FROM announcements
      WHERE status = 'published'
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 100
    `)
    res.json({ announcements: result.rows })
  } catch (error) {
    console.error('Public announcements query error:', error.message)
    res.status(500).json({ error: 'Unable to load announcements.' })
  }
})

app.get('/api/products', async (req, res) => {
  const division = typeof req.query.division === 'string' ? req.query.division : 'shop'
  if (!['shop', 'couture'].includes(division)) {
    return res.status(400).json({ error: 'Invalid product division.' })
  }

  try {
    const result = await pool.query(`
      SELECT id, name, division, category, description, price,
             image_url, image_urls, stock, status, created_at, updated_at,
             (download_png_url IS NOT NULL AND BTRIM(download_png_url) <> '') AS has_download_png
      FROM products
      WHERE status = 'published' AND division = $1
      ORDER BY created_at DESC
      LIMIT 200
    `, [division])
    // Never return the actual downloadable asset URL in this public listing.
    res.json({ products: result.rows })
  } catch (error) {
    console.error('Public products query error:', error.message)
    res.status(500).json({ error: 'Unable to load products for this collection.' })
  }
})

// Returns the digital PNG as an attachment for a published product in the requested division.
// This direct-download flow does not collect/verify payment.
app.get('/api/products/:id/download', async (req, res) => {
  const id = req.params.id
  const division = typeof req.query.division === 'string' ? req.query.division : 'shop'
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid product ID.' })
  if (!['shop', 'couture'].includes(division)) return res.status(400).json({ error: 'Invalid product division.' })

  try {
    const result = await pool.query(
      `SELECT name, download_png_url
       FROM products
       WHERE id::text = $1 AND status = 'published' AND division = $2
       LIMIT 1`,
      [id, division],
    )
    const product = result.rows[0]
    if (!product) return res.status(404).json({ error: 'Product not found.' })
    if (!product.download_png_url) return res.status(404).json({ error: 'The downloadable PNG is not available for this product yet.' })

    const downloadUrl = new URL(product.download_png_url)
    if (downloadUrl.protocol !== 'https:' || downloadUrl.hostname !== 'res.cloudinary.com' || !downloadUrl.pathname.includes('/image/upload/')) {
      console.error('Rejected product download URL for product', id)
      return res.status(500).json({ error: 'The product download file is not configured correctly.' })
    }

    const upstream = await fetch(downloadUrl.toString())
    if (!upstream.ok) {
      console.error('Cloudinary download failed:', upstream.status)
      return res.status(502).json({ error: 'The product PNG could not be retrieved. Please try again later.' })
    }
    const buffer = Buffer.from(await upstream.arrayBuffer())
    const filename = `${String(product.name || 'product').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'product'}.png`
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`)
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    return res.status(200).send(buffer)
  } catch (error) {
    console.error('Product PNG download error:', error.message)
    return res.status(500).json({ error: 'Unable to download this product PNG right now.' })
  }
})

app.get('/api/photoshoots', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, theme, description, image_url, image_urls,
             shoot_date, status, created_at, updated_at
      FROM photoshoots
      WHERE status = 'published'
      ORDER BY shoot_date DESC NULLS LAST, created_at DESC
      LIMIT 200
    `)
    res.json({ photoshoots: result.rows })
  } catch (error) {
    console.error('Public photoshoots query error:', error.message)
    res.status(500).json({ error: 'Unable to load studio photoshoots.' })
  }
})

app.get('/api/hotel-rooms', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, room_type, description, price_per_night, max_guests,
             amenities, image_url, image_urls, status, created_at, updated_at
      FROM hotel_rooms
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT 100
    `)
    res.json({ rooms: result.rows })
  } catch (error) {
    console.error('Public hotel rooms query error:', error.message)
    res.status(500).json({ error: 'Unable to load NAUX Hotel room listings.' })
  }
})

// ==========================================
// PUBLIC SUBMISSIONS
// These routes save public form submissions into PostgreSQL.
// Admin endpoints below are used to review them in /admin.
// ==========================================

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidHttpUrl(value) {
  if (!value) return true
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

app.post(
  '/api/model-applications',
  publicSubmissionLimiter,
  modelApplicationPhotosUpload.array('model_photos', 5),
  async (req, res, next) => {
    const fullName = cleanText(req.body?.full_name, 120)
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const portfolioUrl = cleanText(req.body?.portfolio_url, 2048)
    const message = cleanText(req.body?.message, 5000)
    const files = Array.isArray(req.files) ? req.files : []

    if (files.length < 1) {
      return res.status(400).json({ error: 'Please upload at least one model photo.' })
    }
    if (files.length > 5) {
      return res.status(400).json({ error: 'You can upload up to 5 model photos.' })
    }
    if (fullName.length < 2 || !isValidEmail(email) || message.length < 10 ||
        (portfolioUrl && !isValidHttpUrl(portfolioUrl))) {
      return res.status(400).json({
        error: 'Please provide your name, a valid email, a message of at least 10 characters, and a valid portfolio URL if supplied.',
      })
    }

    const uploaded = []
    try {
      const uploadOnePhoto = (file) => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'house-of-jiaezelle/model-applications',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, result) => {
            if (error) return reject(error)
            resolve({ url: result.secure_url, public_id: result.public_id })
          },
        )
        Readable.from(file.buffer).pipe(uploadStream)
      })

      const results = await Promise.all(files.map(uploadOnePhoto))
      uploaded.push(...results)
      const photoUrls = uploaded.map((item) => item.url)

      const result = await pool.query(
        `INSERT INTO model_applications
          (full_name, email, portfolio_url, message, photo_urls, status)
         VALUES ($1, $2, $3, $4, $5::jsonb, 'pending')
         RETURNING id, full_name, email, portfolio_url, message, photo_urls, status, created_at`,
        [fullName, email, portfolioUrl || null, message, JSON.stringify(photoUrls)],
      )

      return res.status(201).json({
        message: 'Your model application and photos have been submitted successfully.',
        application: result.rows[0],
      })
    } catch (error) {
      // Avoid leaving uploaded images behind if the database insert fails.
      if (uploaded.length) {
        await Promise.allSettled(uploaded.map((item) => cloudinary.uploader.destroy(item.public_id)))
      }
      if (error && error.message) console.error('Public model application submission error:', error.message)
      if (error?.statusCode || error?.name === 'Error') {
        return res.status(500).json({ error: 'Unable to upload your photos or save your application. Please try again.' })
      }
      return next(error)
    }
  },
)
app.post('/api/hotel-inquiries', publicSubmissionLimiter, async (req, res) => {
  const fullName = cleanText(req.body?.full_name, 120)
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const checkIn = req.body?.check_in
  const checkOut = req.body?.check_out
  const guests = Number(req.body?.guests)
  const message = cleanText(req.body?.message, 5000)

  if (fullName.length < 2 || !isValidEmail(email) || !isIsoDate(checkIn) || !isIsoDate(checkOut) ||
      checkOut <= checkIn || !Number.isInteger(guests) || guests < 1 || guests > 30 || message.length > 5000) {
    return res.status(400).json({
      error: 'Please check your name, email, dates, guest count, and inquiry details. Check-out must be after check-in.',
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO hotel_inquiries
        (full_name, email, check_in, check_out, guests, message, status)
       VALUES ($1, $2, $3::date, $4::date, $5, $6, 'pending')
       RETURNING id, full_name, email, check_in::text AS check_in,
                 check_out::text AS check_out, guests, message, status, created_at`,
      [fullName, email, checkIn, checkOut, guests, message],
    )
    return res.status(201).json({
      message: 'Your NAUX Hotel inquiry has been received. Our team will review it.',
      inquiry: result.rows[0],
    })
  } catch (error) {
    console.error('Public hotel inquiry submission error:', error.message)
    return res.status(500).json({ error: 'Unable to submit your hotel inquiry right now. Please try again later.' })
  }
})

// ==========================================
// SHOP CHECKOUT / ORDER PLACEMENT
// Cash on delivery is the only payment method in this version.
// No online payment is collected by this endpoint.
// ==========================================
app.post('/api/orders', publicSubmissionLimiter, async (req, res) => {
  const fullName = typeof req.body?.full_name === 'string' ? req.body.full_name.trim().slice(0, 120) : ''
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim().slice(0, 40) : ''
  const shippingAddress = typeof req.body?.shipping_address === 'string' ? req.body.shipping_address.trim().slice(0, 500) : ''
  const city = typeof req.body?.city === 'string' ? req.body.city.trim().slice(0, 120) : ''
  const postalCode = typeof req.body?.postal_code === 'string' ? req.body.postal_code.trim().slice(0, 20) : ''
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim().slice(0, 1500) : ''
  const requestedItems = Array.isArray(req.body?.items) ? req.body.items : []

  if (fullName.length < 2 || !isValidEmail(email) || phone.length < 7 ||
      shippingAddress.length < 5 || !city || !postalCode ||
      requestedItems.length < 1 || requestedItems.length > 20) {
    return res.status(400).json({ error: 'Please complete your name, valid email, phone number, delivery address, city, postal code, and at least one cart item.' })
  }

  // Aggregate duplicate product lines and validate the request before opening the transaction.
  const quantities = new Map()
  for (const item of requestedItems) {
    const productId = typeof item?.product_id === 'string' || typeof item?.product_id === 'number'
      ? String(item.product_id).trim()
      : ''
    const quantity = Number(item?.quantity)
    if (!/^[1-9]\d*$/.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Each cart item must have a valid product and quantity between 1 and 10.' })
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity)
  }
  if ([...quantities.values()].some((quantity) => quantity > 10)) {
    return res.status(400).json({ error: 'You can order no more than 10 units of one product per order.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const productIds = [...quantities.keys()]
    const productResult = await client.query(
      `SELECT id::text AS id, name, category, price, image_url, image_urls, stock, status
       FROM products
       WHERE id::text = ANY($1::text[])
       FOR UPDATE`,
      [productIds],
    )
    const productMap = new Map(productResult.rows.map((product) => [String(product.id), product]))
    if (productMap.size !== productIds.length) {
      const error = new Error('One or more products are no longer available. Refresh the shop and try again.')
      error.statusCode = 400
      throw error
    }

    const itemSnapshots = []
    let subtotalCents = 0
    for (const [productId, quantity] of quantities.entries()) {
      const product = productMap.get(productId)
      if (!product || product.status !== 'published') {
        const error = new Error('One or more products are no longer available. Refresh the shop and try again.')
        error.statusCode = 400
        throw error
      }
      if (Number(product.stock) < quantity) {
        const error = new Error(`${product.name} has only ${product.stock} unit(s) left. Please adjust your bag.`)
        error.statusCode = 409
        throw error
      }
      const unitPriceCents = Math.round(Number(product.price) * 100)
      if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) {
        const error = new Error(`The price for ${product.name} is invalid. Please contact the House.`)
        error.statusCode = 400
        throw error
      }
      const lineTotalCents = unitPriceCents * quantity
      subtotalCents += lineTotalCents
      const images = Array.isArray(product.image_urls) ? product.image_urls : []
      itemSnapshots.push({
        product_id: productId,
        product_name: product.name,
        category: product.category || '',
        image_url: (images.find((url) => typeof url === 'string' && url) || product.image_url || null),
        unit_price: (unitPriceCents / 100).toFixed(2),
        quantity,
        line_total: (lineTotalCents / 100).toFixed(2),
      })
    }

    const subtotal = (subtotalCents / 100).toFixed(2)
    const orderNumber = `HJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const orderResult = await client.query(
      `INSERT INTO shop_orders
         (order_number, customer_name, customer_email, customer_phone,
          shipping_address, city, postal_code, notes, payment_method,
          payment_status, status, subtotal, delivery_fee, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'cash_on_delivery', 'unpaid', 'pending', $9, 0, $9)
       RETURNING id, order_number, customer_name, customer_email, customer_phone,
                 shipping_address, city, postal_code, notes, payment_method,
                 payment_status, status, subtotal, delivery_fee, total_amount, created_at`,
      [orderNumber, fullName, email, phone, shippingAddress, city, postalCode, notes, subtotal],
    )
    const order = orderResult.rows[0]

    for (const item of itemSnapshots) {
      await client.query(
        `INSERT INTO shop_order_items
           (order_id, product_id, product_name, category, image_url, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order.id, item.product_id, item.product_name, item.category, item.image_url,
          item.unit_price, item.quantity, item.line_total],
      )
      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id::text = $2`,
        [item.quantity, item.product_id],
      )
    }

    await client.query('COMMIT')
    return res.status(201).json({
      message: 'Thank you. Your order has been received. Our team will contact you to confirm availability and delivery details.',
      order: { ...order, items: itemSnapshots },
    })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    console.error('Shop order creation error:', error.message)
    return res.status(500).json({ error: 'Unable to place your order right now. Please try again later.' })
  } finally {
    client.release()
  }
})

app.post('/api/contact-messages', publicSubmissionLimiter, async (req, res) => {
  const fullName = cleanText(req.body?.full_name, 120)
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const subject = cleanText(req.body?.subject, 200)
  const message = cleanText(req.body?.message, 5000)

  if (fullName.length < 2 || !isValidEmail(email) || subject.length < 3 || message.length < 10) {
    return res.status(400).json({
      error: 'Please provide your name, a valid email, a subject, and a message of at least 10 characters.',
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_messages
        (full_name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'unread')
       RETURNING id, full_name, email, subject, message, status, created_at`,
      [fullName, email, subject, message],
    )
    return res.status(201).json({
      message: 'Your message has been sent to House of Jiæzélle.',
      contactMessage: result.rows[0],
    })
  } catch (error) {
    console.error('Public contact message submission error:', error.message)
    return res.status(500).json({ error: 'Unable to send your message right now. Please try again later.' })
  }
})

app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM announcements) AS announcements,
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM photoshoots) AS photoshoots,
        (SELECT COUNT(*) FROM model_applications
          WHERE status = 'pending') AS pending_applications,
        (SELECT COUNT(*) FROM hotel_inquiries
          WHERE status = 'pending') AS pending_hotel_inquiries,
        (SELECT COUNT(*) FROM contact_messages
          WHERE status = 'unread') AS unread_messages
    `)

    res.json({ overview: result.rows[0] })
  } catch (error) {
    console.error('Overview query error:', error.message)
    res.status(500).json({ error: 'Unable to load dashboard overview.' })
  }
})

app.get('/api/admin/announcements', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, category, summary, content, image_urls, status,
             published_at, created_at, updated_at
      FROM announcements
      ORDER BY created_at DESC
      LIMIT 200
    `)

    res.json({ announcements: result.rows })
  } catch (error) {
    console.error('Announcements query error:', error.message)
    res.status(500).json({ error: 'Unable to load announcements.' })
  }
})

app.post('/api/admin/announcements', requireAdmin, requireAdminRole, async (req, res) => {
  const { title, category, summary, content, image_urls, status } = req.body || {}
  const announcementImages = Array.isArray(image_urls) ? image_urls : []
  const validAnnouncementImages = announcementImages.length <= 10 && announcementImages.every((url) =>
    typeof url === 'string' && /^https:\/\//i.test(url) && url.length <= 2048
  )

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 200 ||
    typeof category !== 'string' ||
    category.length > 100 ||
    typeof summary !== 'string' ||
    summary.length > 500 ||
    typeof content !== 'string' ||
    content.length > 20000 ||
    !validAnnouncementImages ||
    !['draft', 'published', 'archived'].includes(status)
  ) {
    return res.status(400).json({ error: 'Check the announcement fields.' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO announcements
        (title, category, summary, content, image_urls, status, published_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6,
         CASE WHEN $6 = 'published' THEN NOW() ELSE NULL END)
       RETURNING *`,
      [title.trim(), category.trim(), summary.trim(), content.trim(), JSON.stringify(announcementImages), status],
    )

    res.status(201).json({ announcement: result.rows[0] })
  } catch (error) {
    console.error('Announcement create error:', error.message)
    res.status(500).json({ error: 'Unable to create announcement.' })
  }
})

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================

// GET ALL PRODUCTS
app.get('/api/admin/products', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        division,
        category,
        description,
        price,
        image_url,
        image_urls,
        download_png_url,
        download_png_public_id,
        stock,
        status,
        created_at,
        updated_at
      FROM products
      ORDER BY created_at DESC
      LIMIT 500
    `)

    res.json({ products: result.rows })
  } catch (error) {
    console.error('Products query error:', error.message)

    res.status(500).json({
      error: 'Unable to load products.',
    })
  }
})


// CREATE PRODUCT
app.post(
  '/api/admin/products',
  requireAdmin,
  requireAdminRole,
  async (req, res) => {
    const {
      name,
      division,
      category,
      description,
      price,
      image_url,
      image_urls,
      download_png_url,
      download_png_public_id,
      stock,
      status,
    } = req.body || {}
    const productDivision = division === undefined || division === null || division === '' ? 'shop' : division
    const productImages = Array.isArray(image_urls)
      ? image_urls
      : (typeof image_url === 'string' && image_url.trim() ? [image_url.trim()] : [])
    const validProductImages = productImages.length <= 10 && productImages.every((url) =>
      typeof url === 'string' && /^https:\/\//i.test(url) && url.length <= 2048
    )
    const validDownloadPng =
      (download_png_url === null || download_png_url === undefined || download_png_url === '')
        ? (download_png_public_id === null || download_png_public_id === undefined || download_png_public_id === '')
        : (typeof download_png_url === 'string' && /^https:\/\/res\.cloudinary\.com\//i.test(download_png_url) && download_png_url.length <= 2048 &&
           typeof download_png_public_id === 'string' && download_png_public_id.length <= 255)

    const validStatuses = ['draft', 'published', 'archived']

    const validPrice =
      price !== '' &&
      price !== null &&
      price !== undefined &&
      Number.isFinite(Number(price)) &&
      Number(price) >= 0

    const validStock =
      stock !== '' &&
      stock !== null &&
      stock !== undefined &&
      Number.isInteger(Number(stock)) &&
      Number(stock) >= 0

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 200 ||
      !['shop', 'couture'].includes(productDivision) ||
      typeof category !== 'string' ||
      !category.trim() ||
      category.trim().length > 100 ||
      typeof description !== 'string' ||
      description.length > 10000 ||
      !validPrice ||
      !validStock ||
      !validProductImages ||
      !validDownloadPng ||
      (status === 'published' && !download_png_url) ||
      !validStatuses.includes(status) ||
      (
        image_url !== null &&
        image_url !== undefined &&
        (
          typeof image_url !== 'string' ||
          image_url.length > 2048
        )
      )
    ) {
      return res.status(400).json({
        error: 'Check the product fields and try again.',
      })
    }

    try {
      const result = await pool.query(
        `INSERT INTO products
          (
            name,
            division,
            category,
            description,
            price,
            image_url,
            image_urls,
            download_png_url,
            download_png_public_id,
            stock,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
         RETURNING *`,
        [
          name.trim(),
          productDivision,
          category.trim(),
          description.trim(),
          Number(price),
          productImages[0] || image_url?.trim() || null,
          JSON.stringify(productImages),
          download_png_url || null,
          download_png_public_id || null,
          Number(stock),
          status,
        ],
      )

      res.status(201).json({
        message: 'Product created successfully.',
        product: result.rows[0],
      })
    } catch (error) {
      console.error('Product creation error:', error.message)

      res.status(500).json({
        error: 'Unable to create product.',
      })
    }
  },
)


// UPDATE PRODUCT
app.patch(
  '/api/admin/products/:id',
  requireAdmin,
  requireAdminRole,
  async (req, res) => {
    const id = req.params.id

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid product ID.',
      })
    }

    const {
      name,
      division,
      category,
      description,
      price,
      image_url,
      image_urls,
      download_png_url,
      download_png_public_id,
      stock,
      status,
    } = req.body || {}
    const productDivision = division === undefined || division === null || division === '' ? 'shop' : division
    const productImages = Array.isArray(image_urls)
      ? image_urls
      : (typeof image_url === 'string' && image_url.trim() ? [image_url.trim()] : [])
    const validProductImages = productImages.length <= 10 && productImages.every((url) =>
      typeof url === 'string' && /^https:\/\//i.test(url) && url.length <= 2048
    )
    const validDownloadPng =
      (download_png_url === null || download_png_url === undefined || download_png_url === '')
        ? (download_png_public_id === null || download_png_public_id === undefined || download_png_public_id === '')
        : (typeof download_png_url === 'string' && /^https:\/\/res\.cloudinary\.com\//i.test(download_png_url) && download_png_url.length <= 2048 &&
           typeof download_png_public_id === 'string' && download_png_public_id.length <= 255)

    const validStatuses = ['draft', 'published', 'archived']

    const validPrice =
      price !== '' &&
      price !== null &&
      price !== undefined &&
      Number.isFinite(Number(price)) &&
      Number(price) >= 0

    const validStock =
      stock !== '' &&
      stock !== null &&
      stock !== undefined &&
      Number.isInteger(Number(stock)) &&
      Number(stock) >= 0

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 200 ||
      !['shop', 'couture'].includes(productDivision) ||
      typeof category !== 'string' ||
      !category.trim() ||
      category.trim().length > 100 ||
      typeof description !== 'string' ||
      description.length > 10000 ||
      !validPrice ||
      !validStock ||
      !validProductImages ||
      !validDownloadPng ||
      (status === 'published' && !download_png_url) ||
      !validStatuses.includes(status) ||
      (
        image_url !== null &&
        image_url !== undefined &&
        (
          typeof image_url !== 'string' ||
          image_url.length > 2048
        )
      )
    ) {
      return res.status(400).json({
        error: 'Check the product fields and try again.',
      })
    }

    try {
      const result = await pool.query(
        `UPDATE products
         SET
           name = $1,
           division = $2,
           category = $3,
           description = $4,
           price = $5,
           image_url = $6,
           image_urls = $7::jsonb,
           download_png_url = $8,
           download_png_public_id = $9,
           stock = $10,
           status = $11,
           updated_at = NOW()
         WHERE id = $12
         RETURNING *`,
        [
          name.trim(),
          productDivision,
          category.trim(),
          description.trim(),
          Number(price),
          productImages[0] || image_url?.trim() || null,
          JSON.stringify(productImages),
          download_png_url || null,
          download_png_public_id || null,
          Number(stock),
          status,
          id,
        ],
      )

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Product not found.',
        })
      }

      res.json({
        message: 'Product updated successfully.',
        product: result.rows[0],
      })
    } catch (error) {
      console.error('Product update error:', error.message)

      res.status(500).json({
        error: 'Unable to update product.',
      })
    }
  },
)


// DELETE PRODUCT
app.delete(
  '/api/admin/products/:id',
  requireAdmin,
  requireAdminRole,
  async (req, res) => {
    const id = req.params.id

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        error: 'Invalid product ID.',
      })
    }

    try {
      const result = await pool.query(
        `DELETE FROM products
         WHERE id = $1
         RETURNING id`,
        [id],
      )

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Product not found.',
        })
      }

      res.json({
        message: 'Product deleted successfully.',
      })
    } catch (error) {
      console.error('Product deletion error:', error.message)

      res.status(500).json({
        error: 'Unable to delete product.',
      })
    }
  },
)


// ==========================================
// PHOTOSHOOT MANAGEMENT (MULTI-IMAGE)
// Requires photoshoots.image_urls JSONB column; run the supplied migration SQL once.
// ==========================================

app.get('/api/admin/photoshoots', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, theme, description, image_url, image_urls, shoot_date,
             status, created_at, updated_at
      FROM photoshoots
      ORDER BY created_at DESC
      LIMIT 500
    `)

    res.json({ photoshoots: result.rows })
  } catch (error) {
    console.error('Photoshoots query error:', error.message)
    res.status(500).json({ error: 'Unable to load photoshoots.' })
  }
})

function normalizePhotoshootImages(image_urls, image_url) {
  const source = Array.isArray(image_urls)
    ? image_urls
    : (typeof image_url === 'string' && image_url.trim() ? [image_url] : [])

  return source.map((url) => typeof url === 'string' ? url.trim() : url)
}

function validPhotoshootImages(images) {
  return Array.isArray(images) &&
    images.length >= 1 &&
    images.length <= 10 &&
    images.every((url) =>
      typeof url === 'string' &&
      /^https:\/\//i.test(url) &&
      url.length <= 2048
    )
}

app.post('/api/admin/photoshoots', requireAdmin, requireAdminRole, async (req, res) => {
  const { title, theme, description, image_url, image_urls, shoot_date, status } = req.body || {}
  const images = normalizePhotoshootImages(image_urls, image_url)
  const validStatuses = ['draft', 'published', 'archived']
  const validDate = shoot_date === null || shoot_date === undefined || shoot_date === ''
    || (typeof shoot_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(shoot_date))

  if (
    typeof title !== 'string' || !title.trim() || title.trim().length > 200 ||
    typeof theme !== 'string' || theme.length > 200 ||
    typeof description !== 'string' || description.length > 10000 ||
    !validPhotoshootImages(images) ||
    !validStatuses.includes(status) || !validDate
  ) {
    return res.status(400).json({ error: 'Check the photoshoot fields, images, and status.' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO photoshoots
         (title, theme, description, image_url, image_urls, shoot_date, status)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
       RETURNING id, title, theme, description, image_url, image_urls, shoot_date,
                 status, created_at, updated_at`,
      [title.trim(), theme.trim(), description.trim(), images[0], JSON.stringify(images), shoot_date || null, status],
    )

    res.status(201).json({ message: 'Photoshoot created successfully.', photoshoot: result.rows[0] })
  } catch (error) {
    console.error('Photoshoot creation error:', error.message)
    res.status(500).json({ error: 'Unable to create photoshoot.' })
  }
})

app.patch('/api/admin/photoshoots/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const id = req.params.id
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid photoshoot ID.' })
  }

  const { title, theme, description, image_url, image_urls, shoot_date, status } = req.body || {}
  const images = normalizePhotoshootImages(image_urls, image_url)
  const validStatuses = ['draft', 'published', 'archived']
  const validDate = shoot_date === null || shoot_date === undefined || shoot_date === ''
    || (typeof shoot_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(shoot_date))

  if (
    typeof title !== 'string' || !title.trim() || title.trim().length > 200 ||
    typeof theme !== 'string' || theme.length > 200 ||
    typeof description !== 'string' || description.length > 10000 ||
    !validPhotoshootImages(images) ||
    !validStatuses.includes(status) || !validDate
  ) {
    return res.status(400).json({ error: 'Check the photoshoot fields, images, and status.' })
  }

  try {
    const result = await pool.query(
      `UPDATE photoshoots
       SET title = $1, theme = $2, description = $3, image_url = $4,
           image_urls = $5::jsonb, shoot_date = $6, status = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING id, title, theme, description, image_url, image_urls, shoot_date,
                 status, created_at, updated_at`,
      [title.trim(), theme.trim(), description.trim(), images[0], JSON.stringify(images), shoot_date || null, status, id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Photoshoot not found.' })
    }

    res.json({ message: 'Photoshoot updated successfully.', photoshoot: result.rows[0] })
  } catch (error) {
    console.error('Photoshoot update error:', error.message)
    res.status(500).json({ error: 'Unable to update photoshoot.' })
  }
})

app.delete('/api/admin/photoshoots/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const id = req.params.id
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid photoshoot ID.' })
  }

  try {
    const result = await pool.query(
      'DELETE FROM photoshoots WHERE id = $1 RETURNING id',
      [id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Photoshoot not found.' })
    }

    res.json({ message: 'Photoshoot deleted from the database.' })
  } catch (error) {
    console.error('Photoshoot deletion error:', error.message)
    res.status(500).json({ error: 'Unable to delete photoshoot.' })
  }
})

// ==========================================
// NAUX HOTEL ROOM MANAGEMENT
// ==========================================
app.get('/api/admin/hotel-rooms', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, room_type, description, price_per_night, max_guests,
             amenities, image_url, image_urls, status, created_at, updated_at
      FROM hotel_rooms
      ORDER BY created_at DESC
      LIMIT 500
    `)
    res.json({ rooms: result.rows })
  } catch (error) {
    console.error('Hotel rooms query error:', error.message)
    res.status(500).json({ error: 'Unable to load hotel rooms.' })
  }
})

function normalizeHotelRoomImages(image_urls, image_url) {
  const source = Array.isArray(image_urls)
    ? image_urls
    : (typeof image_url === 'string' && image_url.trim() ? [image_url.trim()] : [])
  return source.map((url) => typeof url === 'string' ? url.trim() : url)
}

function isValidHotelRoomImages(images) {
  return Array.isArray(images) && images.length >= 1 && images.length <= 10 &&
    images.every((url) => typeof url === 'string' && /^https:\/\//i.test(url) && url.length <= 2048)
}

app.post('/api/admin/hotel-rooms', requireAdmin, requireAdminRole, async (req, res) => {
  const { name, room_type, description, price_per_night, max_guests, amenities, image_url, image_urls, status } = req.body || {}
  const images = normalizeHotelRoomImages(image_urls, image_url)
  const validStatuses = ['draft', 'published', 'archived']
  const validPrice = price_per_night !== '' && price_per_night !== null && price_per_night !== undefined && Number.isFinite(Number(price_per_night)) && Number(price_per_night) >= 0
  const validGuests = Number.isInteger(Number(max_guests)) && Number(max_guests) >= 1 && Number(max_guests) <= 30
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 200 ||
    typeof room_type !== 'string' || !room_type.trim() || room_type.trim().length > 100 ||
    typeof description !== 'string' || description.length > 10000 ||
    typeof amenities !== 'string' || amenities.length > 2000 ||
    !validPrice || !validGuests || !isValidHotelRoomImages(images) || !validStatuses.includes(status)
  ) return res.status(400).json({ error: 'Check the room details, price, capacity, photos, and publication status.' })

  try {
    const result = await pool.query(
      `INSERT INTO hotel_rooms (name, room_type, description, price_per_night, max_guests, amenities, image_url, image_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
       RETURNING id, name, room_type, description, price_per_night, max_guests, amenities, image_url, image_urls, status, created_at, updated_at`,
      [name.trim(), room_type.trim(), description.trim(), Number(price_per_night), Number(max_guests), amenities.trim(), images[0], JSON.stringify(images), status],
    )
    res.status(201).json({ message: 'Hotel room saved successfully.', room: result.rows[0] })
  } catch (error) {
    console.error('Hotel room creation error:', error.message)
    res.status(500).json({ error: 'Unable to save hotel room.' })
  }
})

app.patch('/api/admin/hotel-rooms/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const id = req.params.id
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid hotel room ID.' })
  const { name, room_type, description, price_per_night, max_guests, amenities, image_url, image_urls, status } = req.body || {}
  const images = normalizeHotelRoomImages(image_urls, image_url)
  const validStatuses = ['draft', 'published', 'archived']
  const validPrice = price_per_night !== '' && price_per_night !== null && price_per_night !== undefined && Number.isFinite(Number(price_per_night)) && Number(price_per_night) >= 0
  const validGuests = Number.isInteger(Number(max_guests)) && Number(max_guests) >= 1 && Number(max_guests) <= 30
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 200 ||
    typeof room_type !== 'string' || !room_type.trim() || room_type.trim().length > 100 ||
    typeof description !== 'string' || description.length > 10000 ||
    typeof amenities !== 'string' || amenities.length > 2000 ||
    !validPrice || !validGuests || !isValidHotelRoomImages(images) || !validStatuses.includes(status)
  ) return res.status(400).json({ error: 'Check the room details, price, capacity, photos, and publication status.' })

  try {
    const result = await pool.query(
      `UPDATE hotel_rooms
       SET name = $1, room_type = $2, description = $3, price_per_night = $4, max_guests = $5,
           amenities = $6, image_url = $7, image_urls = $8::jsonb, status = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING id, name, room_type, description, price_per_night, max_guests, amenities, image_url, image_urls, status, created_at, updated_at`,
      [name.trim(), room_type.trim(), description.trim(), Number(price_per_night), Number(max_guests), amenities.trim(), images[0], JSON.stringify(images), status, id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Hotel room not found.' })
    res.json({ message: 'Hotel room updated successfully.', room: result.rows[0] })
  } catch (error) {
    console.error('Hotel room update error:', error.message)
    res.status(500).json({ error: 'Unable to update hotel room.' })
  }
})

app.delete('/api/admin/hotel-rooms/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const id = req.params.id
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid hotel room ID.' })
  try {
    const result = await pool.query('DELETE FROM hotel_rooms WHERE id = $1 RETURNING id', [id])
    if (!result.rowCount) return res.status(404).json({ error: 'Hotel room not found.' })
    res.json({ message: 'Hotel room listing deleted. Stored Cloudinary images were not deleted.' })
  } catch (error) {
    console.error('Hotel room deletion error:', error.message)
    res.status(500).json({ error: 'Unable to delete hotel room.' })
  }
})

// ==========================================
// MODEL APPLICATIONS MANAGEMENT
// ==========================================
app.get('/api/admin/model-applications', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, portfolio_url, message, photo_urls, status, created_at
      FROM model_applications
      ORDER BY created_at DESC
      LIMIT 500
    `)
    res.json({ applications: result.rows })
  } catch (error) {
    console.error('Model applications query error:', error.message)
    res.status(500).json({ error: 'Unable to load model applications.' })
  }
})

app.patch('/api/admin/model-applications/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid application ID.' })
  if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid application status.' })
  }
  try {
    const result = await pool.query(
      `UPDATE model_applications SET status = $1 WHERE id = $2
       RETURNING id, full_name, email, portfolio_url, message, photo_urls, status, created_at`,
      [status, id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Model application not found.' })
    res.json({ message: 'Model application status updated.', application: result.rows[0] })
  } catch (error) {
    console.error('Model application update error:', error.message)
    res.status(500).json({ error: 'Unable to update model application.' })
  }
})

app.delete('/api/admin/model-applications/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid application ID.' })
  try {
    const result = await pool.query('DELETE FROM model_applications WHERE id = $1 RETURNING id', [id])
    if (!result.rowCount) return res.status(404).json({ error: 'Model application not found.' })
    res.json({ message: 'Model application deleted.' })
  } catch (error) {
    console.error('Model application deletion error:', error.message)
    res.status(500).json({ error: 'Unable to delete model application.' })
  }
})

// ==========================================
// HOTEL INQUIRIES MANAGEMENT
// ==========================================
app.get('/api/admin/hotel-inquiries', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, check_in::text AS check_in,
             check_out::text AS check_out, guests, message, status, created_at
      FROM hotel_inquiries
      ORDER BY created_at DESC
      LIMIT 500
    `)
    res.json({ inquiries: result.rows })
  } catch (error) {
    console.error('Hotel inquiries query error:', error.message)
    res.status(500).json({ error: 'Unable to load hotel inquiries.' })
  }
})

app.patch('/api/admin/hotel-inquiries/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid inquiry ID.' })
  if (!['pending', 'contacted', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid hotel inquiry status.' })
  }
  try {
    const result = await pool.query(
      `UPDATE hotel_inquiries SET status = $1 WHERE id = $2
       RETURNING id, full_name, email, check_in::text AS check_in,
                 check_out::text AS check_out, guests, message, status, created_at`,
      [status, id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Hotel inquiry not found.' })
    res.json({ message: 'Hotel inquiry status updated.', inquiry: result.rows[0] })
  } catch (error) {
    console.error('Hotel inquiry update error:', error.message)
    res.status(500).json({ error: 'Unable to update hotel inquiry.' })
  }
})

app.delete('/api/admin/hotel-inquiries/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid inquiry ID.' })
  try {
    const result = await pool.query('DELETE FROM hotel_inquiries WHERE id = $1 RETURNING id', [id])
    if (!result.rowCount) return res.status(404).json({ error: 'Hotel inquiry not found.' })
    res.json({ message: 'Hotel inquiry deleted.' })
  } catch (error) {
    console.error('Hotel inquiry deletion error:', error.message)
    res.status(500).json({ error: 'Unable to delete hotel inquiry.' })
  }
})

// ==========================================
// CONTACT MESSAGES MANAGEMENT
// ==========================================
app.get('/api/admin/contact-messages', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, subject, message, status, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 500
    `)
    res.json({ messages: result.rows })
  } catch (error) {
    console.error('Contact messages query error:', error.message)
    res.status(500).json({ error: 'Unable to load contact messages.' })
  }
})

app.patch('/api/admin/contact-messages/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid contact message ID.' })
  if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid contact message status.' })
  }
  try {
    const result = await pool.query(
      `UPDATE contact_messages SET status = $1 WHERE id = $2
       RETURNING id, full_name, email, subject, message, status, created_at`,
      [status, id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Contact message not found.' })
    res.json({ message: 'Contact message status updated.', contactMessage: result.rows[0] })
  } catch (error) {
    console.error('Contact message update error:', error.message)
    res.status(500).json({ error: 'Unable to update contact message.' })
  }
})

app.delete('/api/admin/contact-messages/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid contact message ID.' })
  try {
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id])
    if (!result.rowCount) return res.status(404).json({ error: 'Contact message not found.' })
    res.json({ message: 'Contact message deleted.' })
  } catch (error) {
    console.error('Contact message deletion error:', error.message)
    res.status(500).json({ error: 'Unable to delete contact message.' })
  }
})

// ==========================================
// SHOP ORDERS MANAGEMENT
// ==========================================
app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*,
             COALESCE(
               json_agg(json_build_object(
                 'product_id', oi.product_id,
                 'product_name', oi.product_name,
                 'category', oi.category,
                 'image_url', oi.image_url,
                 'unit_price', oi.unit_price,
                 'quantity', oi.quantity,
                 'line_total', oi.line_total
               ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) AS items
      FROM shop_orders o
      LEFT JOIN shop_order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 500
    `)
    res.json({ orders: result.rows })
  } catch (error) {
    console.error('Shop orders query error:', error.message)
    res.status(500).json({ error: 'Unable to load shop orders.' })
  }
})

app.patch('/api/admin/orders/:id', requireAdmin, requireAdminRole, async (req, res) => {
  const { id } = req.params
  const { status, payment_status: paymentStatus } = req.body || {}
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled']
  const validPaymentStatuses = ['unpaid', 'paid', 'refunded']
  if (!/^[1-9]\d*$/.test(id)) return res.status(400).json({ error: 'Invalid order ID.' })
  if (!validStatuses.includes(status) || !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Choose a valid order status and payment status.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const currentResult = await client.query(
      'SELECT id, status FROM shop_orders WHERE id = $1 FOR UPDATE',
      [id],
    )
    if (!currentResult.rowCount) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Shop order not found.' })
    }
    const current = currentResult.rows[0]
    if (current.status === 'cancelled' && status !== 'cancelled') {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Cancelled orders cannot be reopened. Ask the customer to place a new order.' })
    }

    // Release reserved stock once when an order is cancelled.
    if (current.status !== 'cancelled' && status === 'cancelled') {
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM shop_order_items WHERE order_id = $1',
        [id],
      )
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id::text = $2',
          [item.quantity, item.product_id],
        )
      }
    }

    const updateResult = await client.query(
      `UPDATE shop_orders
       SET status = $1, payment_status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, order_number, customer_name, customer_email, customer_phone,
                 shipping_address, city, postal_code, notes, payment_method,
                 payment_status, status, subtotal, delivery_fee, total_amount, created_at, updated_at`,
      [status, paymentStatus, id],
    )
    await client.query('COMMIT')
    res.json({ message: 'Shop order updated successfully.', order: updateResult.rows[0] })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Shop order update error:', error.message)
    res.status(500).json({ error: 'Unable to update shop order.' })
  } finally {
    client.release()
  }
})

// ADMIN SECURITY CHECK
app.get(
  '/api/admin/security-check',
  requireAdmin,
  requireAdminRole,
  (_req, res) => {
    res.json({
      message: 'Administrator authorization verified.',
    })
  },
)

// Generic multi-photo upload for products and announcements.
// Only explicitly allowed folder names can be used by clients.
app.post(
  '/api/admin/uploads/content/:folder',
  requireAdmin,
  requireAdminRole,
  photoshootUpload.array('images', 10),
  async (req, res, next) => {
    try {
      const folder = req.params.folder
      if (!['announcements', 'products', 'hotel-rooms'].includes(folder)) {
        return res.status(400).json({ error: 'Invalid upload destination.' })
      }

      const files = Array.isArray(req.files) ? req.files : []
      if (!files.length) {
        return res.status(400).json({ error: 'Please select at least one image to upload.' })
      }
      if (files.length > 10) {
        return res.status(400).json({ error: 'You can upload up to 10 images at a time.' })
      }

      const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `house-of-jiaezelle/${folder}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, result) => {
            if (error) return reject(error)
            resolve({ image_url: result.secure_url, public_id: result.public_id })
          },
        )
        Readable.from(file.buffer).pipe(uploadStream)
      })))

      return res.status(201).json({
        message: `${images.length} photo${images.length === 1 ? '' : 's'} uploaded successfully.`,
        images,
      })
    } catch (error) {
      next(error)
    }
  },
)

app.post(
  '/api/admin/uploads/product-download-png',
  requireAdmin,
  requireAdminRole,
  productDownloadPngUpload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Please choose a transparent PNG file.' })
      const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      if (!req.file.buffer.subarray(0, 8).equals(pngSignature)) {
        return res.status(400).json({ error: 'The selected file is not a valid PNG image.' })
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'house-of-jiaezelle/product-downloads',
            resource_type: 'image',
            allowed_formats: ['png'],
            format: 'png',
            unique_filename: true,
          },
          (error, uploadResult) => {
            if (error) return reject(error)
            resolve(uploadResult)
          },
        )
        Readable.from(req.file.buffer).pipe(uploadStream)
      })

      return res.status(201).json({
        message: 'Downloadable product PNG uploaded. It will not be displayed in the public product gallery.',
        image_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
      })
    } catch (error) {
      return next(error)
    }
  },
)

app.post(
  '/api/admin/uploads/photoshoot-image',
  requireAdmin,
  requireAdminRole,
  photoshootUpload.array('images', 10),
  async (req, res, next) => {
    try {
      const files = Array.isArray(req.files) ? req.files : []
      if (!files.length) {
        return res.status(400).json({ error: 'Please select at least one image to upload.' })
      }

      if (files.length > 10) {
        return res.status(400).json({ error: 'You can upload up to 10 images at a time.' })
      }

      const uploadOneImage = (file) => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'house-of-jiaezelle/photoshoots',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, result) => {
            if (error) return reject(error)
            resolve({ image_url: result.secure_url, public_id: result.public_id })
          },
        )

        Readable.from(file.buffer).pipe(uploadStream)
      })

      const images = await Promise.all(files.map(uploadOneImage))

      return res.status(201).json({
        message: `${images.length} photo${images.length === 1 ? '' : 's'} uploaded successfully.`,
        images,
        // Keep these top-level fields for any earlier single-image client.
        image_url: images[0].image_url,
        public_id: images[0].public_id,
      })
    } catch (error) {
      next(error)
    }
  },
)

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error.message)
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'The image must be within the upload size limit (15 MB for the downloadable PNG; 5 MB for standard photos).' })
  }
  if (error instanceof multer.MulterError || error.message === 'Only JPG, PNG, and WebP images are allowed.' || error.message === 'The downloadable product file must be a PNG with a transparent background.') {
    return res.status(400).json({ error: error.message })
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' })
})

const server = app.listen(PORT, () => {
  console.log(`House of Jiæzélle API running on http://localhost:${PORT}`)
})

async function shutdown() {
  server.close()
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)