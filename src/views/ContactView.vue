<script setup lang="ts">
import { ref } from 'vue'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const form = ref({ full_name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submitMessage() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await fetch(`${API_URL}/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form.value),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Unable to send your message.')
    successMessage.value = data.message || 'Your message has been sent.'
    form.value = { full_name: '', email: '', subject: '', message: '' }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to send your message. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="contact-page">
    <section class="contact-hero">
      <span class="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span>
      <h1>Let's start <em>a conversation.</em></h1>
      <p>For questions, collaborations, guest inquiries, creative opportunities, or anything about the House, send us a note below.</p>
    </section>

    <section class="contact-content">
      <aside class="contact-aside">
        <span class="eyebrow">HOUSE OF JIÆZÉLLE</span>
        <h2>One House. <em>Many worlds.</em></h2>
        <p>Tell us which division your message is for and our team will make sure it reaches the right place.</p>
        <div class="contact-divisions">
          <div><span>01</span><strong>The House</strong><small>General questions &amp; collaborations</small></div>
          <div><span>02</span><strong>NAUX Hotel</strong><small>Hospitality &amp; stay inquiries</small></div>
          <div><span>03</span><strong>JN Couture</strong><small>Fashion &amp; design inquiries</small></div>
          <div><span>04</span><strong>Nausicaa Creative Studios</strong><small>Creative projects &amp; model searches</small></div>
        </div>
      </aside>

      <section class="contact-card">
        <span class="eyebrow">SEND A MESSAGE</span>
        <h2>Write to <em>the House.</em></h2>
        <form class="public-form" @submit.prevent="submitMessage">
          <label>Full name
            <input v-model="form.full_name" name="full_name" autocomplete="name" required minlength="2" maxlength="120" placeholder="Your full name" :disabled="loading" />
          </label>
          <label>Email address
            <input v-model="form.email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" :disabled="loading" />
          </label>
          <label>Subject
            <input v-model="form.subject" name="subject" required minlength="3" maxlength="200" placeholder="What would you like to discuss?" :disabled="loading" />
          </label>
          <label>Message
            <textarea v-model="form.message" name="message" required minlength="10" maxlength="5000" rows="7" placeholder="Write your message here…" :disabled="loading"></textarea>
          </label>
          <p v-if="errorMessage" class="form-feedback form-error" role="alert">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-feedback form-success" role="status">{{ successMessage }}</p>
          <button class="form-submit" type="submit" :disabled="loading">{{ loading ? 'SENDING…' : 'SEND YOUR MESSAGE' }}</button>
          <small class="privacy-note">Your message will be saved securely for the House administration to review. Please avoid including passwords or payment-card information.</small>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.contact-page { min-height: 60vh; color: var(--mocha); background: var(--ivory); }
.eyebrow { color: var(--rose-gold); font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.contact-hero { padding: 105px 8%; text-align: center; background: var(--cream); }
.contact-hero h1 { max-width: 900px; margin: 24px auto; font: 400 clamp(43px, 6.2vw, 74px)/1.08 'Cormorant Garamond', serif; }
.contact-hero h1 em, .contact-aside h2 em, .contact-card h2 em { color: var(--rose-gold); font-weight: 400; }
.contact-hero > p { max-width: 640px; margin: auto; color: var(--muted); font-size: 13px; line-height: 2; }
.contact-content { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(30px, 6vw, 85px); padding: 75px 8%; align-items: start; }
.contact-aside h2, .contact-card h2 { margin: 15px 0; font: 400 clamp(36px, 4vw, 50px)/1.1 'Cormorant Garamond', serif; }
.contact-aside > p { color: var(--muted); font-size: 12px; line-height: 1.9; }
.contact-divisions { margin-top: 35px; }
.contact-divisions > div { display: grid; grid-template-columns: 36px 1fr; gap: 6px 14px; padding: 18px 0; border-top: 1px solid var(--line); }
.contact-divisions span { grid-row: span 2; color: var(--rose-gold); font: 25px 'Cormorant Garamond', serif; }
.contact-divisions strong { font: 400 21px 'Cormorant Garamond', serif; }
.contact-divisions small { color: var(--muted); font-size: 10px; line-height: 1.7; }
.contact-card { padding: clamp(23px, 4vw, 42px); border: 1px solid var(--line); background: #fffdf9; }
.public-form { display: grid; gap: 17px; margin-top: 25px; }
.public-form label { display: grid; gap: 8px; color: var(--mocha); font-size: 11px; font-weight: 600; }
.public-form input, .public-form textarea { width: 100%; min-width: 0; padding: 13px 14px; border: 1px solid var(--line); border-radius: 0; color: var(--mocha); background: white; font: inherit; font-size: 12px; }
.public-form input:focus, .public-form textarea:focus { outline: 1px solid var(--rose-gold); border-color: var(--rose-gold); }
.public-form textarea { resize: vertical; line-height: 1.7; }
.form-submit { justify-self: start; padding: 14px 18px; border: 1px solid var(--mocha); color: #fffaf3; background: var(--mocha); font-size: 9px; letter-spacing: 1.2px; cursor: pointer; }
.form-submit:disabled { opacity: .6; cursor: wait; }
.form-feedback { margin: 0; padding: 12px 14px; font-size: 12px; line-height: 1.6; }
.form-error { border: 1px solid #e6b9ae; color: #8a3829; background: #fff4f0; }
.form-success { border: 1px solid #c8d8bd; color: #3e6036; background: #f2f8ed; }
.privacy-note { color: var(--muted); font-size: 10px; line-height: 1.7; }
@media (max-width: 800px) { .contact-hero { padding: 75px 7%; } .contact-content { grid-template-columns: 1fr; padding: 50px 7%; } }
</style>
