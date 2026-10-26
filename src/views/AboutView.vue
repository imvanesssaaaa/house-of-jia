<script setup lang="ts">
import { RouterLink } from 'vue-router'

const companies = [
  {
    name: 'House of Jiæzélle',
    subtitle: 'Travel & Lifestyle',
    logo: '/logos/house-of-jiaezelle.png',
    description:
      'A world of travel essentials designed to accompany every destination and adventure.',
    route: '/shop',
  },
  {
    name: 'NAUX Hotel',
    subtitle: 'Hospitality & Experiences',
    logo: '/logos/naux-hotel.png',
    description:
      'A hospitality concept centered on thoughtful stays and memorable guest experiences.',
    route: '/naux-hotel',
  },
  {
    name: 'JN Couture',
    subtitle: 'Fashion & Design',
    logo: '/logos/jn-couture.png',
    description:
      'A fashion identity celebrating creativity, expressive silhouettes, and distinctive designs.',
    route: '/jn-couture',
  },
  {
    name: 'Nausicaa Creative Studios',
    subtitle: 'Photography & Creative Arts',
    logo: '/logos/nausicaa-creative-studios.png',
    description:
      'A creative studio for visual storytelling, fashion editorials, themed shoots, and talent.',
    route: '/nausicaa-creative-studios',
  },
]

const values = [
  {
    number: '01',
    title: 'Elegance',
    description:
      'We believe that thoughtful details transform ordinary experiences into memorable ones.',
  },
  {
    number: '02',
    title: 'Imagination',
    description:
      'We welcome original ideas, creative expression, and possibilities beyond the expected.',
  },
  {
    number: '03',
    title: 'Excellence',
    description:
      'We aspire to create meaningful experiences through attention, care, and quality.',
  },
  {
    number: '04',
    title: 'Unity',
    description:
      'Our companies have distinct identities, brought together by one shared vision.',
  },
]
</script>

<template>

  <div class="about-page">
    <section class="about-hero">
      <span class="eyebrow">THE STORY BEHIND THE HOUSE</span>

      <h1>
        One House.
        <br />
        <em>Infinite Possibilities.</em>
      </h1>

      <p>
        Discover the vision, people, and creative worlds
        that come together under House of Jiæzélle.
      </p>
    </section>

    <section class="story-section">
      <div class="story-label">
        <span class="eyebrow">OUR STORY</span>
        <img
            class="founder-photo"
            src="/public/hjbuilding.jpg"
            alt="House of Jiæzélle Building"
          />
      </div>

      <div class="story-content">
        <h2>
          A Vision Beyond
          <em>One Destination.</em>
        </h2>

        <p>
          House of Jiæzélle is envisioned as a parent brand bringing
          together travel and lifestyle, hospitality, fashion, and
          creative production.
        </p>

        <p>
          Each company has its own purpose and personality. Together,
          they form a collective inspired by elegance, imagination,
          and the pursuit of meaningful experiences.
        </p>

        <p>
          From the things we carry to the places we experience,
          the designs we wear, and the stories we create, the House
          celebrates the many ways people express themselves.
        </p>

        <div class="story-signature">
          <span>HOUSE OF JIÆZÉLLE</span>
          <em>A World of Possibilities</em>
        </div>
      </div>
    </section>

    <section class="founder-section">
      <div class="founder-image">
        <img
            class="founder-photo"
            src="/Team/jia.jpg"
            alt="Founder of House of Jiæzélle"
          />
      </div>

      <div class="founder-content">
        <span class="eyebrow">THE VISION BEHIND THE HOUSE</span>

        <h2>
          Meet the
          <em>Founder</em>
        </h2>

        <p>
          Every great house begins with a vision. House of Jiæzélle
          brings together a collection of creative and lifestyle
          concepts under one shared identity.
        </p>

        <!-- Replace these placeholders with verified information. -->
        <div class="founder-details">
          <span class="detail-label">FOUNDER</span>
          <h3>Jiæzélle Nausicaa</h3>

          <span class="detail-label">VISION</span>
          <p>
            To become a distinguished and globally recognized brand that unites travel, hospitality, fashion, and creative artistry under one prestigious identity, inspiring elegance, innovation, and excellence while creating meaningful experiences and setting new standards of quality, sophistication, and creativity in every industry we serve.
          </p>
        </div>
      </div>
    </section>

    <section class="companies-section">
      <div class="section-heading">
        <span class="eyebrow">OUR CORPORATE FAMILY</span>

        <h2>
          Four Worlds.
          <em>One House.</em>
        </h2>

        <p>
          Explore the companies that make up the House of Jiæzélle.
        </p>
      </div>

      <div class="companies-grid">
        <article
          v-for="company in companies"
          :key="company.name"
          class="company-card"
        >
          <div class="company-logo">
            <img :src="company.logo" :alt="company.name + ' logo'" />
          </div>

          <span class="company-subtitle">{{ company.subtitle }}</span>

          <h3>{{ company.name }}</h3>

          <p>{{ company.description }}</p>

          <RouterLink :to="company.route" class="company-link">
            EXPLORE COMPANY <span>↗</span>
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="values-section">
      <div class="section-heading">
        <span class="eyebrow">WHAT DEFINES US</span>
        <h2>Our Guiding <em>Principles</em></h2>
      </div>

      <div class="values-grid">
        <article v-for="value in values" :key="value.number">
          <span class="value-number">{{ value.number }}</span>
          <h3>{{ value.title }}</h3>
          <p>{{ value.description }}</p>
        </article>
      </div>
    </section>

    <section class="leadership-section">
      <span class="eyebrow">THE PEOPLE BEHIND THE VISION</span>

      <h2>
        Leadership & <em>Management</em>
      </h2>

      <p>
        Meet the people guiding each company, its operations,
        and its creative direction.
      </p>

      <div class="leadership-placeholder">
        <span class="leadership-icon">✧</span>

        <h3>Our Leadership Directory</h3>

          <img
            class="founder-photo"
            src="/home/directoryboard.jpg"
            alt="Founder of House of Jiæzélle"
          />
      
      </div>
    </section>

    <section class="about-cta">
      <h2>
        Discover Your
        <em>World Within the House.</em>
      </h2>

      <RouterLink to="/contact" class="gold-button">
        CONNECT WITH US <span>↗</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  color: var(--espresso);
  background: var(--ivory);
}

.eyebrow {
  color: var(--rose-gold);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
}

.about-hero {
  padding: 110px 8%;
  text-align: center;
  background: var(--cream);
}

.about-hero h1 {
  margin: 25px 0;
  font: 400 clamp(46px, 7vw, 82px)/1.08 'Cormorant Garamond', serif;
}

.about-hero h1 em,
.story-content h2 em,
.founder-content h2 em,
.section-heading h2 em,
.leadership-section h2 em,
.about-cta h2 em {
  color: var(--rose-gold);
  font-weight: 400;
}

.about-hero > p {
  max-width: 550px;
  margin: auto;
  color: var(--muted);
  font-size: 13px;
  line-height: 2;
}

.story-section {
  padding: 100px 10%;
  display: grid;
  grid-template-columns: 0.7fr 1.5fr;
  gap: 70px;
}

.gold-line {
  width: 45px;
  height: 1px;
  margin-top: 20px;
  background: var(--champagne-gold);
}

.story-content {
  max-width: 700px;
}

.story-content h2,
.founder-content h2,
.section-heading h2,
.leadership-section h2,
.about-cta h2 {
  margin: 0 0 25px;
  font: 400 clamp(36px, 5vw, 56px)/1.15 'Cormorant Garamond', serif;
}

.story-content > p,
.founder-content > p,
.leadership-section > p {
  color: var(--muted);
  font-size: 13px;
  line-height: 2;
}

.story-signature {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.story-signature span {
  font-size: 10px;
  letter-spacing: 2px;
}

.story-signature em {
  color: var(--rose-gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
}

.founder-section {
  padding: 90px 10%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
  background: #f0e6dc;
}

.founder-image {
  min-height: 400px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle, #e8d8c3 0%, transparent 55%),
    #dfcdbb;
}

.founder-monogram {
  color: var(--rose-gold);
  font: 400 180px/1 'Cormorant Garamond', serif;
}

.founder-details {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid var(--line);
}

.detail-label {
  display: block;
  margin-bottom: 10px;
  color: var(--rose-gold);
  font-size: 8px;
  letter-spacing: 2px;
}

.founder-details h3 {
  margin: 0 0 25px;
  font: 400 27px 'Cormorant Garamond', serif;
}

.companies-section,
.values-section,
.leadership-section {
  padding: 100px 8%;
}

.section-heading {
  max-width: 700px;
  margin: 0 auto 55px;
  text-align: center;
}

.section-heading h2 {
  margin-top: 18px;
}

.section-heading > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.9;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 25px;
}

.company-card {
  padding: 35px;
  border: 1px solid var(--line);
  background: #fffdf9;
}

.company-logo {
  height: 150px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.company-logo img {
  width: 100%;
  max-width: 220px;
  height: 100%;
  object-fit: contain;
  object-position: left center;
}

.company-subtitle {
  color: var(--rose-gold);
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.company-card h3 {
  margin: 15px 0;
  font: 500 29px 'Cormorant Garamond', serif;
}

.company-card > p,
.values-grid p,
.leadership-placeholder p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.9;
}

.company-link {
  display: inline-flex;
  gap: 15px;
  margin-top: 15px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--rose-gold);
  font-size: 9px;
  letter-spacing: 1px;
}

.values-section {
  background: var(--cream);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 30px;
}

.value-number {
  color: var(--rose-gold);
  font: 400 35px 'Cormorant Garamond', serif;
}

.values-grid h3 {
  font: 400 28px 'Cormorant Garamond', serif;
}

.leadership-section {
  text-align: center;
}

.leadership-section > p {
  max-width: 520px;
  margin: 0 auto 35px;
}

.leadership-placeholder {
  max-width: 650px;
  margin: auto;
  padding: 45px;
  border: 1px solid var(--line);
  background: #fffdf9;
}

.leadership-icon {
  color: var(--champagne-gold);
  font-size: 28px;
}

.leadership-placeholder h3 {
  font: 400 30px 'Cormorant Garamond', serif;
}

.editor-note {
  font-size: 10px !important;
  font-style: italic;
}

.about-cta {
  padding: 80px 8%;
  text-align: center;
  background: var(--cream);
}

.about-cta h2 {
  max-width: 700px;
  margin: 0 auto 30px;
}

.gold-button {
  display: inline-flex;
  gap: 20px;
  padding: 16px 25px;
  background: var(--espresso);
  color: var(--ivory);
  font-size: 9px;
  letter-spacing: 1.5px;
}

@media (max-width: 750px) {
  .story-section,
  .founder-section {
    grid-template-columns: 1fr;
    gap: 35px;
    padding: 65px 7%;
  }

  .companies-section,
  .values-section,
  .leadership-section {
    padding: 65px 7%;
  }

  .companies-grid {
    grid-template-columns: 1fr;
  }

  .values-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 25px;
  }

  .founder-image {
    min-height: 280px;
  }

  .founder-monogram {
    font-size: 130px;
  }

  .leadership-placeholder {
    padding: 30px 20px;
  }
}

@media (max-width: 400px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>