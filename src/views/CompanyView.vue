<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

type CompanyKey = 'shop' | 'hotel' | 'couture' | 'studio'

const props = defineProps<{
  company: CompanyKey
}>()

const companies = {
  shop: {
    name: 'HOUSE OF JIÆZÉLLE',
    subtitle: 'TRAVEL & LIFESTYLE',
    logo: '/logos/house-of-jiaezelle.png',
    headline: 'Every Journey, Beautifully Carried.',
    description:
      'Explore the world of travel essentials, thoughtfully selected to accompany every destination and adventure.',
    heroImage:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1800&q=85',
    sections: [
      {
        title: 'Travel Bags',
        description:
          'Discover travel bags designed for everyday journeys and longer adventures.',
      },
      {
        title: 'Luggage & Organizers',
        description:
          'Explore luggage and travel organization essentials for a more considered journey.',
      },
      {
        title: 'Travel Comfort',
        description:
          'Find travel accessories designed to make your next trip more comfortable.',
      },
    ],
    note:
      'Product listings, prices, availability, and checkout can be added when the online shop is ready.',
    button: 'INQUIRE ABOUT PRODUCTS',
  },

  hotel: {
    name: 'NAUX HOTEL',
    subtitle: 'HOSPITALITY & EXPERIENCES',
    logo: '/logos/naux-hotel.png',
    headline: 'A Stay Beyond the Ordinary.',
    description:
      'Discover the NAUX Hotel hospitality concept and learn more about future stays and guest experiences.',
    heroImage:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=85',
    sections: [
      {
        title: 'Our Rooms',
        description:
          'Discover the accommodation concepts and room experiences planned for our guests.',
      },
      {
        title: 'Guest Experiences',
        description:
          'Explore the hospitality philosophy behind thoughtful and memorable stays.',
      },
      {
        title: 'Reservations',
        description:
          'Send a reservation inquiry to ask about dates, availability, and accommodation options.',
      },
    ],
    note:
      'Reservation requests are inquiries only. Confirmed room inventory, rates, and booking functionality must be connected before accepting reservations.',
    button: 'MAKE A RESERVATION INQUIRY',
  },

  couture: {
    name: 'JN COUTURE',
    subtitle: 'FASHION & DESIGN',
    logo: '/logos/jn-couture.png',
    headline: 'Where Artistry Becomes Attire.',
    description:
      'Discover a fashion identity shaped by imagination, distinctive design, and expressive personal style.',
    heroImage:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85',
    sections: [
      {
        title: 'Latest Designs',
        description:
          'Showcase new creations, design concepts, and signature fashion pieces.',
      },
      {
        title: 'Editorial Collections',
        description:
          'Explore collections presented through fashion photography and visual storytelling.',
      },
      {
        title: 'Custom Inquiries',
        description:
          'Contact the House to inquire about custom creations and fashion collaborations.',
      },
    ],
    note:
      'Add your official collection photographs, garment descriptions, and confirmed product availability.',
    button: 'INQUIRE ABOUT COUTURE',
  },

  studio: {
    name: 'NAUSICAA CREATIVE STUDIOS',
    subtitle: 'PHOTOGRAPHY & CREATIVE ARTS',
    logo: '/logos/nausicaa-creative-studios.png',
    headline: 'Stories Worth Remembering.',
    description:
      'Enter a creative world of photography, fashion editorials, themed productions, and emerging talent.',
    heroImage:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85',
    sections: [
      {
        title: 'Latest Shots',
        description:
          'Showcase completed photoshoots, fashion editorials, portraits, and creative projects.',
      },
      {
        title: 'Upcoming Themes',
        description:
          'Introduce future photoshoot concepts, visual directions, and planned creative productions.',
      },
      {
        title: 'Model Search',
        description:
          'Publish official casting calls with eligibility requirements, application instructions, and deadlines.',
      },
    ],
    note:
      'Casting calls and shoot dates should be published only after the details are confirmed.',
    button: 'INQUIRE ABOUT COLLABORATIONS',
  },
}

const data = computed(() => companies[props.company])

const inquiry = ref({
  name: '',
  email: '',
  message: '',
})

function sendInquiry() {
  const subject = encodeURIComponent(
    `${data.value.name} — Inquiry`,
  )

  const body = encodeURIComponent(
    `Name: ${inquiry.value.name}\n` +
      `Email: ${inquiry.value.email}\n\n` +
      `Inquiry:\n${inquiry.value.message}`,
  )

  // Replace with your confirmed official business email.
  const recipient = 'YOUR-OFFICIAL-EMAIL@example.com'

  if (recipient === 'YOUR-OFFICIAL-EMAIL@example.com') {
    window.alert(
      'Please add the official business email in CompanyView.vue before using this form.',
    )
    return
  }

  window.location.href =
    `mailto:${recipient}?subject=${subject}&body=${body}`
}
</script>

<template>
  <div class="company-page">
    <section class="company-hero">
      <div
        class="company-hero-image"
        :style="{ backgroundImage: `url('${data.heroImage}')` }"
      ></div>

      <div class="company-hero-overlay"></div>

      <div class="company-hero-content">
        <img :src="data.logo" :alt="data.name + ' logo'" />

        <span class="eyebrow">{{ data.subtitle }}</span>

        <h1>{{ data.headline }}</h1>

        <p>{{ data.description }}</p>

        <a href="#company-details" class="hero-button">
          DISCOVER MORE <span>↓</span>
        </a>
      </div>
    </section>

    <section id="company-details" class="company-introduction">
      <span class="eyebrow">A WORLD WITHIN THE HOUSE</span>

      <h2>
        Discover
        <em>{{ data.name }}</em>
      </h2>

      <p>{{ data.description }}</p>
    </section>

    <section class="company-offerings">
      <article
        v-for="(section, index) in data.sections"
        :key="section.title"
        class="offering-card"
      >
        <span class="offering-number">
          0{{ index + 1 }}
        </span>

        <div class="offering-ornament">✧</div>

        <h3>{{ section.title }}</h3>

        <p>{{ section.description }}</p>
      </article>
    </section>

    <section class="company-note">
      <span class="eyebrow">A NOTE FROM THE HOUSE</span>

      <p>{{ data.note }}</p>
    </section>

    <section class="company-inquiry">
      <div class="inquiry-heading">
        <span class="eyebrow">CONNECT WITH US</span>

        <h2>
          Let Us Start
          <em>a Conversation.</em>
        </h2>

        <p>
          Have a question about {{ data.name }}?
          Send an inquiry to the House.
        </p>
      </div>

      <form class="inquiry-form" @submit.prevent="sendInquiry">
        <label for="inquiry-name">Your Name</label>
        <input
          id="inquiry-name"
          v-model.trim="inquiry.name"
          required
          autocomplete="name"
          placeholder="Full name"
        />

        <label for="inquiry-email">Email Address</label>
        <input
          id="inquiry-email"
          v-model.trim="inquiry.email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
        />

        <label for="inquiry-message">Your Message</label>
        <textarea
          id="inquiry-message"
          v-model.trim="inquiry.message"
          rows="4"
          required
          placeholder="Tell us what you would like to know..."
        ></textarea>

        <button type="submit">
          {{ data.button }} <span>↗</span>
        </button>
      </form>
    </section>

    <section class="company-back">
      <RouterLink to="/">← RETURN TO THE HOUSE</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.company-page {
  background: var(--ivory);
  color: var(--espresso);
}

.eyebrow {
  color: var(--rose-gold);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
}

.company-hero {
  position: relative;
  min-height: 650px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: white;
  background: var(--mocha);
}

.company-hero-image,
.company-hero-overlay {
  position: absolute;
  inset: 0;
}

.company-hero-image {
  background-position: center;
  background-size: cover;
}

.company-hero-overlay {
  background: rgba(36, 28, 25, 0.6);
}

.company-hero-content {
  position: relative;
  z-index: 1;
  max-width: 850px;
  padding: 80px 7%;
  text-align: center;
}

.company-hero-content > img {
  width: 150px;
  height: 150px;
  margin: 0 auto 25px;
  display: block;
  object-fit: contain;
}

.company-hero-content .eyebrow {
  color: #e8c7ad;
}

.company-hero-content h1 {
  margin: 25px 0;
  font: 400 clamp(42px, 6vw, 72px)/1.1 'Cormorant Garamond', serif;
}

.company-hero-content > p {
  max-width: 600px;
  margin: auto;
  color: #f0e5d9;
  font-size: 12px;
  line-height: 2;
}

.hero-button {
  margin-top: 30px;
  padding: 15px 22px;
  display: inline-flex;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  font-size: 9px;
  letter-spacing: 1.5px;
}

.hero-button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.company-introduction {
  max-width: 850px;
  margin: auto;
  padding: 90px 7%;
  text-align: center;
}

.company-introduction h2 {
  margin: 22px 0;
  font: 400 clamp(38px, 5vw, 60px)/1.15 'Cormorant Garamond', serif;
}

.company-introduction h2 em,
.inquiry-heading h2 em {
  color: var(--rose-gold);
  font-weight: 400;
}

.company-introduction > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 2;
}

.company-offerings {
  padding: 30px 8% 90px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.offering-card {
  min-height: 270px;
  padding: 30px;
  border: 1px solid var(--line);
  background: #fffdf9;
}

.offering-number {
  color: var(--rose-gold);
  font: 400 30px 'Cormorant Garamond', serif;
}

.offering-ornament {
  margin-top: 30px;
  color: var(--champagne-gold);
  font-size: 20px;
}

.offering-card h3 {
  font: 400 29px/1.2 'Cormorant Garamond', serif;
}

.offering-card p,
.company-note > p,
.inquiry-heading > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 2;
}

.company-note {
  padding: 60px 8%;
  text-align: center;
  background: var(--cream);
}

.company-note > p {
  max-width: 750px;
  margin: 20px auto 0;
}

.company-inquiry {
  padding: 90px 8%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: start;
}

.inquiry-heading h2 {
  margin: 25px 0;
  font: 400 clamp(38px, 5vw, 55px)/1.15 'Cormorant Garamond', serif;
}

.inquiry-form {
  padding: 35px;
  background: #fffdf9;
  border: 1px solid var(--line);
}

.inquiry-form label {
  display: block;
  margin: 20px 0 8px;
  font-size: 10px;
}

.inquiry-form input,
.inquiry-form textarea {
  width: 100%;
  padding: 13px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--ivory);
  font: inherit;
  font-size: 12px;
}

.inquiry-form button {
  width: 100%;
  margin-top: 25px;
  padding: 17px;
  display: flex;
  justify-content: space-between;
  border: 0;
  background: var(--espresso);
  color: white;
  font-size: 9px;
  letter-spacing: 1px;
  cursor: pointer;
}

.company-back {
  padding: 30px 8%;
  border-top: 1px solid var(--line);
  text-align: center;
}

.company-back a {
  color: var(--mocha);
  font-size: 9px;
  letter-spacing: 1.5px;
}

@media (max-width: 750px) {
  .company-hero {
    min-height: 560px;
  }

  .company-hero-content > img {
    width: 120px;
    height: 120px;
  }

  .company-offerings {
    grid-template-columns: 1fr;
    padding: 20px 7% 60px;
  }

  .company-inquiry {
    grid-template-columns: 1fr;
    gap: 35px;
    padding: 65px 7%;
  }

  .inquiry-form {
    padding: 25px;
  }
}
</style>