<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type Admin = {
  id: string | number
  email: string
  role: string
}

type Announcement = {
  id: string | number
  title: string
  category: string
  summary: string
  content: string
  image_urls?: string[] | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
}
  type Product = {
    id: string | number
    name: string
    division: 'shop' | 'couture'
    category: string
    description: string
    price: string | number
    image_url: string | null
    image_urls?: string[] | null
    download_png_url?: string | null
    download_png_public_id?: string | null
    stock: number
    status: 'draft' | 'published' | 'archived'
    created_at: string
    updated_at: string
  }

type Photoshoot = {
  id: string | number
  title: string
  theme: string
  description: string
  image_url: string | null
  image_urls?: string[] | null
  shoot_date: string | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

type HotelRoom = {
  id: string | number
  name: string
  room_type: string
  description: string
  price_per_night: string | number
  max_guests: number
  amenities: string
  image_url: string | null
  image_urls?: string[] | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

type ModelApplication = {
  id: string | number
  full_name: string
  email: string
  portfolio_url: string | null
  message: string | null
  photo_urls?: string[] | null
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  draft_status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  created_at: string
}

type HotelInquiry = {
  id: string | number
  full_name: string
  email: string
  check_in: string | null
  check_out: string | null
  guests: number | null
  message: string | null
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled'
  draft_status: 'pending' | 'contacted' | 'confirmed' | 'cancelled'
  created_at: string
}

type ContactMessage = {
  id: string | number
  full_name: string
  email: string
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  draft_status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}

type ShopOrderItem = {
  product_id: string
  product_name: string
  category: string
  image_url: string | null
  unit_price: string | number
  quantity: number
  line_total: string | number
}

type ShopOrder = {
  id: string | number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  city: string
  postal_code: string
  notes: string | null
  payment_method: string
  payment_status: 'unpaid' | 'paid' | 'refunded'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  draft_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  draft_payment_status: 'unpaid' | 'paid' | 'refunded'
  subtotal: string | number
  delivery_fee: string | number
  total_amount: string | number
  items: ShopOrderItem[]
  created_at: string
  updated_at?: string
}

const activeSection = ref('Overview')
const search = ref('')

const token = ref(sessionStorage.getItem('house_admin_token') || '')
const admin = ref<Admin | null>(null)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginForm = ref({
  email: '',
  password: '',
})

const stats = ref([
  { label: 'Announcements', value: '0', icon: '✧', note: 'Content management' },
  { label: 'Products', value: '0', icon: '◇', note: 'Shop inventory' },
  { label: 'Photoshoots', value: '0', icon: '◎', note: 'Studio portfolio' },
  { label: 'Inquiries', value: '0', icon: '✉', note: 'Messages received' },
])

const activities = ref([
  {
    title: 'Website launched',
    detail: 'House of Jiæzélle',
    date: 'INITIAL SETUP',
  },
  {
    title: 'Corporate pages created',
    detail: 'Four company divisions',
    date: 'INITIAL SETUP',
  },
])

const announcements = ref<Announcement[]>([])

const products = ref<Product[]>([])

const editingProductId = ref<string | number | null>(null)
const productSelectedFiles = ref<File[]>([])
const productSelectedPreviews = ref<{ file: File; url: string }[]>([])
const productExistingImageUrls = ref<string[]>([])
const productFileInput = ref<HTMLInputElement | null>(null)
const productDownloadPngInput = ref<HTMLInputElement | null>(null)
const productDownloadPngFile = ref<File | null>(null)
const productDownloadPngPreview = ref('')
const productDownloadPngUrl = ref('')
const productDownloadPngPublicId = ref('')
const MAX_DOWNLOAD_PNG_BYTES = 15 * 1024 * 1024

const productForm = ref({
  name: '',
  division: 'shop' as 'shop' | 'couture',
  category: 'Travel Essentials',
  description: '',
  price: 0,
  image_url: '',
  stock: 0,
  status: 'draft' as 'draft' | 'published' | 'archived',
})


const photoshoots = ref<Photoshoot[]>([])
const editingPhotoshootId = ref<string | number | null>(null)
const photoshootSelectedFiles = ref<File[]>([])
const photoshootSelectedPreviews = ref<{ file: File; url: string }[]>([])
const photoshootExistingImageUrls = ref<string[]>([])
const photoshootFileInput = ref<HTMLInputElement | null>(null)

const photoshootForm = ref({
  title: '',
  theme: '',
  description: '',
  image_url: '',
  shoot_date: '',
  status: 'draft' as 'draft' | 'published' | 'archived',
})

const hotelRooms = ref<HotelRoom[]>([])
const editingHotelRoomId = ref<string | number | null>(null)
const hotelRoomSelectedFiles = ref<File[]>([])
const hotelRoomSelectedPreviews = ref<{ file: File; url: string }[]>([])
const hotelRoomExistingImageUrls = ref<string[]>([])
const hotelRoomFileInput = ref<HTMLInputElement | null>(null)
const hotelRoomForm = ref({
  name: '',
  room_type: 'Deluxe Room',
  description: '',
  price_per_night: 0,
  max_guests: 2,
  amenities: '',
  status: 'draft' as 'draft' | 'published' | 'archived',
})

const modelApplications = ref<ModelApplication[]>([])
const hotelInquiries = ref<HotelInquiry[]>([])
const contactMessages = ref<ContactMessage[]>([])
const orders = ref<ShopOrder[]>([])

const announcementForm = ref({
  title: '',
  category: 'THE HOUSE',
  summary: '',
  content: '',
  status: 'draft' as 'draft' | 'published' | 'archived',
})
const announcementSelectedFiles = ref<File[]>([])
const announcementSelectedPreviews = ref<{ file: File; url: string }[]>([])
const announcementFileInput = ref<HTMLInputElement | null>(null)

const sections = [
  'Overview',
  'Announcements',
  'Products',
  'Orders',
  'Photoshoots',
  'Hotel Rooms',
  'Model Applications',
  'Hotel Inquiries',
  'Contact Messages',
]

const filteredActivities = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return activities.value

  return activities.value.filter((item) =>
    `${item.title} ${item.detail} ${item.date}`
      .toLowerCase()
      .includes(query),
  )
})

const isAuthenticated = computed(() => Boolean(token.value && admin.value))

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  // Let the browser set multipart/form-data boundaries for file uploads.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token.value) {
    headers.set('Authorization', `Bearer ${token.value}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && token.value) {
      logout('Your session has expired. Please sign in again.')
    }

    throw new Error(data.error || data.message || `Request failed (${response.status}).`)
  }

  return data as T
}

async function login() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await apiRequest<{
      token: string
      admin: Admin
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: loginForm.value.email.trim(),
        password: loginForm.value.password,
      }),
    })

    token.value = result.token
    admin.value = result.admin

    sessionStorage.setItem('house_admin_token', result.token)

    loginForm.value.password = ''

    await loadDashboard()

    successMessage.value = 'Welcome to the House administration workspace.'
  } catch (error) {
    token.value = ''
    admin.value = null

    sessionStorage.removeItem('house_admin_token')

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to sign in. Please try again.'
  } finally {
    loading.value = false
  }
}

function logout(message = '') {
  token.value = ''
  admin.value = null

  sessionStorage.removeItem('house_admin_token')

  announcements.value = []
  products.value = []
  photoshoots.value = []

  stats.value.forEach((stat) => {
    stat.value = '0'
  })

  activeSection.value = 'Overview'
  loginForm.value.password = ''

  errorMessage.value = message
  successMessage.value = ''
}

async function loadDashboard() {
  if (!token.value) return

  errorMessage.value = ''

  try {
    const result = await apiRequest<{
      overview: {
        announcements: string | number
        products: string | number
        photoshoots: string | number
        pending_applications: string | number
        pending_hotel_inquiries: string | number
        unread_messages: string | number
      }
    }>('/admin/overview')

    const overview = result.overview

    stats.value = [
      {
        label: 'Announcements',
        value: String(overview.announcements),
        icon: '✧',
        note: 'Content management',
      },
      {
        label: 'Products',
        value: String(overview.products),
        icon: '◇',
        note: 'Shop inventory',
      },
      {
        label: 'Photoshoots',
        value: String(overview.photoshoots),
        icon: '◎',
        note: 'Studio portfolio',
      },
      {
        label: 'Inquiries',
        value: String(
          Number(overview.pending_hotel_inquiries) +
          Number(overview.unread_messages),
        ),
        icon: '✉',
        note: 'Pending hotel and unread contact inquiries',
      },
    ]
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to load dashboard statistics.'

    throw error
  }
}

async function loadAnnouncements() {
  errorMessage.value = ''

  try {
    const result = await apiRequest<{
      announcements: Announcement[]
    }>('/admin/announcements')

    announcements.value = result.announcements
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to load announcements.'
  }
}

async function createAnnouncement() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const imageUrls = await uploadContentImages(announcementSelectedFiles.value, 'announcements')

    await apiRequest<{ announcement: Announcement }>(
      '/admin/announcements',
      {
        method: 'POST',
        body: JSON.stringify({
          title: announcementForm.value.title.trim(),
          category: announcementForm.value.category.trim(),
          summary: announcementForm.value.summary.trim(),
          content: announcementForm.value.content.trim(),
          image_urls: imageUrls,
          status: announcementForm.value.status,
        }),
      },
    )

    announcementForm.value = {
      title: '',
      category: 'THE HOUSE',
      summary: '',
      content: '',
      status: 'draft',
    }
    resetAnnouncementPhotoSelection()

    await loadAnnouncements()
    await loadDashboard()

    successMessage.value = 'Announcement created successfully.'
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to create announcement.'
  } finally {
    loading.value = false
  }
}
// ==========================================
// PRODUCT MANAGEMENT FUNCTIONS
// ==========================================

function resetProductForm() {
  editingProductId.value = null
  resetProductPhotoSelection()
  resetProductDownloadPngSelection()

  productForm.value = {
    name: '',
    division: 'shop',
    category: 'Travel Essentials',
    description: '',
    price: 0,
    image_url: '',
    stock: 0,
    status: 'draft',
  }
}


// LOAD PRODUCTS FROM POSTGRESQL
async function loadProducts() {
  errorMessage.value = ''

  try {
    const result = await apiRequest<{
      products: Product[]
    }>('/admin/products')

    products.value = result.products
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to load products.'
  }
}


// SAVE A NEW PRODUCT OR UPDATE AN EXISTING ONE
async function saveProduct() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (productForm.value.status === 'published' && !productDownloadPngFile.value && !productDownloadPngUrl.value) {
      throw new Error('Upload the downloadable transparent PNG before publishing this product.')
    }

    const uploadedUrls = await uploadContentImages(productSelectedFiles.value, 'products')
    const imageUrls = [...productExistingImageUrls.value, ...uploadedUrls]
    const manualUrl = productForm.value.image_url.trim()
    if (!imageUrls.length && manualUrl) imageUrls.push(manualUrl)

    let downloadablePngUrl = productDownloadPngUrl.value
    let downloadablePngPublicId = productDownloadPngPublicId.value
    if (productDownloadPngFile.value) {
      const uploadedPng = await uploadProductDownloadPng(productDownloadPngFile.value)
      downloadablePngUrl = uploadedPng.image_url
      downloadablePngPublicId = uploadedPng.public_id
    }

    const payload = {
      name: productForm.value.name.trim(),
      division: productForm.value.division,
      category: productForm.value.category.trim(),
      description: productForm.value.description.trim(),
      price: Number(productForm.value.price),
      image_url: imageUrls[0] || manualUrl || null,
      image_urls: imageUrls,
      download_png_url: downloadablePngUrl || null,
      download_png_public_id: downloadablePngPublicId || null,
      stock: Number(productForm.value.stock),
      status: productForm.value.status,
    }

    const isEditing = editingProductId.value !== null
    const path = isEditing
      ? `/admin/products/${editingProductId.value}`
      : '/admin/products'

    const result = await apiRequest<{ message: string; product: Product }>(path, {
      method: isEditing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })

    resetProductForm()
    await loadProducts()
    await loadDashboard()
    successMessage.value = result.message
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to save product.'
  } finally {
    loading.value = false
  }
}


// LOAD A PRODUCT INTO THE FORM FOR EDITING
function editProduct(product: Product) {
  resetProductPhotoSelection()
  resetProductDownloadPngSelection()
  editingProductId.value = product.id
  productExistingImageUrls.value = getContentImages(product)
  productDownloadPngUrl.value = product.download_png_url || ''
  productDownloadPngPublicId.value = product.download_png_public_id || ''
  productDownloadPngPreview.value = product.download_png_url || ''

  productForm.value = {
    name: product.name,
    division: product.division || 'shop',
    category: product.category,
    description: product.description,
    price: Number(product.price),
    image_url: product.image_url || productExistingImageUrls.value[0] || '',
    stock: Number(product.stock),
    status: product.status,
  }

  errorMessage.value = ''
  successMessage.value = ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}


// DELETE A PRODUCT
async function deleteProduct(product: Product) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
  )

  if (!confirmed) return

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await apiRequest<{
      message: string
    }>(`/admin/products/${product.id}`, {
      method: 'DELETE',
    })

    if (editingProductId.value === product.id) {
      resetProductForm()
    }

    await loadProducts()
    await loadDashboard()

    successMessage.value = result.message
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to delete product.'
  } finally {
    loading.value = false
  }
}

// Separate, non-gallery download asset for the digital product.
function resetProductDownloadPngSelection() {
  if (productDownloadPngPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(productDownloadPngPreview.value)
  }
  productDownloadPngFile.value = null
  productDownloadPngPreview.value = ''
  productDownloadPngUrl.value = ''
  productDownloadPngPublicId.value = ''
  if (productDownloadPngInput.value) productDownloadPngInput.value.value = ''
}

function handleProductDownloadPngChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.type !== 'image/png' || !file.name.toLowerCase().endsWith('.png')) {
    errorMessage.value = 'The downloadable product file must be a PNG. Please use a transparent-background PNG.'
    input.value = ''
    return
  }
  if (file.size > MAX_DOWNLOAD_PNG_BYTES) {
    errorMessage.value = 'The downloadable PNG must be 15 MB or smaller.'
    input.value = ''
    return
  }

  if (productDownloadPngPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(productDownloadPngPreview.value)
  }
  productDownloadPngFile.value = file
  productDownloadPngPreview.value = URL.createObjectURL(file)
  errorMessage.value = ''
}

function removeProductDownloadPng() {
  resetProductDownloadPngSelection()
}

async function uploadProductDownloadPng(file: File): Promise<{ image_url: string; public_id: string }> {
  const formData = new FormData()
  formData.append('image', file)
  return await apiRequest<{ image_url: string; public_id: string }>(
    '/admin/uploads/product-download-png',
    { method: 'POST', body: formData },
  )
}

// ==========================================
// PHOTOSHOOT MANAGEMENT + MULTI-PHOTO CLOUDINARY UPLOAD
// ==========================================
const MAX_PHOTOSHOOT_IMAGES = 10
const MAX_PHOTOSHOOT_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTOSHOOT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAX_CONTENT_IMAGES = 10
const MAX_CONTENT_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_CONTENT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type UploadedImage = { image_url: string; public_id: string }

function getContentImages(item: { image_url?: string | null; image_urls?: string[] | null }): string[] {
  const saved = Array.isArray(item.image_urls)
    ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : []
  if (saved.length) return saved
  return item.image_url ? [item.image_url] : []
}

function validateImageSelection(files: File[], currentCount: number, sectionName: string): boolean {
  if (currentCount + files.length > MAX_CONTENT_IMAGES) {
    errorMessage.value = `You can attach up to ${MAX_CONTENT_IMAGES} photos to one ${sectionName.toLowerCase()}.`
    return false
  }
  for (const file of files) {
    if (!ALLOWED_CONTENT_IMAGE_TYPES.includes(file.type)) {
      errorMessage.value = `${file.name}: choose a JPG, PNG, or WebP image.`
      return false
    }
    if (file.size > MAX_CONTENT_IMAGE_BYTES) {
      errorMessage.value = `${file.name}: each image must be 5 MB or smaller.`
      return false
    }
  }
  errorMessage.value = ''
  return true
}

async function uploadContentImages(files: File[], folder: 'announcements' | 'products'): Promise<string[]> {
  if (!files.length) return []
  const formData = new FormData()
  // Put the folder field first, although the endpoint also derives it from the URL.
  formData.append('folder', folder)
  for (const file of files) formData.append('images', file)

  const result = await apiRequest<{ images: UploadedImage[] }>(`/admin/uploads/content/${folder}`, {
    method: 'POST',
    body: formData,
  })
  return result.images.map((image) => image.image_url)
}

function revokePreviews(previews: { url: string }[]) {
  for (const preview of previews) {
    if (preview.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  }
}

function handleAnnouncementFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  if (!validateImageSelection(files, announcementSelectedFiles.value.length, 'announcement')) {
    input.value = ''
    return
  }
  for (const file of files) {
    announcementSelectedFiles.value.push(file)
    announcementSelectedPreviews.value.push({ file, url: URL.createObjectURL(file) })
  }
  input.value = ''
}

function removeAnnouncementFile(index: number) {
  const preview = announcementSelectedPreviews.value[index]
  if (preview?.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  announcementSelectedPreviews.value.splice(index, 1)
  announcementSelectedFiles.value.splice(index, 1)
}

function resetAnnouncementPhotoSelection() {
  revokePreviews(announcementSelectedPreviews.value)
  announcementSelectedPreviews.value = []
  announcementSelectedFiles.value = []
  if (announcementFileInput.value) announcementFileInput.value.value = ''
}

function handleProductFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  if (!validateImageSelection(files, productExistingImageUrls.value.length + productSelectedFiles.value.length, 'product')) {
    input.value = ''
    return
  }
  for (const file of files) {
    productSelectedFiles.value.push(file)
    productSelectedPreviews.value.push({ file, url: URL.createObjectURL(file) })
  }
  input.value = ''
}

function removeSelectedProductFile(index: number) {
  const preview = productSelectedPreviews.value[index]
  if (preview?.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  productSelectedPreviews.value.splice(index, 1)
  productSelectedFiles.value.splice(index, 1)
}

function removeExistingProductImage(index: number) {
  productExistingImageUrls.value.splice(index, 1)
  productForm.value.image_url = productExistingImageUrls.value[0] || ''
}

function resetProductPhotoSelection() {
  revokePreviews(productSelectedPreviews.value)
  productSelectedPreviews.value = []
  productSelectedFiles.value = []
  productExistingImageUrls.value = []
  if (productFileInput.value) productFileInput.value.value = ''
}

function getPhotoshootImages(item: Pick<Photoshoot, 'image_url' | 'image_urls'>): string[] {
  const savedImages = Array.isArray(item.image_urls)
    ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : []

  if (savedImages.length) return savedImages
  return item.image_url ? [item.image_url] : []
}

function revokePhotoshootPreviews() {
  for (const preview of photoshootSelectedPreviews.value) {
    if (preview.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  }
  photoshootSelectedPreviews.value = []
}

function resetPhotoshootForm() {
  revokePhotoshootPreviews()
  editingPhotoshootId.value = null
  photoshootSelectedFiles.value = []
  photoshootExistingImageUrls.value = []

  photoshootForm.value = {
    title: '',
    theme: '',
    description: '',
    image_url: '',
    shoot_date: '',
    status: 'draft',
  }

  if (photoshootFileInput.value) photoshootFileInput.value.value = ''
}

function removeSelectedPhotoshootImage(index: number) {
  const preview = photoshootSelectedPreviews.value[index]
  if (preview?.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  photoshootSelectedPreviews.value.splice(index, 1)
  photoshootSelectedFiles.value.splice(index, 1)
}

function removeExistingPhotoshootImage(index: number) {
  photoshootExistingImageUrls.value.splice(index, 1)
}

function handlePhotoshootFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (!files.length) return

  if (photoshootExistingImageUrls.value.length + photoshootSelectedFiles.value.length + files.length > MAX_PHOTOSHOOT_IMAGES) {
    errorMessage.value = `You can attach up to ${MAX_PHOTOSHOOT_IMAGES} photos to one photoshoot.`
    input.value = ''
    return
  }

  for (const file of files) {
    if (!ALLOWED_PHOTOSHOOT_TYPES.includes(file.type)) {
      errorMessage.value = `${file.name}: choose a JPG, PNG, or WebP image.`
      input.value = ''
      return
    }
    if (file.size > MAX_PHOTOSHOOT_IMAGE_BYTES) {
      errorMessage.value = `${file.name}: each image must be 5 MB or smaller.`
      input.value = ''
      return
    }
  }

  errorMessage.value = ''
  for (const file of files) {
    photoshootSelectedFiles.value.push(file)
    photoshootSelectedPreviews.value.push({ file, url: URL.createObjectURL(file) })
  }

  // Reset to let the user pick the same file again if needed.
  input.value = ''
}

async function loadPhotoshoots() {
  errorMessage.value = ''

  try {
    const result = await apiRequest<{ photoshoots: Photoshoot[] }>('/admin/photoshoots')
    photoshoots.value = result.photoshoots
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to load photoshoots.'
  }
}

async function uploadPhotoshootImages(): Promise<string[]> {
  if (!photoshootSelectedFiles.value.length) {
    return [...photoshootExistingImageUrls.value]
  }

  const formData = new FormData()
  for (const file of photoshootSelectedFiles.value) {
    formData.append('images', file)
  }

  const result = await apiRequest<{
    message: string
    images: { image_url: string; public_id: string }[]
  }>('/admin/uploads/photoshoot-image', {
    method: 'POST',
    body: formData,
  })

  const uploadedUrls = result.images.map((image) => image.image_url)
  return [...photoshootExistingImageUrls.value, ...uploadedUrls]
}

async function savePhotoshoot() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!photoshootForm.value.title.trim()) {
    errorMessage.value = 'Please enter a photoshoot title.'
    return
  }

  if (photoshootExistingImageUrls.value.length + photoshootSelectedFiles.value.length === 0) {
    errorMessage.value = 'Please choose at least one photo to upload.'
    return
  }

  loading.value = true

  try {
    // Upload any newly selected files, then save all retained and new URLs together.
    const imageUrls = await uploadPhotoshootImages()
    if (!imageUrls.length) {
      throw new Error('A photoshoot must contain at least one photo.')
    }

    const payload = {
      title: photoshootForm.value.title.trim(),
      theme: photoshootForm.value.theme.trim(),
      description: photoshootForm.value.description.trim(),
      image_url: imageUrls[0],
      image_urls: imageUrls,
      shoot_date: photoshootForm.value.shoot_date || null,
      status: photoshootForm.value.status,
    }

    const isEditing = editingPhotoshootId.value !== null
    const path = isEditing
      ? `/admin/photoshoots/${editingPhotoshootId.value}`
      : '/admin/photoshoots'

    const result = await apiRequest<{ message: string; photoshoot: Photoshoot }>(path, {
      method: isEditing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })

    resetPhotoshootForm()
    await loadPhotoshoots()
    await loadDashboard()
    successMessage.value = result.message || 'Photoshoot saved successfully.'
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to save photoshoot.'
  } finally {
    loading.value = false
  }
}

function editPhotoshoot(item: Photoshoot) {
  revokePhotoshootPreviews()
  editingPhotoshootId.value = item.id
  photoshootSelectedFiles.value = []
  photoshootExistingImageUrls.value = getPhotoshootImages(item)
  photoshootForm.value = {
    title: item.title,
    theme: item.theme || '',
    description: item.description || '',
    image_url: item.image_url || photoshootExistingImageUrls.value[0] || '',
    shoot_date: item.shoot_date ? String(item.shoot_date).slice(0, 10) : '',
    status: item.status,
  }
  if (photoshootFileInput.value) photoshootFileInput.value.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deletePhotoshoot(item: Photoshoot) {
  const confirmed = window.confirm(
    `Delete the photoshoot "${item.title}"? This removes its database record.`,
  )
  if (!confirmed) return

  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await apiRequest<{ message: string }>(`/admin/photoshoots/${item.id}`, {
      method: 'DELETE',
    })
    if (editingPhotoshootId.value === item.id) resetPhotoshootForm()
    await loadPhotoshoots()
    await loadDashboard()
    successMessage.value = result.message || 'Photoshoot deleted.'
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to delete photoshoot.'
  } finally {
    loading.value = false
  }
}

// ==========================================
// NAUX HOTEL ROOM MANAGEMENT + MULTI-PHOTO UPLOAD
// ==========================================
const MAX_HOTEL_ROOM_IMAGES = 10

function getHotelRoomImages(item: Pick<HotelRoom, 'image_url' | 'image_urls'>): string[] {
  const saved = Array.isArray(item.image_urls)
    ? item.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : []
  if (saved.length) return saved
  return item.image_url ? [item.image_url] : []
}

function revokeHotelRoomPreviews() {
  revokePreviews(hotelRoomSelectedPreviews.value)
  hotelRoomSelectedPreviews.value = []
}

function resetHotelRoomForm() {
  revokeHotelRoomPreviews()
  editingHotelRoomId.value = null
  hotelRoomSelectedFiles.value = []
  hotelRoomExistingImageUrls.value = []
  hotelRoomForm.value = {
    name: '',
    room_type: 'Deluxe Room',
    description: '',
    price_per_night: 0,
    max_guests: 2,
    amenities: '',
    status: 'draft',
  }
  if (hotelRoomFileInput.value) hotelRoomFileInput.value.value = ''
}

function handleHotelRoomFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  if (hotelRoomExistingImageUrls.value.length + hotelRoomSelectedFiles.value.length + files.length > MAX_HOTEL_ROOM_IMAGES) {
    errorMessage.value = `You can attach up to ${MAX_HOTEL_ROOM_IMAGES} photos to one hotel room.`
    input.value = ''
    return
  }
  for (const file of files) {
    if (!ALLOWED_CONTENT_IMAGE_TYPES.includes(file.type)) {
      errorMessage.value = `${file.name}: choose a JPG, PNG, or WebP image.`
      input.value = ''
      return
    }
    if (file.size > MAX_CONTENT_IMAGE_BYTES) {
      errorMessage.value = `${file.name}: each image must be 5 MB or smaller.`
      input.value = ''
      return
    }
  }
  errorMessage.value = ''
  for (const file of files) {
    hotelRoomSelectedFiles.value.push(file)
    hotelRoomSelectedPreviews.value.push({ file, url: URL.createObjectURL(file) })
  }
  input.value = ''
}

function removeSelectedHotelRoomImage(index: number) {
  const preview = hotelRoomSelectedPreviews.value[index]
  if (preview?.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
  hotelRoomSelectedPreviews.value.splice(index, 1)
  hotelRoomSelectedFiles.value.splice(index, 1)
}

function removeExistingHotelRoomImage(index: number) {
  hotelRoomExistingImageUrls.value.splice(index, 1)
}

async function loadHotelRooms() {
  errorMessage.value = ''
  try {
    const result = await apiRequest<{ rooms: HotelRoom[] }>('/admin/hotel-rooms')
    hotelRooms.value = result.rooms
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load hotel rooms.'
  }
}

async function uploadHotelRoomImages(): Promise<string[]> {
  if (!hotelRoomSelectedFiles.value.length) return [...hotelRoomExistingImageUrls.value]
  const formData = new FormData()
  for (const file of hotelRoomSelectedFiles.value) formData.append('images', file)
  const result = await apiRequest<{ images: UploadedImage[] }>('/admin/uploads/content/hotel-rooms', {
    method: 'POST',
    body: formData,
  })
  return [...hotelRoomExistingImageUrls.value, ...result.images.map((image) => image.image_url)]
}

async function saveHotelRoom() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!hotelRoomForm.value.name.trim()) {
    errorMessage.value = 'Please enter a room name.'
    return
  }
  if (hotelRoomExistingImageUrls.value.length + hotelRoomSelectedFiles.value.length < 1) {
    errorMessage.value = 'Please upload at least one photo for this room.'
    return
  }
  loading.value = true
  try {
    const imageUrls = await uploadHotelRoomImages()
    if (!imageUrls.length) throw new Error('Please upload at least one room photo.')
    const payload = {
      name: hotelRoomForm.value.name.trim(),
      room_type: hotelRoomForm.value.room_type.trim(),
      description: hotelRoomForm.value.description.trim(),
      price_per_night: Number(hotelRoomForm.value.price_per_night),
      max_guests: Number(hotelRoomForm.value.max_guests),
      amenities: hotelRoomForm.value.amenities.trim(),
      image_url: imageUrls[0],
      image_urls: imageUrls,
      status: hotelRoomForm.value.status,
    }
    const isEditing = editingHotelRoomId.value !== null
    const path = isEditing ? `/admin/hotel-rooms/${editingHotelRoomId.value}` : '/admin/hotel-rooms'
    const result = await apiRequest<{ message: string; room: HotelRoom }>(path, {
      method: isEditing ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    })
    resetHotelRoomForm()
    await loadHotelRooms()
    successMessage.value = result.message || 'Hotel room saved successfully.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save hotel room.'
  } finally {
    loading.value = false
  }
}

function editHotelRoom(room: HotelRoom) {
  revokeHotelRoomPreviews()
  editingHotelRoomId.value = room.id
  hotelRoomSelectedFiles.value = []
  hotelRoomExistingImageUrls.value = getHotelRoomImages(room)
  hotelRoomForm.value = {
    name: room.name,
    room_type: room.room_type || 'Deluxe Room',
    description: room.description || '',
    price_per_night: Number(room.price_per_night),
    max_guests: Number(room.max_guests || 2),
    amenities: room.amenities || '',
    status: room.status,
  }
  if (hotelRoomFileInput.value) hotelRoomFileInput.value.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deleteHotelRoom(room: HotelRoom) {
  if (!window.confirm(`Delete ${room.name}? This removes the room listing but leaves its images in Cloudinary.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string }>(`/admin/hotel-rooms/${room.id}`, { method: 'DELETE' })
    if (editingHotelRoomId.value === room.id) resetHotelRoomForm()
    await loadHotelRooms()
    successMessage.value = result.message || 'Hotel room deleted.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete hotel room.'
  } finally {
    loading.value = false
  }
}

// ==========================================
// MODEL APPLICATIONS, HOTEL INQUIRIES & CONTACT MESSAGES
// ==========================================

async function loadModelApplications() {
  errorMessage.value = ''
  try {
    const result = await apiRequest<{ applications: Omit<ModelApplication, 'draft_status'>[] }>(
      '/admin/model-applications',
    )
    modelApplications.value = result.applications.map((item) => ({
      ...item,
      draft_status: item.status,
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load model applications.'
  }
}

async function saveModelApplicationStatus(item: ModelApplication) {
  if (admin.value?.role !== 'admin') {
    errorMessage.value = 'Only an administrator can update application statuses.'
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string; application: Omit<ModelApplication, 'draft_status'> }>(
      `/admin/model-applications/${item.id}`,
      { method: 'PATCH', body: JSON.stringify({ status: item.draft_status }) },
    )
    item.status = result.application.status
    item.draft_status = result.application.status
    await loadDashboard()
    successMessage.value = result.message || 'Application status updated.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update application status.'
  } finally {
    loading.value = false
  }
}

async function deleteModelApplication(item: ModelApplication) {
  if (!window.confirm(`Delete the application from ${item.full_name}? This cannot be undone.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string }>(`/admin/model-applications/${item.id}`, { method: 'DELETE' })
    await loadModelApplications()
    await loadDashboard()
    successMessage.value = result.message || 'Application deleted.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete application.'
  } finally {
    loading.value = false
  }
}

async function loadHotelInquiries() {
  errorMessage.value = ''
  try {
    const result = await apiRequest<{ inquiries: Omit<HotelInquiry, 'draft_status'>[] }>('/admin/hotel-inquiries')
    hotelInquiries.value = result.inquiries.map((item) => ({ ...item, draft_status: item.status }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load hotel inquiries.'
  }
}

async function saveHotelInquiryStatus(item: HotelInquiry) {
  if (admin.value?.role !== 'admin') {
    errorMessage.value = 'Only an administrator can update inquiry statuses.'
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string; inquiry: Omit<HotelInquiry, 'draft_status'> }>(
      `/admin/hotel-inquiries/${item.id}`,
      { method: 'PATCH', body: JSON.stringify({ status: item.draft_status }) },
    )
    item.status = result.inquiry.status
    item.draft_status = result.inquiry.status
    await loadDashboard()
    successMessage.value = result.message || 'Hotel inquiry status updated.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update hotel inquiry status.'
  } finally {
    loading.value = false
  }
}

async function deleteHotelInquiry(item: HotelInquiry) {
  if (!window.confirm(`Delete the hotel inquiry from ${item.full_name}? This cannot be undone.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string }>(`/admin/hotel-inquiries/${item.id}`, { method: 'DELETE' })
    await loadHotelInquiries()
    await loadDashboard()
    successMessage.value = result.message || 'Hotel inquiry deleted.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete hotel inquiry.'
  } finally {
    loading.value = false
  }
}

async function loadContactMessages() {
  errorMessage.value = ''
  try {
    const result = await apiRequest<{ messages: Omit<ContactMessage, 'draft_status'>[] }>('/admin/contact-messages')
    contactMessages.value = result.messages.map((item) => ({ ...item, draft_status: item.status }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load contact messages.'
  }
}

async function saveContactMessageStatus(item: ContactMessage) {
  if (admin.value?.role !== 'admin') {
    errorMessage.value = 'Only an administrator can update message statuses.'
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string; contactMessage: Omit<ContactMessage, 'draft_status'> }>(
      `/admin/contact-messages/${item.id}`,
      { method: 'PATCH', body: JSON.stringify({ status: item.draft_status }) },
    )
    item.status = result.contactMessage.status
    item.draft_status = result.contactMessage.status
    await loadDashboard()
    successMessage.value = result.message || 'Contact message status updated.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update contact message status.'
  } finally {
    loading.value = false
  }
}

async function deleteContactMessage(item: ContactMessage) {
  if (!window.confirm(`Delete the message from ${item.full_name}? This cannot be undone.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string }>(`/admin/contact-messages/${item.id}`, { method: 'DELETE' })
    await loadContactMessages()
    await loadDashboard()
    successMessage.value = result.message || 'Contact message deleted.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to delete contact message.'
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  errorMessage.value = ''
  try {
    const result = await apiRequest<{ orders: ShopOrder[] }>('/admin/orders')
    orders.value = result.orders.map((order) => ({
      ...order,
      draft_status: order.status,
      draft_payment_status: order.payment_status,
      items: Array.isArray(order.items) ? order.items : [],
    }))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load shop orders.'
  }
}

async function saveOrderStatus(order: ShopOrder) {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    const result = await apiRequest<{ message: string }>(`/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: order.draft_status, payment_status: order.draft_payment_status }),
    })
    await loadOrders()
    await loadProducts()
    await loadDashboard()
    successMessage.value = result.message || 'Shop order updated.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to update shop order.'
    await loadOrders()
  } finally {
    loading.value = false
  }
}

function orderEmailLink(order: ShopOrder) {
  const subject = `House of Jiæzélle order ${order.order_number}`
  const body = `Hello ${order.customer_name},\n\nWe are contacting you about order ${order.order_number}.\n\nThank you,\nHouse of Jiæzélle`
  return `mailto:${order.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function formatCurrency(value: string | number) {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
    : '₱0.00'
}

function contactReplyLink(item: ContactMessage) {
  const subject = `Re: ${item.subject || 'Your message to House of Jiæzélle'}`
  return `mailto:${item.email}?subject=${encodeURIComponent(subject)}`
}

async function selectSection(section: string) {
  activeSection.value = section

  errorMessage.value = ''
  successMessage.value = ''

  if (section === 'Announcements') {
    await loadAnnouncements()
  }

  if (section === 'Products') {
    await loadProducts()
  }

  if (section === 'Orders') {
    await loadOrders()
  }

  if (section === 'Photoshoots') {
    await loadPhotoshoots()
  }

  if (section === 'Hotel Rooms') {
    await loadHotelRooms()
  }

  if (section === 'Model Applications') {
    await loadModelApplications()
  }

  if (section === 'Hotel Inquiries') {
    await loadHotelInquiries()
  }

  if (section === 'Contact Messages') {
    await loadContactMessages()
  }
}

function formatDate(value: string) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onBeforeUnmount(() => {
  revokePhotoshootPreviews()
  revokePreviews(productSelectedPreviews.value)
  revokePreviews(announcementSelectedPreviews.value)
  revokeHotelRoomPreviews()
  if (productDownloadPngPreview.value.startsWith('blob:')) URL.revokeObjectURL(productDownloadPngPreview.value)
})

onMounted(async () => {
  if (!token.value) return

  try {
    const result = await apiRequest<{ admin: Admin }>('/auth/me')

    admin.value = result.admin

    await loadDashboard()
  } catch {
    token.value = ''
    admin.value = null

    sessionStorage.removeItem('house_admin_token')
  }
})
</script>

<template>
  <div class="admin-layout">
    <!-- LOGIN SCREEN -->
    <main v-if="!isAuthenticated" class="login-wrapper">
      <form class="login-card" @submit.prevent="login">
        <RouterLink to="/" class="login-brand">
          <span class="login-monogram">J.</span>
          <span class="eyebrow">HOUSE OF JIÆZÉLLE</span>
        </RouterLink>

        <p class="eyebrow">PRIVATE ADMINISTRATION</p>

        <h1>Welcome <em>back.</em></h1>

        <p class="login-description">
          Sign in to manage the House, its announcements,
          and creative divisions.
        </p>

        <label for="admin-email">Administrator email</label>

        <input
          id="admin-email"
          v-model="loginForm.email"
          type="email"
          autocomplete="username"
          placeholder="Enter your administrator email"
          required
          maxlength="254"
          :disabled="loading"
        />

        <label for="admin-password">Password</label>

        <input
          id="admin-password"
          v-model="loginForm.password"
          type="password"
          autocomplete="current-password"
          placeholder="Enter your password"
          required
          maxlength="128"
          :disabled="loading"
        />

        <p v-if="errorMessage" class="message error-message">
          {{ errorMessage }}
        </p>

        <button class="login-button" type="submit" :disabled="loading">
          {{ loading ? 'SIGNING IN...' : 'SIGN IN TO THE HOUSE' }}
        </button>

        <RouterLink to="/" class="login-back">
          ← Return to the website
        </RouterLink>

        <p class="login-footnote">
          Authorized administrators only.
        </p>
      </form>
    </main>

    <!-- ADMIN DASHBOARD -->
    <template v-else>
      <aside class="sidebar">
        <RouterLink to="/" class="brand">
          <span class="brand-mark">J.</span>

          <span>
            <strong>HOUSE OF JIÆZÉLLE</strong>
            <small>ADMINISTRATION</small>
          </span>
        </RouterLink>

        <p class="nav-label">WORKSPACE</p>

        <button
          v-for="section in sections"
          :key="section"
          class="nav-item"
          :class="{ selected: activeSection === section }"
          @click="selectSection(section)"
        >
          <span class="nav-dot">✧</span>
          {{ section }}
        </button>

        <div class="sidebar-bottom">
          <span class="status-dot"></span>
          Connected workspace

          <RouterLink to="/" class="back-link">
            ← View website
          </RouterLink>

          <button class="logout-button" @click="logout()">
            SIGN OUT
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <span class="eyebrow">HOUSE MANAGEMENT</span>
            <h1>{{ activeSection }}</h1>
          </div>

          <div class="admin-profile">
            <span class="avatar">H</span>

            <span>
              <strong>{{ admin?.email }}</strong>
              <small>{{ admin?.role }}</small>
            </span>
          </div>
        </header>

        <p v-if="errorMessage" class="message error-message">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="message success-message">
          {{ successMessage }}
        </p>

        <!-- OVERVIEW -->
        <template v-if="activeSection === 'Overview'">
          <section class="welcome-panel">
            <div>
              <span class="eyebrow">THE HOUSE AT A GLANCE</span>

              <h2>Welcome to your <em>House.</em></h2>

              <p>
                Your central workspace for company content,
                creative projects, and inquiries.
              </p>

              <button
                class="refresh-button"
                :disabled="loading"
                @click="loadDashboard"
              >
                REFRESH STATISTICS
              </button>
            </div>

            <span class="welcome-ornament">J.</span>
          </section>

          <section class="stats-grid">
            <article
              v-for="stat in stats"
              :key="stat.label"
              class="stat-card"
            >
              <div class="stat-top">
                <span>{{ stat.label }}</span>
                <span class="stat-icon">{{ stat.icon }}</span>
              </div>

              <strong class="stat-value">{{ stat.value }}</strong>
              <small>{{ stat.note }}</small>
            </article>
          </section>

          <section class="content-panel">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">YOUR WORKSPACE</span>
                <h2>Management Activity</h2>
              </div>

              <input
                v-model="search"
                type="search"
                placeholder="Search activity..."
                aria-label="Search management activity"
              />
            </div>

            <article
              v-for="(activity, index) in filteredActivities"
              :key="activity.title"
              class="activity-row"
            >
              <span class="activity-number">
                {{ String(index + 1).padStart(2, '0') }}
              </span>

              <div class="activity-description">
                <strong>{{ activity.title }}</strong>
                <small>{{ activity.detail }}</small>
              </div>

              <span class="activity-date">{{ activity.date }}</span>
            </article>

            <p v-if="!filteredActivities.length" class="empty-state">
              No matching activities found.
            </p>
          </section>

          <section class="divisions">
            <span class="eyebrow">ONE HOUSE · FOUR WORLDS</span>
            <h2>Your Companies</h2>

            <div class="division-grid">
              <RouterLink to="/shop" class="division-card">
                <span>01</span>
                <strong>House of Jiæzélle Shop</strong>
                <small>Travel &amp; Lifestyle</small>
              </RouterLink>

              <RouterLink to="/naux-hotel" class="division-card">
                <span>02</span>
                <strong>NAUX Hotel</strong>
                <small>Hospitality</small>
              </RouterLink>

              <RouterLink to="/jn-couture" class="division-card">
                <span>03</span>
                <strong>JN Couture</strong>
                <small>Fashion &amp; Design</small>
              </RouterLink>

              <RouterLink
                to="/nausicaa-creative-studios"
                class="division-card"
              >
                <span>04</span>
                <strong>Nausicaa Creative Studios</strong>
                <small>Creative Arts</small>
              </RouterLink>
            </div>
          </section>
        </template>

        <!-- ANNOUNCEMENTS -->
        <template v-else-if="activeSection === 'Announcements'">
          <section class="content-panel section-preview">
            <span class="eyebrow">CONTENT MANAGEMENT</span>
            <h2>Create an announcement</h2>

            <form class="announcement-form" @submit.prevent="createAnnouncement">
              <label for="announcement-title">Title</label>

              <input
                id="announcement-title"
                v-model="announcementForm.title"
                maxlength="200"
                required
                placeholder="Announcement title"
                :disabled="loading"
              />

              <label for="announcement-category">Category</label>

              <input
                id="announcement-category"
                v-model="announcementForm.category"
                maxlength="100"
                required
                placeholder="THE HOUSE"
                :disabled="loading"
              />

              <label for="announcement-summary">Summary</label>

              <input
                id="announcement-summary"
                v-model="announcementForm.summary"
                maxlength="500"
                placeholder="A short introduction"
                :disabled="loading"
              />

              <label for="announcement-content">Full announcement</label>

              <textarea
                id="announcement-content"
                v-model="announcementForm.content"
                maxlength="20000"
                rows="5"
                placeholder="Write the announcement here..."
                required
                :disabled="loading"
              ></textarea>

              <label for="announcement-images">Announcement Photos (JPG, PNG, or WebP; max 5 MB each)</label>
              <input
                id="announcement-images"
                ref="announcementFileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                :disabled="loading"
                @change="handleAnnouncementFiles"
              />
              <p class="upload-help">Optional: select up to 10 photos for this announcement. Each image must be 5 MB or smaller.</p>

              <div v-if="announcementSelectedPreviews.length" class="content-image-preview-grid">
                <article v-for="(preview, index) in announcementSelectedPreviews" :key="preview.url" class="photoshoot-preview-item">
                  <img :src="preview.url" :alt="preview.file.name" class="photoshoot-preview" />
                  <small>{{ preview.file.name }}</small>
                  <button class="refresh-button" type="button" :disabled="loading" @click="removeAnnouncementFile(index)">REMOVE</button>
                </article>
              </div>
              <p v-if="announcementSelectedFiles.length" class="upload-help">{{ announcementSelectedFiles.length }} of {{ MAX_CONTENT_IMAGES }} photos selected.</p>

              <label for="announcement-status">Publication status</label>

              <select
                id="announcement-status"
                v-model="announcementForm.status"
                :disabled="loading"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <button
                class="return-button"
                type="submit"
                :disabled="loading"
              >
                {{ loading ? 'SAVING...' : 'SAVE ANNOUNCEMENT' }}
              </button>
            </form>
          </section>

          <section class="content-panel">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">DATABASE RECORDS</span>
                <h2>Existing Announcements</h2>
              </div>

              <button
                class="refresh-button"
                @click="loadAnnouncements"
              >
                REFRESH
              </button>
            </div>

            <p v-if="!announcements.length" class="empty-state">
              No announcements found. Create your first announcement above.
            </p>

            <article
              v-for="announcement in announcements"
              :key="announcement.id"
              class="announcement-row"
            >
              <div v-if="getContentImages(announcement).length" class="content-record-thumbnails">
                <img
                  v-for="(imageUrl, imageIndex) in getContentImages(announcement).slice(0, 3)"
                  :key="`${announcement.id}-${imageIndex}-${imageUrl}`"
                  :src="imageUrl"
                  :alt="`${announcement.title} photo ${imageIndex + 1}`"
                  class="content-record-thumbnail"
                  loading="lazy"
                />
                <span v-if="getContentImages(announcement).length > 3" class="photoshoot-more-count">+{{ getContentImages(announcement).length - 3 }}</span>
              </div>
              <div>
                <strong>{{ announcement.title }}</strong>

                <p>{{ announcement.summary || 'No summary provided.' }}</p>

                <small>
                  {{ announcement.category }}
                  · {{ formatDate(announcement.created_at) }}
                </small>
              </div>

              <span
                class="announcement-status"
                :class="announcement.status"
              >
                {{ announcement.status }}
              </span>
            </article>
          </section>
        </template>

        <!-- PRODUCTS MANAGEMENT -->
<template v-else-if="activeSection === 'Products'">

  <section class="content-panel section-preview">
    <span class="eyebrow">DIGITAL PRODUCT MANAGEMENT</span>

    <h2>
      {{ editingProductId !== null ? 'Edit Product' : 'Add a Product' }}
    </h2>

    <p>
      Manage your travel essentials, product descriptions,
      prices, inventory, and publication status.
    </p>

    <form class="announcement-form" @submit.prevent="saveProduct">

      <label for="product-name">Product Name</label>

      <input
        id="product-name"
        v-model="productForm.name"
        maxlength="200"
        required
        placeholder="e.g. Signature Travel Bag"
        :disabled="loading"
      />

      <label for="product-division">Product Division</label>
      <select
        id="product-division"
        v-model="productForm.division"
        :disabled="loading"
        required
      >
        <option value="shop">House of Jiæzélle Shop</option>
        <option value="couture">JN Couture</option>
      </select>

      <label for="product-category">Category</label>

      <input
        id="product-category"
        v-model="productForm.category"
        maxlength="100"
        required
        placeholder="Travel Essentials"
        :disabled="loading"
      />

      <label for="product-description">Description</label>

      <textarea
        id="product-description"
        v-model="productForm.description"
        maxlength="10000"
        rows="4"
        placeholder="Describe the product..."
        :disabled="loading"
      ></textarea>

      <label for="product-price">Price (PHP)</label>

      <input
        id="product-price"
        v-model.number="productForm.price"
        type="number"
        min="0"
        step="0.01"
        required
        :disabled="loading"
      />

      <label for="product-stock">Available Stock</label>

      <input
        id="product-stock"
        v-model.number="productForm.stock"
        type="number"
        min="0"
        step="1"
        required
        :disabled="loading"
      />

      <label for="product-images">Product Photos (JPG, PNG, or WebP; max 5 MB each)</label>
      <input
        id="product-images"
        ref="productFileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        :disabled="loading"
        @change="handleProductFiles"
      />
      <p class="upload-help">Optional: select up to 10 photos for this product. Existing photos remain when editing unless you remove them below.</p>

      <div v-if="productExistingImageUrls.length || productSelectedPreviews.length" class="content-image-preview-grid">
        <article v-for="(imageUrl, index) in productExistingImageUrls" :key="`saved-product-${imageUrl}-${index}`" class="photoshoot-preview-item">
          <img :src="imageUrl" :alt="`Saved product photo ${index + 1}`" class="photoshoot-preview" />
          <small>Saved photo {{ index + 1 }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeExistingProductImage(index)">REMOVE</button>
        </article>
        <article v-for="(preview, index) in productSelectedPreviews" :key="`new-product-${preview.url}`" class="photoshoot-preview-item">
          <img :src="preview.url" :alt="preview.file.name" class="photoshoot-preview" />
          <small>{{ preview.file.name }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeSelectedProductFile(index)">REMOVE</button>
        </article>
      </div>
      <p v-if="productExistingImageUrls.length + productSelectedFiles.length" class="upload-help">
        {{ productExistingImageUrls.length + productSelectedFiles.length }} of {{ MAX_CONTENT_IMAGES }} photos selected.
      </p>

      <div class="downloadable-png-uploader">
        <label for="product-download-png">Downloadable Product PNG <span class="optional-label">NOT SHOWN IN THE PUBLIC GALLERY</span></label>
        <input
          id="product-download-png"
          ref="productDownloadPngInput"
          type="file"
          accept="image/png,.png"
          :disabled="loading"
          @change="handleProductDownloadPngChange"
        />
        <p class="upload-help">Upload the actual transparent-background PNG customers download when they click Purchase. PNG only · maximum 15 MB. This is separate from the optional preview photos above.</p>
        <div v-if="productDownloadPngPreview" class="download-png-preview-panel">
          <div class="download-png-checkerboard">
            <img :src="productDownloadPngPreview" alt="Downloadable transparent PNG preview visible only in admin" />
          </div>
          <div class="download-png-file-info">
            <strong>{{ productDownloadPngFile?.name || 'Saved downloadable PNG' }}</strong>
            <small>{{ productDownloadPngFile ? `${(productDownloadPngFile.size / (1024 * 1024)).toFixed(2)} MB · pending upload` : 'Stored in Cloudinary' }}</small>
          </div>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeProductDownloadPng">REMOVE PNG</button>
        </div>
        <p v-else class="upload-help">No downloadable PNG selected. A published product requires this file for its Purchase button to work.</p>
      </div>

      <label for="product-status">Publication Status</label>

      <select
        id="product-status"
        v-model="productForm.status"
        :disabled="loading"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      <div class="product-form-actions">

        <button
          class="return-button"
          type="submit"
          :disabled="loading"
        >
          {{
            loading
              ? 'SAVING...'
              : editingProductId !== null
                ? 'UPDATE PRODUCT'
                : 'SAVE PRODUCT'
          }}
        </button>

        <button
          v-if="editingProductId !== null"
          class="refresh-button"
          type="button"
          :disabled="loading"
          @click="resetProductForm"
        >
          CANCEL EDITING
        </button>

      </div>

    </form>
  </section>


  <!-- EXISTING PRODUCTS -->
  <section class="content-panel">

    <div class="panel-heading">

      <div>
        <span class="eyebrow">POSTGRESQL RECORDS</span>
        <h2>Digital Product Inventory</h2>
      </div>

      <button
        class="refresh-button"
        type="button"
        :disabled="loading"
        @click="loadProducts"
      >
        REFRESH PRODUCTS
      </button>

    </div>

    <p class="product-count">
      Total products: {{ products.length }}
    </p>

    <p v-if="!products.length" class="empty-state">
      No products found. Add your first Shop or JN Couture digital product using the form above.
    </p>

    <article
      v-for="product in products"
      :key="product.id"
      class="product-row"
    >

      <div v-if="getContentImages(product).length" class="content-record-thumbnails product-record-thumbnails">
        <img
          v-for="(imageUrl, imageIndex) in getContentImages(product).slice(0, 3)"
          :key="`${product.id}-${imageIndex}-${imageUrl}`"
          :src="imageUrl"
          :alt="`${product.name} photo ${imageIndex + 1}`"
          class="content-record-thumbnail"
          loading="lazy"
        />
        <span v-if="getContentImages(product).length > 3" class="photoshoot-more-count">+{{ getContentImages(product).length - 3 }}</span>
      </div>

      <div class="product-details">

        <strong>{{ product.name }}</strong>

        <p>
          {{ product.description || 'No description provided.' }}
        </p>

        <small>
          Division: {{ product.division === 'couture' ? 'JN Couture' : 'House of Jiæzélle Shop' }}
        </small>

        <small>
          {{ product.category }}
          · PHP {{ Number(product.price).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) }}
          · Stock: {{ product.stock }}
        </small>

        <small>
          Added {{ formatDate(product.created_at) }}
        </small>

      </div>

      <span
        class="announcement-status"
        :class="product.status"
      >
        {{ product.status }}
      </span>

      <span class="announcement-status" :class="product.download_png_url ? 'published' : 'archived'">
        {{ product.download_png_url ? 'DOWNLOAD PNG READY' : 'NO DOWNLOAD PNG' }}
      </span>

      <div class="product-actions">

        <button
          class="refresh-button"
          type="button"
          :disabled="loading"
          @click="editProduct(product)"
        >
          EDIT
        </button>

        <button
          class="delete-product-button"
          type="button"
          :disabled="loading || admin?.role !== 'admin'"
          @click="deleteProduct(product)"
        >
          DELETE
        </button>

      </div>

    </article>

  </section>

</template>


<!-- SHOP ORDERS -->
<template v-else-if="activeSection === 'Orders'">
  <section class="content-panel section-preview">
    <span class="eyebrow">HOUSE OF JIÆZÉLLE SHOP · CHECKOUT</span>
    <h2>Shop Orders</h2>
    <p>Review customer orders, confirm fulfillment, and track payment status. Orders are placed using cash on delivery; online payments are not collected by this website.</p>
    <div class="management-toolbar">
      <span class="product-count">Total orders: {{ orders.length }} · Pending: {{ orders.filter(item => item.status === 'pending').length }}</span>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadOrders">REFRESH ORDERS</button>
    </div>
    <p v-if="!orders.length" class="empty-state">No shop orders have been placed yet.</p>
    <article v-for="order in orders" :key="order.id" class="management-row">
      <div class="management-main">
        <div class="management-title-line">
          <strong>{{ order.order_number }} · {{ order.customer_name }}</strong>
          <span class="announcement-status" :class="order.status">{{ order.status }}</span>
        </div>
        <p><a :href="`mailto:${order.customer_email}`">{{ order.customer_email }}</a> · {{ order.customer_phone }}</p>
        <p><strong>Ship to:</strong> {{ order.shipping_address }}, {{ order.city }} {{ order.postal_code }}</p>
        <div class="admin-order-items">
          <div v-for="(item, index) in order.items" :key="`${order.id}-${item.product_id}-${index}`" class="admin-order-line">
            <img v-if="item.image_url" :src="item.image_url" :alt="item.product_name" loading="lazy" />
            <div class="admin-order-line-copy">
              <strong>{{ item.product_name }} × {{ item.quantity }}</strong>
              <small>{{ formatCurrency(item.unit_price) }} each</small>
            </div>
            <strong>{{ formatCurrency(item.line_total) }}</strong>
          </div>
        </div>
        <p class="admin-order-total"><strong>Items subtotal: {{ formatCurrency(order.subtotal) }}</strong> · Delivery fee: to be confirmed</p>
        <p><strong>Payment:</strong> Cash on delivery · <strong>Payment status:</strong> {{ order.payment_status }}</p>
        <p v-if="order.notes" class="management-message"><strong>Customer notes:</strong> {{ order.notes }}</p>
        <small>Placed {{ formatDate(order.created_at) }}</small>
      </div>
      <div class="management-actions">
        <label :for="`order-status-${order.id}`">Order status</label>
        <select :id="`order-status-${order.id}`" v-model="order.draft_status" :disabled="loading || admin?.role !== 'admin'">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <label :for="`order-payment-${order.id}`">Payment status</label>
        <select :id="`order-payment-${order.id}`" v-model="order.draft_payment_status" :disabled="loading || admin?.role !== 'admin'">
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <button class="refresh-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="saveOrderStatus(order)">SAVE ORDER</button>
        <a class="refresh-button management-email-link" :href="orderEmailLink(order)">EMAIL CUSTOMER</a>
      </div>
    </article>
  </section>
</template>

<!-- NAUX HOTEL ROOM MANAGEMENT -->
<template v-else-if="activeSection === 'Hotel Rooms'">
  <section class="content-panel section-preview">
    <span class="eyebrow">NAUX HOTEL · ROOM INVENTORY</span>
    <h2>{{ editingHotelRoomId !== null ? 'Edit Hotel Room' : 'Add a Hotel Room' }}</h2>
    <p>Upload room photos, describe the stay, set the nightly rate and guest capacity, then publish the room to the public NAUX Hotel page.</p>

    <form class="announcement-form" @submit.prevent="saveHotelRoom">
      <label for="hotel-room-name">Room Name</label>
      <input id="hotel-room-name" v-model="hotelRoomForm.name" required maxlength="200" placeholder="e.g. The Rose Suite" :disabled="loading" />

      <label for="hotel-room-type">Room Type</label>
      <input id="hotel-room-type" v-model="hotelRoomForm.room_type" required maxlength="100" placeholder="Deluxe Suite, Standard Room, Family Room" :disabled="loading" />

      <label for="hotel-room-description">Description</label>
      <textarea id="hotel-room-description" v-model="hotelRoomForm.description" rows="4" maxlength="10000" placeholder="Describe the room, view, bed setup, and included details..." :disabled="loading"></textarea>

      <div class="form-two-columns">
        <label for="hotel-room-price">Price per Night (PHP)
          <input id="hotel-room-price" v-model.number="hotelRoomForm.price_per_night" type="number" min="0" step="0.01" required :disabled="loading" />
        </label>
        <label for="hotel-room-guests">Maximum Guests
          <input id="hotel-room-guests" v-model.number="hotelRoomForm.max_guests" type="number" min="1" max="30" step="1" required :disabled="loading" />
        </label>
      </div>

      <label for="hotel-room-amenities">Amenities <span class="optional-label">OPTIONAL</span></label>
      <textarea id="hotel-room-amenities" v-model="hotelRoomForm.amenities" rows="2" maxlength="2000" placeholder="e.g. King bed, Wi-Fi, breakfast, balcony" :disabled="loading"></textarea>

      <label for="hotel-room-photos">Room Photos (JPG, PNG, WebP · up to 10 photos · max 5 MB each)</label>
      <input id="hotel-room-photos" ref="hotelRoomFileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple :disabled="loading" @change="handleHotelRoomFiles" />
      <p class="upload-help">Select multiple room photos at once. Saved photos are kept when editing unless you remove them below.</p>

      <div v-if="hotelRoomExistingImageUrls.length || hotelRoomSelectedPreviews.length" class="photoshoot-preview-grid">
        <article v-for="(imageUrl, index) in hotelRoomExistingImageUrls" :key="`room-saved-${imageUrl}-${index}`" class="photoshoot-preview-item">
          <img :src="imageUrl" :alt="`Saved hotel room photo ${index + 1}`" class="photoshoot-preview" />
          <small>Saved photo {{ index + 1 }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeExistingHotelRoomImage(index)">REMOVE</button>
        </article>
        <article v-for="(preview, index) in hotelRoomSelectedPreviews" :key="`room-new-${preview.url}`" class="photoshoot-preview-item">
          <img :src="preview.url" :alt="preview.file.name" class="photoshoot-preview" />
          <small>{{ preview.file.name }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeSelectedHotelRoomImage(index)">REMOVE</button>
        </article>
      </div>
      <p v-if="hotelRoomExistingImageUrls.length + hotelRoomSelectedFiles.length" class="upload-help">{{ hotelRoomExistingImageUrls.length + hotelRoomSelectedFiles.length }} of {{ MAX_HOTEL_ROOM_IMAGES }} photos selected.</p>

      <label for="hotel-room-status">Publication Status</label>
      <select id="hotel-room-status" v-model="hotelRoomForm.status" :disabled="loading">
        <option value="draft">Draft — hidden from visitors</option>
        <option value="published">Published — visible on NAUX Hotel</option>
        <option value="archived">Archived</option>
      </select>

      <div class="product-form-actions">
        <button class="return-button" type="submit" :disabled="loading">{{ loading ? 'UPLOADING / SAVING...' : editingHotelRoomId !== null ? 'UPDATE HOTEL ROOM' : 'UPLOAD & SAVE ROOM' }}</button>
        <button v-if="editingHotelRoomId !== null" class="refresh-button" type="button" :disabled="loading" @click="resetHotelRoomForm">CANCEL EDITING</button>
      </div>
    </form>
  </section>

  <section class="content-panel">
    <div class="panel-heading">
      <div><span class="eyebrow">POSTGRESQL RECORDS</span><h2>NAUX Hotel Room Listings</h2></div>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadHotelRooms">REFRESH ROOMS</button>
    </div>
    <p class="product-count">Total room listings: {{ hotelRooms.length }}</p>
    <p v-if="!hotelRooms.length" class="empty-state">No hotel rooms yet. Add a room and upload its photos above.</p>
    <article v-for="room in hotelRooms" :key="room.id" class="hotel-room-row">
      <div v-if="getHotelRoomImages(room).length" class="hotel-room-image-strip">
        <img v-for="(imageUrl, index) in getHotelRoomImages(room).slice(0, 4)" :key="`${room.id}-${index}-${imageUrl}`" :src="imageUrl" :alt="`${room.name} photo ${index + 1}`" class="hotel-room-thumbnail" loading="lazy" />
        <span v-if="getHotelRoomImages(room).length > 4" class="photoshoot-more-count">+{{ getHotelRoomImages(room).length - 4 }}</span>
      </div>
      <div class="product-details">
        <strong>{{ room.name }}</strong>
        <p>{{ room.description || 'No description provided.' }}</p>
        <small>{{ room.room_type }} · PHP {{ Number(room.price_per_night).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} per night · Up to {{ room.max_guests }} guests</small>
        <small>{{ getHotelRoomImages(room).length }} photo{{ getHotelRoomImages(room).length === 1 ? '' : 's' }} · {{ room.amenities || 'No amenities listed' }}</small>
      </div>
      <span class="announcement-status" :class="room.status">{{ room.status }}</span>
      <div class="product-actions">
        <button class="refresh-button" type="button" :disabled="loading" @click="editHotelRoom(room)">EDIT</button>
        <button class="delete-product-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="deleteHotelRoom(room)">DELETE</button>
      </div>
    </article>
  </section>
</template>

<!-- PHOTOSHOOT MANAGEMENT -->
<template v-else-if="activeSection === 'Photoshoots'">
  <section class="content-panel section-preview">
    <span class="eyebrow">NAUSICAA CREATIVE STUDIOS</span>
    <h2>{{ editingPhotoshootId !== null ? 'Edit Photoshoot' : 'Add a Photoshoot' }}</h2>
    <p>Upload editorial images to Cloudinary, then save the photoshoot details to PostgreSQL.</p>

    <form class="announcement-form" @submit.prevent="savePhotoshoot">
      <label for="photoshoot-title">Photoshoot Title</label>
      <input
        id="photoshoot-title"
        v-model="photoshootForm.title"
        maxlength="200"
        required
        placeholder="e.g. The Rose Gold Edit"
        :disabled="loading"
      />

      <label for="photoshoot-theme">Theme</label>
      <input
        id="photoshoot-theme"
        v-model="photoshootForm.theme"
        maxlength="200"
        placeholder="e.g. Couture Beauty Editorial"
        :disabled="loading"
      />

      <label for="photoshoot-description">Description</label>
      <textarea
        id="photoshoot-description"
        v-model="photoshootForm.description"
        maxlength="10000"
        rows="4"
        placeholder="Describe the concept, styling, and creative direction..."
        :disabled="loading"
      ></textarea>

      <label for="photoshoot-image">Photoshoot Photos (JPG, PNG, or WebP; max 5 MB each)</label>
      <input
        id="photoshoot-image"
        ref="photoshootFileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        :disabled="loading"
        @change="handlePhotoshootFileChange"
      />
      <p class="upload-help">Select multiple photos at once. You can attach up to 10 photos per photoshoot; each photo must be 5 MB or smaller. When editing, saved photos stay in place unless you remove them below.</p>

      <div v-if="photoshootExistingImageUrls.length || photoshootSelectedPreviews.length" class="photoshoot-preview-grid">
        <article
          v-for="(imageUrl, index) in photoshootExistingImageUrls"
          :key="`saved-${imageUrl}-${index}`"
          class="photoshoot-preview-item"
        >
          <img :src="imageUrl" :alt="`Saved photoshoot photo ${index + 1}`" class="photoshoot-preview" />
          <small>Saved photo {{ index + 1 }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeExistingPhotoshootImage(index)">
            REMOVE
          </button>
        </article>

        <article
          v-for="(preview, index) in photoshootSelectedPreviews"
          :key="`new-${preview.url}`"
          class="photoshoot-preview-item"
        >
          <img :src="preview.url" :alt="preview.file.name" class="photoshoot-preview" />
          <small>{{ preview.file.name }}</small>
          <button class="refresh-button" type="button" :disabled="loading" @click="removeSelectedPhotoshootImage(index)">
            REMOVE
          </button>
        </article>
      </div>
      <p v-if="photoshootExistingImageUrls.length + photoshootSelectedFiles.length" class="upload-help">
        {{ photoshootExistingImageUrls.length + photoshootSelectedFiles.length }} of {{ MAX_PHOTOSHOOT_IMAGES }} photos selected.
      </p>

      <label for="photoshoot-date">Shoot Date</label>
      <input
        id="photoshoot-date"
        v-model="photoshootForm.shoot_date"
        type="date"
        :disabled="loading"
      />

      <label for="photoshoot-status">Publication Status</label>
      <select id="photoshoot-status" v-model="photoshootForm.status" :disabled="loading">
        <option value="draft">Draft — hidden from visitors</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      <div class="product-form-actions">
        <button class="return-button" type="submit" :disabled="loading">
          {{ loading ? 'UPLOADING / SAVING...' : editingPhotoshootId !== null ? 'UPDATE PHOTOSHOOT' : 'UPLOAD & SAVE PHOTOSHOOT' }}
        </button>
        <button
          v-if="editingPhotoshootId !== null"
          class="refresh-button"
          type="button"
          :disabled="loading"
          @click="resetPhotoshootForm"
        >
          CANCEL EDITING
        </button>
      </div>
    </form>
  </section>

  <section class="content-panel">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">POSTGRESQL RECORDS</span>
        <h2>Photoshoot Gallery</h2>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadPhotoshoots">
        REFRESH PHOTOSHOOTS
      </button>
    </div>

    <p class="product-count">Total photoshoots: {{ photoshoots.length }}</p>
    <p v-if="!photoshoots.length" class="empty-state">No photoshoots yet. Upload your first set of editorial photos above.</p>

    <article v-for="item in photoshoots" :key="item.id" class="photoshoot-row">
      <div v-if="getPhotoshootImages(item).length" class="photoshoot-gallery-thumbnails">
        <img
          v-for="(imageUrl, imageIndex) in getPhotoshootImages(item).slice(0, 4)"
          :key="`${item.id}-${imageIndex}-${imageUrl}`"
          :src="imageUrl"
          :alt="`${item.title} photo ${imageIndex + 1}`"
          class="photoshoot-thumbnail"
          loading="lazy"
        />
        <span v-if="getPhotoshootImages(item).length > 4" class="photoshoot-more-count">+{{ getPhotoshootImages(item).length - 4 }}</span>
      </div>
      <div class="product-details">
        <strong>{{ item.title }}</strong>
        <p>{{ item.description || 'No description provided.' }}</p>
        <small>{{ item.theme || 'No theme specified' }} · {{ item.shoot_date ? formatDate(item.shoot_date) : 'Date not set' }}</small>
        <small>{{ getPhotoshootImages(item).length }} photo{{ getPhotoshootImages(item).length === 1 ? '' : 's' }}</small>
        <small>Added {{ formatDate(item.created_at) }}</small>
      </div>
      <span class="announcement-status" :class="item.status">{{ item.status }}</span>
      <div class="product-actions">
        <button class="refresh-button" type="button" :disabled="loading" @click="editPhotoshoot(item)">EDIT</button>
        <button class="delete-product-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="deletePhotoshoot(item)">DELETE</button>
      </div>
    </article>
  </section>
</template>

<!-- MODEL APPLICATIONS -->
<template v-else-if="activeSection === 'Model Applications'">
  <section class="content-panel section-preview">
    <span class="eyebrow">NAUSICAA CREATIVE STUDIOS · CASTING</span>
    <h2>Model Applications</h2>
    <p>Review model submissions, visit portfolios, and update each applicant's status.</p>
    <div class="management-toolbar">
      <span class="product-count">Total applications: {{ modelApplications.length }} · Pending: {{ modelApplications.filter(item => item.status === 'pending').length }}</span>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadModelApplications">REFRESH APPLICATIONS</button>
    </div>
    <p v-if="!modelApplications.length" class="empty-state">No model applications have been received yet.</p>
    <article v-for="item in modelApplications" :key="item.id" class="management-row">
      <div class="management-main">
        <div class="management-title-line">
          <strong>{{ item.full_name }}</strong>
          <span class="announcement-status" :class="item.status">{{ item.status }}</span>
        </div>
        <p><a :href="`mailto:${item.email}`">{{ item.email }}</a></p>
        <p v-if="item.portfolio_url"><a :href="item.portfolio_url" target="_blank" rel="noopener noreferrer">VIEW PORTFOLIO ↗</a></p>
        <div v-if="Array.isArray(item.photo_urls) && item.photo_urls.length" class="model-application-photos">
          <a v-for="(photoUrl, photoIndex) in item.photo_urls" :key="photoUrl" :href="photoUrl" target="_blank" rel="noopener noreferrer" :aria-label="`Open model photo ${photoIndex + 1} in a new tab`">
            <img :src="photoUrl" :alt="`${item.full_name} model photo ${photoIndex + 1}`" loading="lazy" />
          </a>
        </div>
        <p v-if="item.message" class="management-message">{{ item.message }}</p>
        <small>Submitted {{ formatDate(item.created_at) }}</small>
      </div>
      <div class="management-actions">
        <label :for="`model-status-${item.id}`">Application status</label>
        <select :id="`model-status-${item.id}`" v-model="item.draft_status" :disabled="loading || admin?.role !== 'admin'">
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button class="refresh-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="saveModelApplicationStatus(item)">SAVE STATUS</button>
        <button class="delete-product-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="deleteModelApplication(item)">DELETE</button>
      </div>
    </article>
  </section>
</template>

<!-- HOTEL INQUIRIES -->
<template v-else-if="activeSection === 'Hotel Inquiries'">
  <section class="content-panel section-preview">
    <span class="eyebrow">NAUX HOTEL · RESERVATIONS</span>
    <h2>Hotel Inquiries</h2>
    <p>Review reservation inquiries and track whether a guest has been contacted or confirmed.</p>
    <div class="management-toolbar">
      <span class="product-count">Total inquiries: {{ hotelInquiries.length }} · Pending: {{ hotelInquiries.filter(item => item.status === 'pending').length }}</span>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadHotelInquiries">REFRESH INQUIRIES</button>
    </div>
    <p v-if="!hotelInquiries.length" class="empty-state">No hotel inquiries have been received yet.</p>
    <article v-for="item in hotelInquiries" :key="item.id" class="management-row">
      <div class="management-main">
        <div class="management-title-line">
          <strong>{{ item.full_name }}</strong>
          <span class="announcement-status" :class="item.status">{{ item.status }}</span>
        </div>
        <p><a :href="`mailto:${item.email}`">{{ item.email }}</a></p>
        <p class="management-dates"><strong>Check-in:</strong> {{ item.check_in ? formatDate(item.check_in) : 'Not provided' }} <span>·</span> <strong>Check-out:</strong> {{ item.check_out ? formatDate(item.check_out) : 'Not provided' }} <span>·</span> <strong>Guests:</strong> {{ item.guests ?? 'Not specified' }}</p>
        <p v-if="item.message" class="management-message">{{ item.message }}</p>
        <small>Received {{ formatDate(item.created_at) }}</small>
      </div>
      <div class="management-actions">
        <label :for="`hotel-status-${item.id}`">Inquiry status</label>
        <select :id="`hotel-status-${item.id}`" v-model="item.draft_status" :disabled="loading || admin?.role !== 'admin'">
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button class="refresh-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="saveHotelInquiryStatus(item)">SAVE STATUS</button>
        <a class="refresh-button management-email-link" :href="`mailto:${item.email}?subject=${encodeURIComponent('NAUX Hotel reservation inquiry')}`">EMAIL GUEST</a>
        <button class="delete-product-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="deleteHotelInquiry(item)">DELETE</button>
      </div>
    </article>
  </section>
</template>

<!-- CONTACT MESSAGES -->
<template v-else-if="activeSection === 'Contact Messages'">
  <section class="content-panel section-preview">
    <span class="eyebrow">THE HOUSE · INBOX</span>
    <h2>Contact Messages</h2>
    <p>Review messages from the public, track their progress, and open your email application to reply.</p>
    <div class="management-toolbar">
      <span class="product-count">Total messages: {{ contactMessages.length }} · Unread: {{ contactMessages.filter(item => item.status === 'unread').length }}</span>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadContactMessages">REFRESH MESSAGES</button>
    </div>
    <p v-if="!contactMessages.length" class="empty-state">No contact messages have been received yet.</p>
    <article v-for="item in contactMessages" :key="item.id" class="management-row">
      <div class="management-main">
        <div class="management-title-line">
          <strong>{{ item.subject || 'No subject' }}</strong>
          <span class="announcement-status" :class="item.status">{{ item.status }}</span>
        </div>
        <p class="management-sender">From <strong>{{ item.full_name }}</strong> · <a :href="`mailto:${item.email}`">{{ item.email }}</a></p>
        <p class="management-message">{{ item.message }}</p>
        <small>Received {{ formatDate(item.created_at) }}</small>
      </div>
      <div class="management-actions">
        <label :for="`contact-status-${item.id}`">Message status</label>
        <select :id="`contact-status-${item.id}`" v-model="item.draft_status" :disabled="loading || admin?.role !== 'admin'">
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <button class="refresh-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="saveContactMessageStatus(item)">SAVE STATUS</button>
        <a class="refresh-button management-email-link" :href="contactReplyLink(item)">REPLY BY EMAIL</a>
        <button class="delete-product-button" type="button" :disabled="loading || admin?.role !== 'admin'" @click="deleteContactMessage(item)">DELETE</button>
      </div>
    </article>
  </section>
</template>

        <footer class="admin-footer">
          <span>© 2026 HOUSE OF JIÆZÉLLE</span>
          <span>FOR EVERY DESTINATION, FOR EVERY ADVENTURE.</span>
        </footer>
      </main>
    </template>
  </div>
</template>

<style>
.login-wrapper {
  grid-column: 1 / -1;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 25px;
  background:
    radial-gradient(ellipse at top, #fffaf3 0%, transparent 55%),
    var(--admin-bg);
}

.login-card {
  width: min(100%, 450px);
  padding: 42px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
  box-shadow: 0 20px 70px rgb(41 35 31 / 8%);
}

.login-brand {
  display: grid;
  justify-items: center;
  gap: 13px;
  margin-bottom: 38px;
  text-align: center;
}

.login-monogram {
  display: grid;
  place-items: center;
  width: 65px;
  height: 65px;
  border: 1px solid var(--admin-rose);
  color: var(--admin-rose);
  font: italic 42px Georgia, serif;
}

.login-card > .eyebrow {
  text-align: center;
}

.login-card h1 {
  margin: 15px 0;
  text-align: center;
  font: 400 38px Georgia, serif;
}

.login-card h1 em {
  color: var(--admin-rose);
  font-weight: 400;
}

.login-description {
  margin-bottom: 30px;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
}

.login-card label,
.announcement-form label {
  display: block;
  margin: 17px 0 8px;
  font-size: 11px;
  font-weight: 600;
}

.login-card input,
.announcement-form input,
.announcement-form textarea,
.announcement-form select {
  width: 100%;
  padding: 13px;
  border: 1px solid var(--admin-line);
  border-radius: 0;
  color: var(--admin-text);
  background: #fff;
  font: inherit;
  font-size: 12px;
}

.login-card input:focus,
.announcement-form input:focus,
.announcement-form textarea:focus,
.announcement-form select:focus {
  outline: 1px solid var(--admin-rose);
  border-color: var(--admin-rose);
}

.login-button {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: 0;
  color: white;
  background: var(--admin-dark);
  font-size: 10px !important;
  letter-spacing: 1.5px;
  cursor: pointer;
}

.login-button:disabled,
.return-button:disabled,
.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.login-back {
  display: block;
  margin-top: 23px;
  color: var(--admin-rose);
  font-size: 11px;
  text-align: center;
}

.login-footnote {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--admin-line);
  color: var(--admin-muted);
  font-size: 10px;
  text-align: center;
}

.message {
  margin: 20px 0;
  padding: 13px 15px;
  font-size: 12px;
  line-height: 1.6;
}

.error-message {
  border: 1px solid #e6b9ae;
  color: #8a3829;
  background: #fff4f0;
}

.success-message {
  border: 1px solid #c8d8bd;
  color: #3e6036;
  background: #f2f8ed;
}

.logout-button {
  flex-basis: 100%;
  padding: 10px;
  border: 1px solid #70574b;
  color: #f6eee5;
  background: transparent;
  font-size: 9px !important;
  letter-spacing: 1.2px;
  cursor: pointer;
}

.logout-button:hover {
  background: #45372f;
}

.refresh-button {
  margin-top: 20px;
  padding: 11px 14px;
  border: 1px solid var(--admin-gold);
  color: var(--admin-text);
  background: transparent;
  font-size: 9px !important;
  letter-spacing: 1px;
  cursor: pointer;
}

.announcement-form {
  display: grid;
  gap: 5px;
  margin-top: 25px;
}

.announcement-form .return-button {
  justify-self: start;
  margin-top: 20px;
}

.announcement-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-line);
}

.announcement-row:last-child {
  border-bottom: 0;
}

.announcement-row strong {
  font: 20px Georgia, serif;
}

.announcement-row p {
  margin: 8px 0;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.7;
}

.announcement-row small {
  color: var(--admin-muted);
  font-size: 10px;
}

.announcement-status {
  padding: 6px 9px;
  border: 1px solid var(--admin-line);
  font-size: 9px;
  text-transform: uppercase;
}

.announcement-status.published {
  border-color: #a8c5a0;
  color: #426a39;
}

.announcement-status.archived {
  color: var(--admin-muted);
}

@media (max-width: 500px) {
  .login-card {
    padding: 25px;
  }

  .announcement-row {
    flex-direction: column;
  }
}

/* Downloadable PNG is private to the admin editor and excluded from public product imagery. */
.downloadable-png-uploader {
  margin-top: 24px;
  padding: 20px;
  border: 1px dashed var(--admin-gold);
  background: #fbf6ef;
}
.downloadable-png-uploader > label {
  display: block;
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
}
.downloadable-png-uploader input[type="file"] {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--admin-line);
  background: #fff;
  font: inherit;
  font-size: 12px;
}
.download-png-preview-panel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 15px;
  padding: 12px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
}
.download-png-checkerboard {
  display: grid;
  place-items: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  background-color: #fff;
  background-image: linear-gradient(45deg, #e7dbce 25%, transparent 25%), linear-gradient(-45deg, #e7dbce 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e7dbce 75%), linear-gradient(-45deg, transparent 75%, #e7dbce 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
.download-png-checkerboard img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.download-png-file-info {
  display: grid;
  gap: 6px;
  flex: 1;
  min-width: 160px;
  overflow-wrap: anywhere;
}
.download-png-file-info strong { font-size: 11px; }
.download-png-file-info small { color: var(--admin-muted); font-size: 10px; }

/* ==========================================
   PRODUCT MANAGEMENT
========================================== */

.product-count {
  margin: 18px 0;
  color: var(--admin-muted);
  font-size: 11px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-line);
}

.product-row:last-child {
  border-bottom: 0;
}

.product-thumbnail {
  width: 82px;
  height: 100px;
  flex-shrink: 0;
  object-fit: cover;
  background: var(--admin-bg);
  border: 1px solid var(--admin-line);
}

.product-details {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 8px;
}

.product-details > strong {
  font: 20px Georgia, serif;
  overflow-wrap: anywhere;
}

.product-details p {
  margin: 0;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.product-details small {
  color: var(--admin-muted);
  font-size: 10px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.product-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.product-form-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}

.delete-product-button {
  padding: 11px 14px;
  border: 1px solid #b87866;
  color: #8a3829;
  background: transparent;
  font-size: 9px !important;
  letter-spacing: 1px;
  cursor: pointer;
}

.delete-product-button:hover:not(:disabled) {
  color: white;
  background: #8a3829;
}

.delete-product-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* PHOTOSHOOT UPLOAD AND GALLERY */
.upload-help {
  margin: 4px 0 12px;
  color: var(--admin-muted);
  font-size: 11px;
  line-height: 1.7;
}

.photoshoot-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 14px;
  margin: 14px 0 18px;
}

.photoshoot-preview-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
}

.photoshoot-preview-item small {
  width: 100%;
  color: var(--admin-muted);
  font-size: 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.photoshoot-preview {
  display: block;
  width: 100%;
  height: 155px;
  object-fit: cover;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
}

.content-image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.content-record-thumbnails {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.content-record-thumbnail {
  width: 62px;
  height: 74px;
  object-fit: cover;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
}

.product-record-thumbnails {
  max-width: 210px;
}

@media (max-width: 700px) {
  .content-record-thumbnail {
    width: 48px;
    height: 58px;
  }
}

.photoshoot-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-line);
}

.photoshoot-row:last-child {
  border-bottom: 0;
}

.photoshoot-gallery-thumbnails {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 5px;
  flex: 0 0 200px;
}

.photoshoot-thumbnail {
  width: 62px;
  height: 76px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
}

.photoshoot-more-count {
  display: grid;
  place-items: center;
  width: 62px;
  height: 76px;
  border: 1px solid var(--admin-line);
  color: var(--admin-rose);
  background: var(--admin-bg);
  font: 18px Georgia, serif;
}

@media (max-width: 850px) {
  .photoshoot-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .photoshoot-row .photoshoot-gallery-thumbnails {
    flex-basis: 100%;
  }

  .photoshoot-row .product-details {
    flex-basis: 100%;
  }
}

@media (max-width: 500px) {
  .photoshoot-thumbnail,
  .photoshoot-more-count {
    width: 55px;
    height: 68px;
  }

  .photoshoot-row .product-details {
    flex-basis: calc(100% - 85px);
  }
}

@media (max-width: 850px) {
  .product-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .product-details {
    flex-basis: calc(100% - 110px);
  }

  .product-row > .announcement-status {
    margin-left: 0;
  }

  .product-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 500px) {
  .product-thumbnail {
    width: 65px;
    height: 80px;
  }

  .product-details {
    flex-basis: calc(100% - 85px);
  }

  .product-details > strong {
    font-size: 17px;
  }

  .product-form-actions {
    align-items: stretch;
    flex-direction: column;
  }
}

.admin-layout {
  --admin-bg: #f5efe7;
  --admin-card: #fffdf9;
  --admin-dark: #29231f;
  --admin-text: #352b26;
  --admin-muted: #8e8177;
  --admin-rose: #b87866;
  --admin-gold: #b79a65;
  --admin-line: #e7dbce;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  color: var(--admin-text);
  background: var(--admin-bg);
  font-family: Arial, sans-serif;
}

.admin-layout * {
  box-sizing: border-box;
}

.admin-layout button,
.admin-layout input {
  font: inherit;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 27px 18px;
  color: #f6eee5;
  background: var(--admin-dark);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 5px 32px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--admin-rose);
  color: #d9a38e;
  font: italic 30px Georgia, serif;
}

.brand strong,
.brand small,
.admin-profile strong,
.admin-profile small {
  display: block;
}

.brand strong {
  font: 13px Georgia, serif;
  letter-spacing: 1px;
}

.brand small {
  margin-top: 7px;
  color: #c4a78b;
  font-size: 8px;
  letter-spacing: 2px;
}

.nav-label,
.eyebrow {
  color: var(--admin-rose);
  font-size: 9px;
  letter-spacing: 1.8px;
}

.nav-label {
  margin: 0 0 13px 10px;
  color: #b7a293;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 10px;
  margin: 2px 0;
  border: 0;
  border-radius: 2px;
  color: #d6c8bc;
  background: transparent;
  text-align: left;
  font-size: 12px !important;
  cursor: pointer;
}

.nav-item:hover,
.nav-item.selected {
  color: #fff6ed;
  background: #45372f;
}

.nav-item.selected {
  box-shadow: inset 2px 0 var(--admin-rose);
}

.nav-dot {
  color: #c49a7f;
}

.sidebar-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 17px 4px 0;
  border-top: 1px solid #4c4037;
  color: #c9b7a7;
  font-size: 10px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c8a56e;
}

.back-link {
  flex-basis: 100%;
  padding-top: 10px;
  color: #e0b6a0;
}

.main-content {
  min-width: 0;
  padding: 30px clamp(20px, 4vw, 54px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 27px;
  border-bottom: 1px solid var(--admin-line);
}

.topbar h1 {
  margin: 9px 0 0;
  font: 400 34px Georgia, serif;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border-radius: 50%;
  color: white;
  background: var(--admin-rose);
  font: 20px Georgia, serif;
}

.admin-profile strong {
  font-size: 11px;
}

.admin-profile small {
  margin-top: 5px;
  color: var(--admin-muted);
  font-size: 10px;
}

.welcome-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 205px;
  margin-top: 28px;
  padding: 32px;
  overflow: hidden;
  color: #f9efe4;
  background: var(--admin-dark);
}

.welcome-panel h2,
.content-panel h2,
.divisions h2 {
  font: 400 clamp(25px, 3vw, 36px) Georgia, serif;
}

.welcome-panel h2 {
  margin: 18px 0 10px;
}

.welcome-panel h2 em {
  color: #d6a18a;
  font-weight: 400;
}

.welcome-panel p {
  max-width: 470px;
  color: #d5c6b9;
  font-size: 12px;
  line-height: 1.8;
}

.welcome-ornament {
  padding-right: 25px;
  color: #a96f5b;
  font: italic clamp(75px, 10vw, 130px) Georgia, serif;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-top: 22px;
}

.stat-card {
  padding: 19px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  font-size: 11px;
}

.stat-icon {
  color: var(--admin-rose);
  font-size: 19px;
}

.stat-value {
  display: block;
  margin: 20px 0 9px;
  font: 400 36px Georgia, serif;
}

.stat-card > small {
  color: var(--admin-muted);
  font-size: 10px;
}

.content-panel {
  margin-top: 25px;
  padding: 27px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.panel-heading h2,
.divisions h2 {
  margin: 10px 0 0;
}

.panel-heading input {
  width: min(230px, 45%);
  padding: 11px;
  border: 1px solid var(--admin-line);
  background: #fff;
  font-size: 11px !important;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-line);
}

.activity-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.activity-number {
  color: var(--admin-rose);
  font: 22px Georgia, serif;
}

.activity-description {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.activity-description strong {
  font-size: 12px;
}

.activity-description small {
  color: var(--admin-muted);
  font-size: 10px;
}

.activity-date {
  margin-left: auto;
  color: var(--admin-gold);
  font-size: 8px;
  letter-spacing: 1px;
  text-align: right;
}

.empty-state {
  padding: 20px 0;
  color: var(--admin-muted);
  font-size: 12px;
}

.divisions {
  margin-top: 32px;
}

.divisions > .eyebrow {
  display: block;
}

.division-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.division-card {
  display: grid;
  gap: 10px;
  padding: 22px;
  border: 1px solid var(--admin-line);
  background: var(--admin-card);
  transition: border-color 0.2s;
}

.division-card:hover {
  border-color: var(--admin-rose);
}

.division-card > span {
  color: var(--admin-rose);
  font: 23px Georgia, serif;
}

.division-card strong {
  font: 20px Georgia, serif;
}

.division-card small {
  color: var(--admin-muted);
  font-size: 10px;
}

.section-preview {
  margin-top: 30px;
  padding: clamp(25px, 5vw, 50px);
}

.section-preview h2 {
  margin: 18px 0;
}

.section-preview > p {
  max-width: 650px;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.9;
}

.preview-notice {
  display: flex;
  gap: 15px;
  margin: 28px 0;
  padding: 20px;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
}

.preview-notice > span {
  color: var(--admin-rose);
  font-size: 24px;
}

.preview-notice strong {
  font-size: 12px;
}

.preview-notice p {
  color: var(--admin-muted);
  font-size: 11px;
  line-height: 1.8;
}

.return-button {
  padding: 14px 18px;
  border: 0;
  color: white;
  background: var(--admin-dark);
  font-size: 9px !important;
  letter-spacing: 1px;
  cursor: pointer;
}

.admin-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 45px;
  padding: 20px 0;
  border-top: 1px solid var(--admin-line);
  color: var(--admin-muted);
  font-size: 8px;
  letter-spacing: 1px;
}

@media (max-width: 1050px) {
  .admin-layout {
    grid-template-columns: 215px minmax(0, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    padding: 15px;
  }

  .brand {
    padding-bottom: 18px;
  }

  .sidebar .nav-label {
    margin-top: 8px;
  }

  .sidebar .nav-item {
    width: auto;
    display: inline-flex;
    padding: 10px;
  }

  .sidebar-bottom {
    margin-top: 15px;
  }

  .main-content {
    padding: 20px 15px;
  }

  .admin-profile strong {
    max-width: 115px;
    line-height: 1.4;
  }

  .welcome-panel {
    padding: 23px;
  }

  .welcome-ornament {
    display: none;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel-heading input {
    width: 100%;
  }

  .content-panel {
    padding: 19px;
  }

  .activity-row {
    gap: 10px;
  }

  .activity-date {
    max-width: 75px;
    line-height: 1.6;
  }

  .division-grid {
    grid-template-columns: 1fr;
  }

  .admin-footer {
    flex-direction: column;
    line-height: 1.8;
  }
}


/* NAUX HOTEL ROOM INVENTORY */
.hotel-room-row {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid var(--admin-line);
}
.hotel-room-row:last-child { border-bottom: 0; }
.hotel-room-image-strip {
  display: grid;
  grid-template-columns: repeat(2, 62px);
  gap: 4px;
  flex-shrink: 0;
  position: relative;
}
.hotel-room-thumbnail {
  width: 62px;
  height: 70px;
  object-fit: cover;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
}
@media (max-width: 850px) {
  .hotel-room-row { align-items: flex-start; flex-wrap: wrap; }
  .hotel-room-row .product-details { flex-basis: calc(100% - 150px); }
}
@media (max-width: 520px) {
  .hotel-room-image-strip { grid-template-columns: repeat(2, 52px); }
  .hotel-room-thumbnail { width: 52px; height: 60px; }
  .hotel-room-row .product-details { flex-basis: 100%; }
}

/* MODEL APPLICATIONS, HOTEL INQUIRIES & CONTACT MESSAGES */
.management-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0 8px;
}

.management-toolbar .refresh-button {
  margin-top: 0;
}

.management-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--admin-line);
}

.management-row:last-child {
  border-bottom: 0;
}

.management-main {
  flex: 1;
  min-width: 0;
}

.management-title-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.management-title-line > strong {
  font: 21px Georgia, serif;
  overflow-wrap: anywhere;
}

.management-main p {
  margin: 9px 0;
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.management-main a {
  color: var(--admin-rose);
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}

.management-main small {
  display: block;
  margin-top: 12px;
  color: var(--admin-muted);
  font-size: 10px;
}

.model-application-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin: 14px 0;
}

.model-application-photos a {
  display: block;
  width: 92px;
  height: 112px;
  border: 1px solid var(--admin-line);
  background: var(--admin-bg);
  overflow: hidden;
}

.model-application-photos img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.management-main .management-message {
  padding: 14px;
  border-left: 2px solid var(--admin-gold);
  background: var(--admin-bg);
  white-space: pre-wrap;
}

.management-dates {
  display: flex;
  gap: 5px;
  align-items: baseline;
  flex-wrap: wrap;
}

.management-dates strong,
.management-sender strong {
  color: var(--admin-text);
}

.management-actions {
  width: 175px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.management-actions label {
  color: var(--admin-muted);
  font-size: 10px;
  font-weight: 600;
}

.management-actions select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--admin-line);
  background: white;
  color: var(--admin-text);
  font-size: 11px;
}

.management-actions .refresh-button,
.management-actions .delete-product-button {
  width: 100%;
  margin-top: 0;
  text-align: center;
  text-decoration: none;
}

.management-actions .management-email-link {
  display: block;
}

.announcement-status.pending,
.announcement-status.unread {
  color: #8a3829;
  border-color: #e6b9ae;
}

.announcement-status.reviewing,
.announcement-status.contacted,
.announcement-status.read {
  color: #85651f;
  border-color: #d8c18f;
}

.announcement-status.accepted,
.announcement-status.confirmed,
.announcement-status.replied {
  color: #426a39;
  border-color: #a8c5a0;
}

@media (max-width: 850px) {
  .management-row {
    flex-direction: column;
  }

  .management-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .management-actions label {
    grid-column: 1 / -1;
  }
}

@media (max-width: 500px) {
  .management-actions {
    grid-template-columns: 1fr;
  }
}

/* SHOP ORDER MANAGEMENT */
.admin-order-items { display: grid; gap: 8px; margin: 14px 0; }
.admin-order-line { display: flex; align-items: center; gap: 12px; padding: 9px; border: 1px solid var(--admin-line); background: var(--admin-card); }
.admin-order-line img { width: 48px; height: 56px; object-fit: cover; background: var(--admin-bg); }
.admin-order-line-copy { display: grid; flex: 1; min-width: 0; gap: 5px; }
.admin-order-line-copy strong { font-size: 11px; overflow-wrap: anywhere; }
.admin-order-line-copy small { color: var(--admin-muted); font-size: 10px; }
.admin-order-line > strong { font-size: 11px; white-space: nowrap; }
.admin-order-total { padding-top: 12px; border-top: 1px solid var(--admin-line); }
.announcement-status.confirmed, .announcement-status.processing { color: #426a39; border-color: #a8c5a0; }
.announcement-status.shipped, .announcement-status.completed { color: #85651f; border-color: #d8c18f; }
.announcement-status.cancelled { color: #8a3829; border-color: #e6b9ae; }
@media (max-width: 850px) { .admin-order-line { align-items: flex-start; flex-wrap: wrap; } }

</style>