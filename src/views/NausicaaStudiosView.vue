<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Photoshoot = {
  id: string | number
  title: string
  theme: string
  description: string
  image_url?: string | null
  image_urls?: string[] | null
  shoot_date: string | null
  status: 'draft' | 'published' | 'archived'
  created_at?: string
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const photoshoots = ref<Photoshoot[]>([])
const loading = ref(true)
const loadError = ref('')
const activeTheme = ref('ALL')

const applicationForm = ref({ full_name: '', email: '', portfolio_url: '', message: '' })
const selectedModelPhotos = ref<File[]>([])
const modelPhotoPreviews = ref<{ file: File; url: string }[]>([])
const modelPhotoInput = ref<HTMLInputElement | null>(null)
const MAX_MODEL_PHOTOS = 5
const MAX_MODEL_PHOTO_SIZE = 5 * 1024 * 1024
const allowedModelPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']
const applicationLoading = ref(false)
const applicationError = ref('')
const applicationSuccess = ref('')

function clearModelPhotoPreviews() {
  for (const preview of modelPhotoPreviews.value) URL.revokeObjectURL(preview.url)
  modelPhotoPreviews.value = []
}

function handleModelPhotoChange(event: Event) {
  applicationError.value = ''
  const input = event.target as HTMLInputElement
  const chosenFiles = Array.from(input.files ?? [])

  if (!chosenFiles.length) {
    clearModelPhotoPreviews()
    selectedModelPhotos.value = []
    return
  }

  if (chosenFiles.length > MAX_MODEL_PHOTOS) {
    input.value = ''
    applicationError.value = `Please choose no more than ${MAX_MODEL_PHOTOS} photos.`
    return
  }

  const invalidType = chosenFiles.find((file) => !allowedModelPhotoTypes.includes(file.type))
  if (invalidType) {
    input.value = ''
    applicationError.value = 'Please upload JPG, PNG, or WebP photos only.'
    return
  }

  const tooLarge = chosenFiles.find((file) => file.size > MAX_MODEL_PHOTO_SIZE)
  if (tooLarge) {
    input.value = ''
    applicationError.value = 'Each photo must be 5 MB or smaller.'
    return
  }

  clearModelPhotoPreviews()
  selectedModelPhotos.value = chosenFiles
  modelPhotoPreviews.value = chosenFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))
}

function removeModelPhoto(index: number) {
  const removed = modelPhotoPreviews.value[index]
  if (removed) URL.revokeObjectURL(removed.url)
  modelPhotoPreviews.value.splice(index, 1)
  selectedModelPhotos.value.splice(index, 1)
  if (modelPhotoInput.value) {
    // Synchronize the browser file input with the current selected files.
    const transfer = new DataTransfer()
    selectedModelPhotos.value.forEach((file) => transfer.items.add(file))
    modelPhotoInput.value.files = transfer.files
  }
}

async function submitApplication() {
  applicationLoading.value = true
  applicationError.value = ''
  applicationSuccess.value = ''
  try {
    if (!selectedModelPhotos.value.length) {
      throw new Error('Please upload at least one model photo to complete your application.')
    }

    const formData = new FormData()
    formData.append('full_name', applicationForm.value.full_name.trim())
    formData.append('email', applicationForm.value.email.trim())
    formData.append('portfolio_url', applicationForm.value.portfolio_url.trim())
    formData.append('message', applicationForm.value.message.trim())
    selectedModelPhotos.value.forEach((file) => formData.append('model_photos', file))

    const response = await fetch(`${API_URL}/model-applications`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to submit your application.')

    applicationSuccess.value = data.message || 'Your application has been submitted.'
    applicationForm.value = { full_name: '', email: '', portfolio_url: '', message: '' }
    selectedModelPhotos.value = []
    clearModelPhotoPreviews()
    if (modelPhotoInput.value) modelPhotoInput.value.value = ''
  } catch (error) {
    applicationError.value = error instanceof Error ? error.message : 'Unable to submit your application. Please try again.'
  } finally {
    applicationLoading.value = false
  }
}

const themes = computed(() => [
  'ALL',
  ...new Set(photoshoots.value.map((shoot) => shoot.theme?.trim()).filter((theme): theme is string => Boolean(theme))),
])

const filteredPhotoshoots = computed(() => {
  if (activeTheme.value === 'ALL') return photoshoots.value
  return photoshoots.value.filter(
    (shoot) => shoot.theme?.toUpperCase() === activeTheme.value.toUpperCase(),
  )
})

function imagesFor(shoot: Photoshoot): string[] {
  const images = Array.isArray(shoot.image_urls)
    ? shoot.image_urls.filter((url) => typeof url === 'string' && url.trim())
    : []
  if (images.length) return [...new Set(images)]
  return shoot.image_url?.trim() ? [shoot.image_url.trim()] : []
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'NAUSICAA CREATIVE STUDIOS'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'NAUSICAA CREATIVE STUDIOS'
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase()
}

async function loadPhotoshoots() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await fetch(`${API_URL}/photoshoots`, {
      headers: { Accept: 'application/json' },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to load studio photoshoots.')
    photoshoots.value = Array.isArray(data.photoshoots) ? data.photoshoots : []
  } catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : 'Unable to load photoshoots. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPhotoshoots)
onBeforeUnmount(clearModelPhotoPreviews)
</script>

<template>
  <div class="studio-page">
    <section class="studio-hero">
      <span class="eyebrow">NAUSICAA CREATIVE STUDIOS</span>
      <h1>Stories told <em>through a lens.</em></h1>
      <p>
        A creative space for fashion editorials, visual storytelling,
        themed shoots, and the people who bring each vision to life.
      </p>
      <a class="hero-link" href="#studio-gallery">DISCOVER OUR STORIES <span>↓</span></a>
    </section>

    <section class="studio-gallery" id="studio-gallery">
      <div class="gallery-heading">
        <div>
          <span class="eyebrow">SELECTED WORKS &amp; CREATIVE STORIES</span>
          <h2>The Studio <em>Gallery</em></h2>
        </div>
        <p>Each collection begins with an idea and becomes a story of its own.</p>
      </div>

      <div v-if="!loading && photoshoots.length" class="theme-filters" aria-label="Filter photoshoots by theme">
        <button
          v-for="theme in themes"
          :key="theme"
          type="button"
          :class="{ active: activeTheme === theme }"
          @click="activeTheme = theme"
        >
          {{ theme }}
        </button>
      </div>

      <p v-if="loading" class="studio-state">Preparing the studio gallery…</p>
      <div v-else-if="loadError" class="studio-state studio-state-error">
        <p>{{ loadError }}</p>
        <button type="button" class="outline-button" @click="loadPhotoshoots">TRY AGAIN</button>
      </div>
      <p v-else-if="!filteredPhotoshoots.length" class="studio-state">
        New creative stories are in the making. Published photoshoots will appear here.
      </p>

      <div v-else class="shoot-grid">
        <article v-for="(shoot, shootIndex) in filteredPhotoshoots" :key="shoot.id" class="shoot-card">
          <div class="shoot-card-heading">
            <span class="shoot-index">{{ String(shootIndex + 1).padStart(2, '0') }}</span>
            <span class="shoot-theme">{{ shoot.theme || 'CREATIVE STORY' }}</span>
          </div>

          <div v-if="imagesFor(shoot).length" class="shoot-images">
            <img
              v-for="(image, imageIndex) in imagesFor(shoot)"
              :key="`${shoot.id}-${image}-${imageIndex}`"
              :src="image"
              :alt="`${shoot.title} — photo ${imageIndex + 1}`"
              loading="lazy"
              :class="{ 'shoot-image-featured': imageIndex === 0 && imagesFor(shoot).length > 2 }"
            />
          </div>
          <div v-else class="shoot-placeholder"><span>N.</span><small>NAUSICAA CREATIVE STUDIOS</small></div>

          <div class="shoot-copy">
            <span class="shoot-date">{{ formatDate(shoot.shoot_date || shoot.created_at) }}</span>
            <h3>{{ shoot.title }}</h3>
            <p v-if="shoot.description">{{ shoot.description }}</p>
            <div class="shoot-card-footer">
              <span>{{ shoot.theme || 'STUDIO JOURNAL' }}</span>
              <span>{{ imagesFor(shoot).length }} PHOTO{{ imagesFor(shoot).length === 1 ? '' : 'S' }}</span>
            </div>
          </div>
        </article>
      </div>

      <section class="studio-callout">
        <span class="eyebrow">A NEW STORY STARTS HERE</span>
        <h2>Ideas become <em>images.</em></h2>
        <p>
          Follow the House for upcoming themed shoots, creative projects,
          model searches, and official casting announcements.
        </p>
      </section>

      <section class="application-panel" id="model-application">
        <div class="application-intro">
          <span class="eyebrow">MODEL SEARCH &amp; CASTING</span>
          <h2>Become part of <em>the story.</em></h2>
          <p>Tell us a little about yourself and share a portfolio link if you have one. Our studio team will review your application.</p>
        </div>
        <form class="public-form" @submit.prevent="submitApplication">
          <div class="form-two-columns">
            <label>Full name
              <input v-model="applicationForm.full_name" name="full_name" autocomplete="name" required minlength="2" maxlength="120" placeholder="Your full name" :disabled="applicationLoading" />
            </label>
            <label>Email address
              <input v-model="applicationForm.email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" :disabled="applicationLoading" />
            </label>
          </div>
          <label>Portfolio or social link <span class="optional-label">OPTIONAL</span>
            <input v-model="applicationForm.portfolio_url" name="portfolio_url" type="url" maxlength="2048" placeholder="https://..." :disabled="applicationLoading" />
          </label>
          <label>Model photos <span class="optional-label">REQUIRED · UP TO 5 PHOTOS</span>
            <input
              ref="modelPhotoInput"
              name="model_photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              :disabled="applicationLoading"
              @change="handleModelPhotoChange"
            />
            <small class="photo-upload-help">Upload clear headshots or full-body photos. JPG, PNG, or WebP · maximum 5 MB per photo.</small>
          </label>
          <div v-if="modelPhotoPreviews.length" class="model-photo-preview-grid" aria-label="Selected model photo previews">
            <div v-for="(photo, index) in modelPhotoPreviews" :key="photo.url" class="model-photo-preview">
              <img :src="photo.url" :alt="`Selected model photo ${index + 1}`" />
              <div class="model-photo-preview-footer">
                <span>PHOTO {{ String(index + 1).padStart(2, '0') }}</span>
                <button type="button" :disabled="applicationLoading" @click="removeModelPhoto(index)">REMOVE</button>
              </div>
            </div>
          </div>
          <label>Tell us about yourself
            <textarea v-model="applicationForm.message" name="message" required minlength="10" maxlength="5000" rows="5" placeholder="Your experience, interests, availability, or the kind of projects you would love to join…" :disabled="applicationLoading"></textarea>
          </label>
          <p v-if="applicationError" class="form-feedback form-error" role="alert">{{ applicationError }}</p>
          <p v-if="applicationSuccess" class="form-feedback form-success" role="status">{{ applicationSuccess }}</p>
          <button class="form-submit" type="submit" :disabled="applicationLoading">{{ applicationLoading ? 'SUBMITTING…' : 'SUBMIT MODEL APPLICATION' }}</button>
          <small class="privacy-note">Your details will be used to review this application and contact you about studio opportunities.</small>
        </form>
      </section>
    </section>
  </div>
</template>

<style scoped>
.studio-page { min-height: 60vh; background: var(--ivory); color: var(--mocha); }
.eyebrow { color: var(--rose-gold); font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.studio-hero { padding: 110px 8%; text-align: center; background: var(--cream); }
.studio-hero h1 { max-width: 850px; margin: 24px auto; font: 400 clamp(45px, 6.5vw, 78px)/1.08 'Cormorant Garamond', serif; }
.studio-hero h1 em, .gallery-heading h2 em, .studio-callout h2 em { color: var(--rose-gold); font-weight: 400; }
.studio-hero > p { max-width: 600px; margin: auto; color: var(--muted); font-size: 13px; line-height: 2; }
.hero-link { display: inline-flex; align-items: center; gap: 15px; margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid var(--rose-gold); color: var(--mocha); font-size: 9px; letter-spacing: 1.5px; }
.hero-link span { color: var(--rose-gold); font-size: 16px; }
.studio-gallery { padding: 75px 8%; }
.gallery-heading { display: flex; align-items: end; justify-content: space-between; gap: 28px; margin-bottom: 30px; }
.gallery-heading h2 { margin: 12px 0 0; font: 400 clamp(35px, 4vw, 48px)/1.1 'Cormorant Garamond', serif; }
.gallery-heading > p { max-width: 320px; color: var(--muted); font-size: 11px; line-height: 1.8; }
.theme-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
.theme-filters button { padding: 11px 15px; border: 1px solid var(--line); color: var(--mocha); background: transparent; cursor: pointer; font-size: 8px; letter-spacing: 1px; }
.theme-filters button:hover, .theme-filters button.active { border-color: var(--rose-gold); color: white; background: var(--rose-gold); }
.shoot-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; align-items: start; }
.shoot-card { min-width: 0; border: 1px solid var(--line); background: #fffdf9; }
.shoot-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 17px 20px; color: var(--rose-gold); font-size: 8px; letter-spacing: 1.3px; }
.shoot-index { font: 25px 'Cormorant Garamond', serif; }
.shoot-theme { text-align: right; }
.shoot-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; background: var(--cream); }
.shoot-images img { width: 100%; height: 210px; object-fit: cover; }
.shoot-images img:first-child:nth-last-child(odd) { grid-column: 1 / -1; height: 350px; }
.shoot-images img.shoot-image-featured { grid-column: 1 / -1; height: 350px; }
.shoot-placeholder { display: grid; place-items: center; gap: 10px; min-height: 330px; color: var(--rose-gold); background: var(--cream); }
.shoot-placeholder span { font: italic 88px 'Cormorant Garamond', serif; }
.shoot-placeholder small { font-size: 8px; letter-spacing: 2px; }
.shoot-copy { padding: 24px; }
.shoot-date { color: var(--muted); font-size: 8px; letter-spacing: 1.5px; }
.shoot-copy h3 { margin: 12px 0; font: 400 32px/1.1 'Cormorant Garamond', serif; overflow-wrap: anywhere; }
.shoot-copy > p { color: var(--muted); font-size: 11px; line-height: 1.9; white-space: pre-line; overflow-wrap: anywhere; }
.shoot-card-footer { display: flex; justify-content: space-between; gap: 15px; margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--line); color: var(--antique-gold); font-size: 8px; letter-spacing: 1.1px; }
.studio-state { padding: 28px; text-align: center; color: var(--muted); background: #fffdf9; border: 1px solid var(--line); font-size: 12px; line-height: 1.8; }
.studio-state-error { color: #8a3829; }
.outline-button { margin-top: 14px; padding: 10px 15px; border: 1px solid var(--rose-gold); color: var(--mocha); background: transparent; cursor: pointer; font-size: 9px; letter-spacing: 1px; }
.studio-callout { margin-top: 65px; padding: 50px 25px; text-align: center; background: var(--cream); }
.studio-callout h2 { margin: 15px 0; font: 400 40px 'Cormorant Garamond', serif; }
.studio-callout p { max-width: 590px; margin: auto; color: var(--muted); font-size: 12px; line-height: 1.9; }

.application-panel { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: clamp(28px, 6vw, 80px); margin-top: 55px; padding: clamp(25px, 5vw, 55px); border: 1px solid var(--line); background: #fffdf9; }
.application-intro h2 { margin: 16px 0; font: 400 clamp(34px, 4vw, 48px)/1.1 'Cormorant Garamond', serif; }
.application-intro h2 em { color: var(--rose-gold); font-weight: 400; }
.application-intro p { color: var(--muted); font-size: 12px; line-height: 1.9; }
.public-form { display: grid; gap: 17px; }
.public-form label { display: grid; gap: 8px; color: var(--mocha); font-size: 11px; font-weight: 600; }
.public-form input, .public-form textarea { width: 100%; min-width: 0; padding: 13px 14px; border: 1px solid var(--line); border-radius: 0; color: var(--mocha); background: #fff; font: inherit; font-size: 12px; outline-offset: 2px; }
.public-form input:focus, .public-form textarea:focus { outline: 1px solid var(--rose-gold); border-color: var(--rose-gold); }
.public-form textarea { resize: vertical; line-height: 1.7; }
.public-form input[type="file"] { padding: 12px; background: #fffaf5; cursor: pointer; }
.photo-upload-help { color: var(--muted); font-size: 10px; line-height: 1.7; font-weight: 400; }
.model-photo-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap: 10px; }
.model-photo-preview { min-width: 0; border: 1px solid var(--line); background: var(--cream); }
.model-photo-preview img { display: block; width: 100%; height: 145px; object-fit: cover; }
.model-photo-preview-footer { display: flex; align-items: center; justify-content: space-between; gap: 5px; padding: 8px; color: var(--muted); font-size: 8px; letter-spacing: .5px; }
.model-photo-preview-footer button { padding: 4px 5px; border: 1px solid var(--rose-gold); color: var(--mocha); background: transparent; cursor: pointer; font-size: 8px; }
.model-photo-preview-footer button:disabled { opacity: .6; cursor: wait; }
.form-two-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.optional-label { margin-left: 5px; color: var(--muted); font-size: 8px; letter-spacing: 1px; }
.form-submit { justify-self: start; padding: 14px 18px; border: 1px solid var(--mocha); color: #fffaf3; background: var(--mocha); font-size: 9px; letter-spacing: 1.2px; cursor: pointer; }
.form-submit:disabled { opacity: .6; cursor: wait; }
.form-feedback { margin: 0; padding: 12px 14px; font-size: 12px; line-height: 1.6; }
.form-error { border: 1px solid #e6b9ae; color: #8a3829; background: #fff4f0; }
.form-success { border: 1px solid #c8d8bd; color: #3e6036; background: #f2f8ed; }
.privacy-note { color: var(--muted); font-size: 10px; line-height: 1.7; }
@media (max-width: 750px) { .application-panel { grid-template-columns: 1fr; } .form-two-columns { grid-template-columns: 1fr; } .studio-hero { padding: 75px 7%; } .studio-gallery { padding: 50px 7%; } .gallery-heading { align-items: flex-start; flex-direction: column; gap: 8px; } .shoot-grid { grid-template-columns: 1fr; } .shoot-images img { height: 170px; } .shoot-images img:first-child:nth-last-child(odd), .shoot-images img.shoot-image-featured { height: 275px; } }
</style>
