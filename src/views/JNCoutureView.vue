<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Product = {
  id: string | number
  name: string
  category: string
  description: string
  price: string | number
  image_url?: string | null
  image_urls?: string[] | null
  has_download_png?: boolean
  stock: number
  status: 'draft' | 'published' | 'archived'
  created_at?: string
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const products = ref<Product[]>([])
const loading = ref(true)
const loadError = ref('')
const activeCategory = ref('ALL')
const selectedImages = ref<Record<string, string>>({})
const downloadingProductId = ref<string | number | null>(null)
const downloadMessage = ref('')
const downloadError = ref('')

const categories = computed(() => [
  'ALL',
  ...new Set(products.value.map((product) => product.category?.trim()).filter((category): category is string => Boolean(category))),
])

const filteredProducts = computed(() => {
  if (activeCategory.value === 'ALL') return products.value
  return products.value.filter((product) => product.category?.toUpperCase() === activeCategory.value.toUpperCase())
})

function imagesFor(product: Product): string[] {
  const images = Array.isArray(product.image_urls)
    ? product.image_urls.filter((url) => typeof url === 'string' && url.trim())
    : []
  if (images.length) return [...new Set(images)]
  return product.image_url?.trim() ? [product.image_url.trim()] : []
}

function selectedImage(product: Product): string {
  const images = imagesFor(product)
  return selectedImages.value[String(product.id)] || images[0] || ''
}

function selectImage(product: Product, image: string) {
  selectedImages.value[String(product.id)] = image
}

function formatPrice(value: string | number): string {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
    : 'Price upon inquiry'
}

async function loadProducts() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await fetch(`${API_URL}/products?division=couture`, { headers: { Accept: 'application/json' } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to load shop products.')
    products.value = Array.isArray(data.products) ? data.products : []
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

async function purchaseAndDownload(product: Product) {
  downloadMessage.value = ''
  downloadError.value = ''
  if (!product.has_download_png) {
    downloadError.value = 'The downloadable PNG is not available for this product yet. Please check back later.'
    return
  }

  downloadingProductId.value = product.id
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(String(product.id))}/download?division=couture`, {
      headers: { Accept: 'image/png, application/json' },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Unable to download this product PNG. Please try again.')
    }

    const blob = await response.blob()
    if (!blob.size) throw new Error('The downloadable file is empty. Please contact the House.')
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeName = product.name.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'product'
    link.href = objectUrl
    link.download = `${safeName}.png`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500)
    downloadMessage.value = `${product.name} PNG download started.`
  } catch (error) {
    downloadError.value = error instanceof Error ? error.message : 'Unable to download this product PNG.'
  } finally {
    downloadingProductId.value = null
  }
}

onMounted(loadProducts)
</script>

<template>
  <div class="couture-page">
    <section class="couture-hero">
      <span class="eyebrow">JN COUTURE · DIGITAL FASHION COLLECTION</span>
      <h1>Fashion pieces, <em>ready to download.</em></h1>
      <p>Browse JN Couture's curated digital fashion collection. Each downloadable transparent PNG is uploaded by the Couture team and delivered as a PNG file when you select Purchase.</p>
      <a href="#couture-collection" class="hero-link">EXPLORE COUTURE DESIGNS <span>↓</span></a>
    </section>

    <section id="couture-collection" class="couture-collection">
      <header class="section-heading">
        <div>
          <span class="eyebrow">THE CURRENT COLLECTION</span>
          <h2>The Couture <em>Collection</em></h2>
        </div>
        <p>Only JN Couture designs published by the House appear here. Product preview photos are optional; the downloadable transparent PNG is stored separately and is not shown in the public gallery.</p>
      </header>

      <div v-if="!loading && products.length" class="couture-filters" aria-label="Filter products by category">
        <button v-for="category in categories" :key="category" type="button" :class="{ active: activeCategory === category }" @click="activeCategory = category">{{ category }}</button>
      </div>

      <p v-if="loading" class="couture-state">Preparing the Couture collection…</p>
      <div v-else-if="loadError" class="couture-state couture-state-error">
        <p>{{ loadError }}</p>
        <button type="button" class="outline-button" @click="loadProducts">TRY AGAIN</button>
      </div>
      <p v-else-if="!filteredProducts.length" class="couture-state">The Couture collection is being prepared. Published JN Couture designs will appear here.</p>

      <div v-else class="product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image-frame">
            <img v-if="selectedImage(product)" class="product-main-image" :src="selectedImage(product)" :alt="`${product.name} preview`" loading="lazy" />
            <div v-else class="image-placeholder"><span>J.</span><small>PNG DOWNLOAD</small></div>
            <span class="file-ribbon">PNG DIGITAL FILE</span>
          </div>

          <div v-if="imagesFor(product).length > 1" class="product-thumbnails" aria-label="Product preview photos">
            <button v-for="(image, index) in imagesFor(product)" :key="`${product.id}-${image}`" type="button" :class="{ selected: selectedImage(product) === image }" :aria-label="`Show ${product.name} preview ${index + 1}`" @click="selectImage(product, image)">
              <img :src="image" :alt="`${product.name} preview ${index + 1}`" loading="lazy" />
            </button>
          </div>

          <div class="product-info">
            <div class="product-category">{{ product.category }}</div>
            <h3>{{ product.name }}</h3>
            <p v-if="product.description">{{ product.description }}</p>
            <div class="product-card-bottom">
              <strong>{{ formatPrice(product.price) }}</strong>
              <span>{{ product.has_download_png ? 'PNG AVAILABLE' : 'COMING SOON' }}</span>
            </div>
            <button class="purchase-button" type="button" :disabled="!product.has_download_png || downloadingProductId === product.id" @click="purchaseAndDownload(product)">
              {{ downloadingProductId === product.id ? 'PREPARING DOWNLOAD…' : product.has_download_png ? 'PURCHASE · DOWNLOAD PNG' : 'DOWNLOAD NOT AVAILABLE' }}
            </button>
            <small class="product-download-note">The downloadable PNG is not displayed here. Purchase downloads the original PNG file.</small>
          </div>
        </article>
      </div>

      <p v-if="downloadMessage" class="download-feedback download-success" role="status">{{ downloadMessage }}</p>
      <p v-if="downloadError" class="download-feedback download-failure" role="alert">{{ downloadError }}</p>

      <div class="couture-note">
        <span class="eyebrow">JN COUTURE · FASHION AS A FORM OF EXPRESSION.</span>
        <h2>Designed by <em>JN Couture.</em></h2>
        <p>Purchase downloads the PNG immediately. This version does not collect online payment or verify a paid transaction.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.couture-page { min-height: 60vh; background: var(--ivory); color: var(--mocha); }
.eyebrow { color: var(--rose-gold); font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.couture-hero { padding: 100px 8%; text-align: center; background: var(--cream); }
.couture-hero h1 { max-width: 900px; margin: 24px auto; font: 400 clamp(45px, 6.5vw, 78px)/1.08 'Cormorant Garamond', serif; }
.couture-hero h1 em, .section-heading h2 em, .couture-note h2 em { color: var(--rose-gold); font-weight: 400; }
.couture-hero > p { max-width: 650px; margin: auto; color: var(--muted); font-size: 13px; line-height: 2; }
.hero-link { display: inline-flex; align-items: center; gap: 12px; margin-top: 30px; padding-bottom: 8px; border-bottom: 1px solid var(--rose-gold); color: var(--mocha); font-size: 9px; letter-spacing: 1.5px; }
.hero-link span { color: var(--rose-gold); font-size: 16px; }
.couture-collection { padding: 75px 8%; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 30px; margin-bottom: 30px; }
.section-heading h2 { margin: 12px 0 0; font: 400 clamp(35px, 4vw, 48px)/1.1 'Cormorant Garamond', serif; }
.section-heading > p { max-width: 390px; color: var(--muted); font-size: 11px; line-height: 1.8; }
.couture-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
.couture-filters button { padding: 11px 15px; border: 1px solid var(--line); color: var(--mocha); background: transparent; cursor: pointer; font-size: 8px; letter-spacing: 1px; }
.couture-filters button:hover, .couture-filters button.active { border-color: var(--rose-gold); color: #fff; background: var(--rose-gold); }
.product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 25px; align-items: start; }
.product-card { min-width: 0; border: 1px solid var(--line); background: #fffdf9; }
.product-image-frame { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 4.5; overflow: hidden; background: var(--cream); }
.product-main-image { width: 100%; height: 100%; object-fit: contain; transition: transform .5s ease; }
.image-placeholder { display: grid; place-items: center; gap: 10px; width: 100%; height: 100%; color: var(--rose-gold); background: var(--cream); }
.image-placeholder span { font: italic 88px 'Cormorant Garamond', serif; }
.image-placeholder small { font-size: 8px; letter-spacing: 2px; }
.file-ribbon { position: absolute; top: 14px; left: 14px; padding: 8px 10px; color: #fff; background: rgb(53 43 38 / 82%); font-size: 8px; letter-spacing: 1px; }
.product-thumbnails { display: flex; gap: 7px; padding: 10px 12px 0; overflow-x: auto; }
.product-thumbnails button { flex: 0 0 48px; height: 54px; padding: 0; border: 1px solid var(--line); background: white; cursor: pointer; }
.product-thumbnails button.selected { border: 2px solid var(--rose-gold); }
.product-thumbnails img { width: 100%; height: 100%; object-fit: cover; }
.product-info { padding: 22px; }
.product-category { color: var(--rose-gold); font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; }
.product-info h3 { margin: 10px 0; font: 400 27px/1.15 'Cormorant Garamond', serif; overflow-wrap: anywhere; }
.product-info > p { min-height: 45px; color: var(--muted); font-size: 11px; line-height: 1.8; white-space: pre-line; overflow-wrap: anywhere; }
.product-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
.product-card-bottom strong { font: 500 15px Georgia, serif; }
.product-card-bottom span { color: var(--antique-gold); font-size: 8px; letter-spacing: 1px; text-align: right; }
.purchase-button { width: 100%; margin-top: 18px; padding: 14px 16px; border: 1px solid var(--mocha); color: #fffaf3; background: var(--mocha); cursor: pointer; font-size: 9px; letter-spacing: 1.2px; transition: background .2s ease; }
.purchase-button:hover:not(:disabled) { background: var(--rose-gold); border-color: var(--rose-gold); }
.purchase-button:disabled { opacity: .55; cursor: not-allowed; }
.product-download-note { display: block; margin-top: 12px; color: var(--muted); font-size: 9px; line-height: 1.7; }
.couture-state { padding: 28px; text-align: center; color: var(--muted); background: #fffdf9; border: 1px solid var(--line); font-size: 12px; line-height: 1.8; }
.couture-state-error { color: #8a3829; }
.outline-button { margin-top: 14px; padding: 10px 15px; border: 1px solid var(--rose-gold); color: var(--mocha); background: transparent; cursor: pointer; font-size: 9px; letter-spacing: 1px; }
.download-feedback { margin: 22px 0 0; padding: 13px 16px; font-size: 12px; line-height: 1.6; }
.download-success { border: 1px solid #c8d8bd; color: #3e6036; background: #f2f8ed; }
.download-failure { border: 1px solid #e6b9ae; color: #8a3829; background: #fff4f0; }
.couture-note { margin-top: 65px; padding: 50px 20px; text-align: center; background: var(--cream); }
.couture-note h2 { margin: 15px 0 0; font: 400 40px 'Cormorant Garamond', serif; }
.couture-note p { max-width: 700px; margin: 15px auto 0; color: var(--muted); font-size: 10px; line-height: 1.8; }
@media (max-width: 1000px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 650px) { .couture-hero { padding: 75px 7%; } .couture-collection { padding: 50px 7%; } .section-heading { align-items: flex-start; flex-direction: column; gap: 8px; } .product-grid { grid-template-columns: 1fr; } }
</style>
