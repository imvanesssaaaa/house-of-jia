<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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
  updated_at?: string
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const activeCategory = ref('ALL')
const announcements = ref<Announcement[]>([])
const loading = ref(true)
const loadError = ref('')

const defaultCategories = ['THE HOUSE', 'NAUX HOTEL', 'JN COUTURE', 'NAUSICAA STUDIOS']
const categories = computed(() => {
  const discovered = announcements.value
    .map((item) => item.category?.trim())
    .filter((category): category is string => Boolean(category))
  return ['ALL', ...new Set([...defaultCategories, ...discovered])]
})

const filteredAnnouncements = computed(() => {
  if (activeCategory.value === 'ALL') return announcements.value
  return announcements.value.filter(
    (item) => item.category?.toUpperCase() === activeCategory.value.toUpperCase(),
  )
})

function imagesFor(item: Announcement): string[] {
  if (Array.isArray(item.image_urls)) {
    return item.image_urls.filter((url) => typeof url === 'string' && url.trim())
  }
  return []
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'HOUSE NEWS'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'HOUSE NEWS'
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toUpperCase()
}

async function loadAnnouncements() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await fetch(`${API_URL}/announcements`, {
      headers: { Accept: 'application/json' },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to load announcements.')
    announcements.value = Array.isArray(data.announcements) ? data.announcements : []
  } catch (error) {
    loadError.value = error instanceof Error
      ? error.message
      : 'Unable to load announcements. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAnnouncements)
</script>

<template>
  <div class="announcements-page">
    <section class="announcement-hero">
      <span class="eyebrow">THE LATEST FROM OUR WORLD</span>
      <h1>The House <em>Journal</em></h1>
      <p>
        Announcements, company updates, creative projects, and opportunities
        from across the House.
      </p>
    </section>

    <section class="announcement-content">
      <div class="filter-bar" aria-label="Filter announcements by category">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <p v-if="loading" class="state-message">Gathering the latest from the House…</p>
      <p v-else-if="loadError" class="state-message state-error">
        {{ loadError }}
        <button class="retry-button" type="button" @click="loadAnnouncements">TRY AGAIN</button>
      </p>
      <p v-else-if="!filteredAnnouncements.length" class="state-message">
        There are no published announcements in this category yet. Please check back soon.
      </p>

      <div v-else class="announcement-grid">
        <article
          v-for="item in filteredAnnouncements"
          :key="item.id"
          class="announcement-card"
        >
          <div class="announcement-card-top">
            <span>{{ item.category || 'THE HOUSE' }}</span>
            <span class="ornament">✧</span>
          </div>

          <div v-if="imagesFor(item).length" class="announcement-images">
            <img
              v-for="(image, index) in imagesFor(item)"
              :key="`${item.id}-${image}-${index}`"
              :src="image"
              :alt="`${item.title} photo ${index + 1}`"
              loading="lazy"
            />
          </div>

          <span class="announcement-date">
            {{ formatDate(item.published_at || item.created_at) }}
          </span>
          <h2>{{ item.title }}</h2>
          <p v-if="item.summary" class="announcement-summary">{{ item.summary }}</p>
          <p v-if="item.content" class="announcement-copy">{{ item.content }}</p>

          <div class="announcement-card-bottom">
            <span>{{ item.category || 'HOUSE JOURNAL' }}</span>
            <span>OFFICIAL UPDATE</span>
          </div>
        </article>
      </div>

      <div class="announcement-note">
        <span>✧</span>
        <h2>Stay Close to the House</h2>
        <p>
          New announcements, confirmed launch dates, upcoming shoots, and official
          opportunities will appear here when published by our team.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.announcements-page { background: var(--ivory); min-height: 60vh; }
.eyebrow { color: var(--rose-gold); font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.announcement-hero { padding: 110px 8%; text-align: center; background: var(--cream); }
.announcement-hero h1 { margin: 25px 0; font: 400 clamp(48px, 7vw, 80px)/1.1 'Cormorant Garamond', serif; }
.announcement-hero h1 em { color: var(--rose-gold); font-weight: 400; }
.announcement-hero > p { max-width: 600px; margin: auto; color: var(--muted); font-size: 13px; line-height: 2; }
.announcement-content { padding: 75px 8%; }
.filter-bar { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-bottom: 45px; }
.filter-bar button { padding: 12px 16px; border: 1px solid var(--line); background: transparent; color: var(--mocha); cursor: pointer; font-size: 8px; letter-spacing: 1px; transition: .25s ease; }
.filter-bar button:hover, .filter-bar button.active { border-color: var(--rose-gold); background: var(--rose-gold); color: white; }
.announcement-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 25px; }
.announcement-card { min-width: 0; min-height: 300px; padding: 30px; display: flex; flex-direction: column; background: #fffdf9; border: 1px solid var(--line); }
.announcement-card-top, .announcement-card-bottom { display: flex; justify-content: space-between; gap: 15px; }
.announcement-card-top { color: var(--rose-gold); font-size: 8px; letter-spacing: 1.4px; }
.ornament { font-size: 18px; }
.announcement-date { display: block; margin-top: 28px; color: var(--muted); font-size: 8px; letter-spacing: 1.5px; }
.announcement-card h2 { margin: 15px 0; font: 400 32px/1.15 'Cormorant Garamond', serif; overflow-wrap: anywhere; }
.announcement-summary, .announcement-copy { margin: 0 0 14px; color: var(--muted); font-size: 12px; line-height: 1.9; white-space: pre-line; overflow-wrap: anywhere; }
.announcement-summary { color: var(--mocha); }
.announcement-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 24px; }
.announcement-images img { width: 100%; height: 180px; object-fit: cover; background: var(--cream); }
.announcement-images img:first-child:nth-last-child(odd) { grid-column: 1 / -1; height: 250px; }
.announcement-card-bottom { margin-top: auto; padding-top: 18px; border-top: 1px solid var(--line); color: var(--antique-gold); font-size: 8px; letter-spacing: 1.2px; }
.announcement-note { margin-top: 60px; padding: 50px 25px; text-align: center; background: var(--cream); }
.announcement-note > span { color: var(--rose-gold); font-size: 24px; }
.announcement-note h2 { font: 400 36px 'Cormorant Garamond', serif; }
.announcement-note p { max-width: 550px; margin: auto; color: var(--muted); font-size: 12px; line-height: 1.9; }
.state-message { padding: 28px; text-align: center; color: var(--muted); background: #fffdf9; border: 1px solid var(--line); font-size: 12px; line-height: 1.8; }
.state-error { color: #8a3829; }
.retry-button { display: block; margin: 15px auto 0; padding: 10px 15px; border: 1px solid var(--rose-gold); color: var(--mocha); background: transparent; cursor: pointer; font-size: 9px; letter-spacing: 1px; }
@media (max-width: 650px) { .announcement-hero { padding: 75px 7%; } .announcement-content { padding: 50px 7%; } .announcement-grid { grid-template-columns: 1fr; } .filter-bar { justify-content: flex-start; } .announcement-card { padding: 22px; } .announcement-images img { height: 140px; } }
</style>
