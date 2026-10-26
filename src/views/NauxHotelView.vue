<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type HotelRoom = {
  id: string | number
  name: string
  room_type: string
  description: string
  price_per_night: number | string
  max_guests: number
  amenities: string
  image_url: string | null
  image_urls?: string[] | null
}

const rooms = ref<HotelRoom[]>([])
const roomsLoading = ref(true)
const roomsError = ref('')

function roomImages(room: HotelRoom): string[] {
  const saved = Array.isArray(room.image_urls)
    ? room.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    : []
  if (saved.length) return saved
  return room.image_url ? [room.image_url] : []
}

async function loadRooms() {
  roomsLoading.value = true
  roomsError.value = ''
  try {
    const response = await fetch(`${API_URL}/hotel-rooms`, { headers: { Accept: 'application/json' } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to load NAUX Hotel rooms.')
    rooms.value = Array.isArray(data.rooms) ? data.rooms : []
  } catch (error) {
    roomsError.value = error instanceof Error ? error.message : 'Unable to load room listings.'
  } finally {
    roomsLoading.value = false
  }
}

function inquireAboutRoom(room: HotelRoom) {
  form.value.message = `I am interested in the ${room.name} (${room.room_type}). Please share availability and details.`
  document.getElementById('hotel-inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const today = ref(localDateString())
const form = ref({ full_name: '', email: '', check_in: '', check_out: '', guests: 1, message: '' })
const minCheckout = computed(() => form.value.check_in || today.value)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submitInquiry() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await fetch(`${API_URL}/hotel-inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form.value),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to submit your inquiry.')
    successMessage.value = data.message || 'Your inquiry has been received.'
    form.value = { full_name: '', email: '', check_in: '', check_out: '', guests: 1, message: '' }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to submit your inquiry. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(loadRooms)
</script>

<template>
  <main class="hotel-page">
    <section class="hotel-hero">
      <span class="eyebrow">NAUX HOTEL · HOSPITALITY &amp; DISCOVERY</span>
      <h1>Stay somewhere <em>extraordinary.</em></h1>
      <p>Thoughtful hospitality, considered details, and experiences designed to make every arrival feel special.</p>
      <a href="#hotel-inquiry" class="hero-link">MAKE AN INQUIRY <span>↓</span></a>
    </section>

    <section class="rooms-section" id="hotel-rooms">
      <div class="rooms-heading">
        <span class="eyebrow">A ROOM FOR EVERY STORY</span>
        <h2>Discover your <em>stay.</em></h2>
        <p>Explore the rooms currently offered by NAUX Hotel. Select a room to add it to your inquiry.</p>
      </div>
      <p v-if="roomsLoading" class="rooms-state">Preparing our room collection…</p>
      <div v-else-if="roomsError" class="rooms-state rooms-state-error">
        <p>{{ roomsError }}</p>
        <button class="room-outline-button" type="button" @click="loadRooms">TRY AGAIN</button>
      </div>
      <p v-else-if="!rooms.length" class="rooms-state">Our room collection is being prepared. Published rooms and photos will appear here soon.</p>
      <div v-else class="room-grid">
        <article v-for="room in rooms" :key="room.id" class="room-card">
          <div v-if="roomImages(room).length" class="room-photo-grid">
            <img v-for="(image, index) in roomImages(room)" :key="`${room.id}-${index}-${image}`" :src="image" :alt="`${room.name} — room photo ${index + 1}`" loading="lazy" />
          </div>
          <div v-else class="room-photo-placeholder"><span>NAUX</span><small>HOTEL COLLECTION</small></div>
          <div class="room-card-copy">
            <span class="room-type">{{ room.room_type }}</span>
            <h3>{{ room.name }}</h3>
            <p>{{ room.description }}</p>
            <p v-if="room.amenities" class="room-amenities">{{ room.amenities }}</p>
            <div class="room-card-footer">
              <div><strong>PHP {{ Number(room.price_per_night).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong><small>PER NIGHT · UP TO {{ room.max_guests }} GUEST{{ room.max_guests === 1 ? '' : 'S' }}</small></div>
              <button type="button" class="room-inquire-button" @click="inquireAboutRoom(room)">INQUIRE ABOUT THIS ROOM</button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="hotel-content">
      <div class="hotel-copy">
        <span class="eyebrow">BEGIN YOUR NEXT CHAPTER</span>
        <h2>Your stay, <em>your story.</em></h2>
        <p>Share your preferred dates and guest details below. This form sends an inquiry to the House of Jiæzélle administration; it does not confirm a reservation or charge a payment.</p>
        <div class="hotel-details">
          <div><span>01</span><strong>Send your dates</strong><small>Tell us when you would like to stay.</small></div>
          <div><span>02</span><strong>Our team reviews</strong><small>We will review your inquiry and contact you using the email provided.</small></div>
          <div><span>03</span><strong>Confirmation</strong><small>Your booking is only confirmed after the hotel team confirms it.</small></div>
        </div>
      </div>

      <section class="inquiry-card" id="hotel-inquiry">
        <span class="eyebrow">NAUX HOTEL RESERVATION INQUIRY</span>
        <h2>Request a <em>stay.</em></h2>
        <form class="public-form" @submit.prevent="submitInquiry">
          <label>Full name
            <input v-model="form.full_name" name="full_name" autocomplete="name" required minlength="2" maxlength="120" placeholder="Your full name" :disabled="loading" />
          </label>
          <label>Email address
            <input v-model="form.email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" :disabled="loading" />
          </label>
          <div class="form-two-columns">
            <label>Check-in
              <input v-model="form.check_in" name="check_in" type="date" :min="today" required :disabled="loading" />
            </label>
            <label>Check-out
              <input v-model="form.check_out" name="check_out" type="date" :min="minCheckout" required :disabled="loading" />
            </label>
          </div>
          <label>Number of guests
            <input v-model.number="form.guests" name="guests" type="number" min="1" max="30" step="1" required :disabled="loading" />
          </label>
          <label>Additional details <span class="optional-label">OPTIONAL</span>
            <textarea v-model="form.message" name="message" rows="4" maxlength="5000" placeholder="Room preferences, special requests, or questions…" :disabled="loading"></textarea>
          </label>
          <p v-if="errorMessage" class="form-feedback form-error" role="alert">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-feedback form-success" role="status">{{ successMessage }}</p>
          <button class="form-submit" type="submit" :disabled="loading">{{ loading ? 'SENDING INQUIRY…' : 'SEND RESERVATION INQUIRY' }}</button>
          <small class="privacy-note">Submitting this form sends an inquiry only. Your stay is not confirmed until the hotel team contacts you.</small>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.hotel-page { min-height: 60vh; color: var(--mocha); background: var(--ivory); }
.eyebrow { color: var(--rose-gold); font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.hotel-hero { padding: 105px 8%; text-align: center; background: var(--cream); }
.hotel-hero h1 { max-width: 900px; margin: 24px auto; font: 400 clamp(44px, 6.3vw, 76px)/1.08 'Cormorant Garamond', serif; }
.hotel-hero h1 em, .hotel-copy h2 em, .inquiry-card h2 em { color: var(--rose-gold); font-weight: 400; }
.hotel-hero > p { max-width: 630px; margin: auto; color: var(--muted); font-size: 13px; line-height: 2; }
.hero-link { display: inline-flex; gap: 14px; margin-top: 30px; padding-bottom: 8px; border-bottom: 1px solid var(--rose-gold); color: var(--mocha); font-size: 9px; letter-spacing: 1.4px; }
.hero-link span { color: var(--rose-gold); }
.rooms-section { padding: 70px 8% 20px; background: var(--ivory); }
.rooms-heading { max-width: 700px; margin: 0 auto 35px; text-align: center; }
.rooms-heading h2 { margin: 15px 0; font: 400 clamp(36px, 4vw, 50px)/1.1 'Cormorant Garamond', serif; }
.rooms-heading h2 em { color: var(--rose-gold); font-weight: 400; }
.rooms-heading p { color: var(--muted); font-size: 12px; line-height: 1.9; }
.rooms-state { padding: 25px; border: 1px solid var(--line); background: #fffdf9; color: var(--muted); text-align: center; font-size: 12px; line-height: 1.8; }
.rooms-state-error { color: #8a3829; }
.room-outline-button { margin-top: 12px; padding: 10px 14px; border: 1px solid var(--rose-gold); color: var(--mocha); background: transparent; cursor: pointer; font-size: 9px; letter-spacing: 1px; }
.room-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 26px; }
.room-card { min-width: 0; border: 1px solid var(--line); background: #fffdf9; }
.room-photo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; background: var(--cream); }
.room-photo-grid img { width: 100%; height: 220px; object-fit: cover; display: block; }
.room-photo-grid img:first-child:nth-last-child(odd) { grid-column: 1 / -1; height: 340px; }
.room-photo-placeholder { display: grid; place-content: center; justify-items: center; gap: 8px; height: 280px; color: var(--rose-gold); background: var(--cream); }
.room-photo-placeholder span { font: italic 60px 'Cormorant Garamond', serif; }
.room-photo-placeholder small { font-size: 8px; letter-spacing: 2px; }
.room-card-copy { padding: 25px; }
.room-type { color: var(--rose-gold); font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; }
.room-card-copy h3 { margin: 10px 0; font: 400 31px/1.15 'Cormorant Garamond', serif; }
.room-card-copy > p { color: var(--muted); font-size: 11px; line-height: 1.8; white-space: pre-line; }
.room-card-copy .room-amenities { padding-top: 10px; border-top: 1px solid var(--line); }
.room-card-footer { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px; margin-top: 22px; padding-top: 17px; border-top: 1px solid var(--line); }
.room-card-footer > div { display: grid; gap: 6px; }
.room-card-footer strong { font: 400 22px 'Cormorant Garamond', serif; }
.room-card-footer small { color: var(--muted); font-size: 8px; letter-spacing: 1px; }
.room-inquire-button { padding: 12px 14px; border: 1px solid var(--mocha); color: #fffaf3; background: var(--mocha); cursor: pointer; font-size: 8px; letter-spacing: .8px; }
@media (max-width: 750px) { .rooms-section { padding: 50px 7% 10px; } .room-grid { grid-template-columns: 1fr; } .room-photo-grid img { height: 180px; } .room-photo-grid img:first-child:nth-last-child(odd) { height: 280px; } }

.hotel-content { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(30px, 6vw, 85px); padding: 75px 8%; align-items: start; }
.hotel-copy h2, .inquiry-card h2 { margin: 15px 0; font: 400 clamp(36px, 4vw, 50px)/1.1 'Cormorant Garamond', serif; }
.hotel-copy > p { color: var(--muted); font-size: 12px; line-height: 1.9; }
.hotel-details { display: grid; gap: 0; margin-top: 34px; }
.hotel-details > div { display: grid; grid-template-columns: 36px 1fr; gap: 7px 14px; padding: 20px 0; border-top: 1px solid var(--line); }
.hotel-details span { grid-row: span 2; color: var(--rose-gold); font: 25px 'Cormorant Garamond', serif; }
.hotel-details strong { font: 400 21px 'Cormorant Garamond', serif; }
.hotel-details small { color: var(--muted); font-size: 10px; line-height: 1.7; }
.inquiry-card { padding: clamp(23px, 4vw, 42px); border: 1px solid var(--line); background: #fffdf9; }
.public-form { display: grid; gap: 17px; margin-top: 25px; }
.public-form label { display: grid; gap: 8px; color: var(--mocha); font-size: 11px; font-weight: 600; }
.public-form input, .public-form textarea { width: 100%; min-width: 0; padding: 13px 14px; border: 1px solid var(--line); border-radius: 0; color: var(--mocha); background: white; font: inherit; font-size: 12px; }
.public-form input:focus, .public-form textarea:focus { outline: 1px solid var(--rose-gold); border-color: var(--rose-gold); }
.public-form textarea { resize: vertical; line-height: 1.7; }
.form-two-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.optional-label { color: var(--muted); font-size: 8px; letter-spacing: 1px; }
.form-submit { justify-self: start; padding: 14px 18px; border: 1px solid var(--mocha); color: #fffaf3; background: var(--mocha); font-size: 9px; letter-spacing: 1.2px; cursor: pointer; }
.form-submit:disabled { opacity: .6; cursor: wait; }
.form-feedback { margin: 0; padding: 12px 14px; font-size: 12px; line-height: 1.6; }
.form-error { border: 1px solid #e6b9ae; color: #8a3829; background: #fff4f0; }
.form-success { border: 1px solid #c8d8bd; color: #3e6036; background: #f2f8ed; }
.privacy-note { color: var(--muted); font-size: 10px; line-height: 1.7; }
@media (max-width: 800px) { .hotel-hero { padding: 75px 7%; } .hotel-content { grid-template-columns: 1fr; padding: 50px 7%; } }
@media (max-width: 520px) { .form-two-columns { grid-template-columns: 1fr; } }
</style>
