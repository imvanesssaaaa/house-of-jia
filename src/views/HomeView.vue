<script setup lang="ts">
import { RouterLink } from 'vue-router'

const companies = [
  {
    number: '01',
    name: 'HOUSE OF JIÆZÉLLE',
    category: 'TRAVEL & LIFESTYLE',
    title: 'Every Journey, Beautifully Carried.',
    description:
      'Discover thoughtfully selected travel essentials designed to accompany you through every destination and adventure.',
    logo: '/logos/house-of-jiaezelle.png',
    image:
      '/home/hjsh.jpg',
    alt: 'Travel bags and lifestyle accessories',
    route: '/shop',
    button: 'EXPLORE THE COLLECTION',
  },
  {
    number: '02',
    name: 'NAUX HOTEL',
    category: 'HOSPITALITY & EXPERIENCES',
    title: 'A Stay Beyond the Ordinary.',
    description:
      'Discover a world of thoughtful hospitality, beautifully considered spaces, and memorable experiences.',
    logo: '/logos/naux-hotel.png',
    image:
      '/home/nauxh.jpg',
    alt: 'Elegant hotel suite',
    route: '/naux-hotel',
    button: 'DISCOVER NAUX',
  },
  {
    number: '03',
    name: 'JN COUTURE',
    category: 'FASHION & DESIGN',
    title: 'Where Artistry Becomes Attire.',
    description:
      'Explore expressive silhouettes, distinctive creations, and a vision of fashion shaped by imagination.',
    logo: '/logos/jn-couture.png',
    image:
      '/home/jnch.jpg',
    alt: 'High-fashion editorial look',
    route: '/jn-couture',
    button: 'VIEW THE COLLECTION',
  },
  {
    number: '04',
    name: 'NAUSICAA CREATIVE STUDIOS',
    category: 'PHOTOGRAPHY & CREATIVE ARTS',
    title: 'Stories Worth Remembering.',
    description:
      'Enter a creative world of visual storytelling, fashion editorials, themed productions, and emerging talent.',
    logo: '/logos/nausicaa-creative-studios.png',
    image:
      '/home/ncsh.jpg',
    alt: 'Fashion photography editorial',
    route: '/nausicaa-creative-studios',
    button: 'ENTER THE STUDIO',
  },
]

const announcements = [
  {
    category: 'THE HOUSE',
    title: 'A World of Possibilities',
    description:
      'Discover the four distinctive worlds united under House of Jiæzélle.',
    route: '/about',
  },
  {
    category: 'JN COUTURE',
    title: 'The Art of Fashion',
    description:
      'Explore the creative vision behind the House and its fashion identity.',
    route: '/announcements',
  },
  {
    category: 'NAUSICAA STUDIOS',
    title: 'Creativity Takes the Spotlight',
    description:
      'Discover creative projects, themed shoots, and future opportunities.',
    route: '/announcements',
  },
]
</script>

<template>
  <div class="home-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-image"></div>
      <div class="hero-overlay"></div>

      <div class="hero-content">
        

        <span class="eyebrow">
          A DISTINGUISHED HOUSE OF MANY WORLDS
        </span>

        <p class="hero-pretitle">WELCOME TO</p>

        <h1>
          HOUSE OF
          <span>JIÆZÉLLE</span>
        </h1>

        <div class="hero-divider">
          <span></span>
          <b>✧</b>
          <span></span>
        </div>

        <p class="hero-description">
          Four worlds. One House.
          <br />
          An expression of elegance, imagination, and possibility.
        </p>

        <RouterLink to="/about" class="button button-light">
          DISCOVER THE HOUSE
          <span>↗</span>
        </RouterLink>
      </div>

      <div class="hero-bottom">
        <span>TRAVEL · HOSPITALITY · COUTURE · CREATIVITY</span>
        <span>01 — 04</span>
      </div>

      <div class="hero-side-label">
        THE ART OF LIVING BEAUTIFULLY
      </div>
    </section>

    <!-- INTRODUCTION -->
    <section class="introduction section-padding">
      <div class="intro-label">
        <span></span>
        THE PHILOSOPHY
      </div>

      <div class="intro-main">
        <p class="intro-kicker">
          MORE THAN A NAME. A WORLD OF ITS OWN.
        </p>

        <h2>
          An Empire of Elegance.
          <br />
          <em>A World of Possibilities.</em>
        </h2>

        <p class="intro-description">
          House of Jiæzélle brings together distinct expressions of
          travel, hospitality, couture, and creative artistry. Each
          company carries its own identity, united by a shared
          appreciation for thoughtful experiences and extraordinary ideas.
        </p>

        <RouterLink to="/about" class="text-link">
          THE STORY OF OUR HOUSE <span>⟶</span>
        </RouterLink>
      </div>

      <div class="intro-watermark">J.</div>
    </section>

    <!-- THE FOUR COMPANIES -->
    <section class="companies-section section-padding">
      <div class="section-heading">
        <div>
          <span class="eyebrow">FOUR DISTINCTIVE WORLDS</span>
          <h2>The House <em>Collection</em></h2>
        </div>

        <p>
          Different passions.
          <br />
          One shared vision.
        </p>
      </div>

      <div class="company-list">
        <article
          v-for="(company, index) in companies"
          :key="company.number"
          class="company-card"
          :class="{ reversed: index % 2 !== 0 }"
        >
          <RouterLink
            :to="company.route"
            class="company-image-link"
            :aria-label="`Discover ${company.name}`"
          >
            <div class="company-image-wrap">
              <img
                :src="company.image"
                :alt="company.alt"
                class="company-image"
                loading="lazy"
              />

              <span class="image-number">
                {{ company.number }}
              </span>

              <span class="image-arrow">↗</span>
            </div>
          </RouterLink>

          <div class="company-information">
            <div class="company-logo">
              <img
                :src="company.logo"
                :alt="`${company.name} official logo`"
                loading="lazy"
              />
            </div>

            <span class="eyebrow company-category">
              {{ company.category }}
            </span>

            <h3>{{ company.name }}</h3>

            <div class="company-divider"></div>

            <h4>{{ company.title }}</h4>

            <p>{{ company.description }}</p>

            <RouterLink :to="company.route" class="text-link">
              {{ company.button }}
              <span>⟶</span>
            </RouterLink>
          </div>
        </article>
      </div>
    </section>

    <!-- BRAND STATEMENT -->
    <section class="brand-statement">
      <div class="statement-background"></div>
      <div class="statement-overlay"></div>

      <div class="statement-content">
        <img
          src="/logos/house-of-jiaezelle.png"
          alt=""
          class="statement-logo"
        />

        <span class="eyebrow">THE HOUSE PHILOSOPHY</span>

        <div class="statement-ornament">✧</div>

        <h2>
          For Every Destination,
          <br />
          <em>For Every Adventure.</em>
        </h2>

        <p>
          From the journeys we take to the stories we create,
          every experience is an opportunity to make something extraordinary.
        </p>

        <RouterLink to="/about" class="button button-light">
          OUR STORY <span>↗</span>
        </RouterLink>
      </div>
    </section>

    <!-- ANNOUNCEMENTS -->
    <section class="journal-section section-padding">
      <div class="section-heading journal-heading">
        <div>
          <span class="eyebrow">NOTES FROM THE HOUSE</span>
          <h2>The House <em>Journal</em></h2>
        </div>

        <RouterLink to="/announcements" class="text-link">
          ALL ANNOUNCEMENTS <span>⟶</span>
        </RouterLink>
      </div>

      <div class="journal-grid">
        <article
          v-for="item in announcements"
          :key="item.title"
          class="journal-card"
        >
          <div class="journal-topline">
            <span>{{ item.category }}</span>
            <span class="journal-star">✧</span>
          </div>

          <span class="journal-date">FROM THE HOUSE JOURNAL</span>

          <h3>{{ item.title }}</h3>

          <p>{{ item.description }}</p>

          <RouterLink :to="item.route" class="journal-link">
            DISCOVER MORE <span>↗</span>
          </RouterLink>
        </article>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="contact-cta">
      <span class="eyebrow">LET US BEGIN A CONVERSATION</span>

      <h2>
        Every Great Story
        <br />
        <em>Begins Somewhere.</em>
      </h2>

      <p>
        For partnerships, collaborations, and inquiries,
        we invite you to connect with the House.
      </p>

      <RouterLink to="/contact" class="button button-dark">
        CONTACT THE HOUSE <span>↗</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  overflow: hidden;
  background: var(--ivory);
  color: var(--espresso);
}

.section-padding {
  padding: 110px 9%;
}

.eyebrow {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2.5px;
  line-height: 1.8;
}

/* HERO */

.hero {
  position: relative;
  width: 100%;
  min-height: 780px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image,
.hero-overlay {
  position: absolute;
  inset: 0;
}

.hero-image {
  background-image: url('/home/teamph.jpg');
  background-size: cover;
  background-position: center 45%;
  animation: hero-reveal 1.3s ease both;
}

.hero-overlay {
  background:
    linear-gradient(
      90deg,
      rgba(223, 91, 126, 0.68),
      rgba(255, 175, 118, 0.22)
    ),
    linear-gradient(
      0deg,
      rgba(32, 25, 22, 0.55),
      transparent 55%
    );
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1150px;
  padding: 65px 30px;
  text-align: center;
  animation: content-reveal 1s 0.2s both;
}

.hero-logo {
  display: block;
  width: 85px;
  height: 85px;
  object-fit: contain;
  object-position: center;
  margin: 0 auto 20px;
}

.hero-content > .eyebrow {
  color: var(--champagne);
}

.hero-pretitle {
  margin: 28px 0 12px;
  font-size: 10px;
  letter-spacing: 5px;
}

.hero h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(55px, 9vw, 115px);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -1px;
}

.hero h1 span {
  display: block;
  margin-top: 10px;
  color: #e7c9b0;
  letter-spacing: 2px;
}

.hero-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 30px auto;
}

.hero-divider > span {
  width: 55px;
  height: 1px;
  background: var(--champagne-gold);
}

.hero-divider b {
  color: #e8c7ad;
  font-size: 15px;
  font-weight: 400;
}

.hero-description {
  margin: 0 auto 30px;
  color: #f0e4d7;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(19px, 2.3vw, 26px);
  line-height: 1.6;
}

.button {
  min-height: 48px;
  padding: 15px 23px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 25px;

  border: 1px solid transparent;

  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.6px;

  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.button span {
  font-size: 14px;
}

.button-light {
  border-color: rgba(250, 247, 242, 0.8);
  color: var(--ivory);
  background: transparent;
}

.button-light:hover {
  border-color: var(--champagne);
  color: var(--espresso);
  background: var(--champagne);
}

.button-dark {
  color: var(--ivory);
  background: var(--espresso);
}

.button-dark:hover {
  color: var(--espresso);
  background: var(--champagne-gold);
}

.hero-bottom {
  position: absolute;
  z-index: 2;
  right: 5%;
  bottom: 25px;
  left: 5%;

  display: flex;
  justify-content: space-between;
  gap: 20px;

  color: #e9d8c7;
  font-size: 8px;
  letter-spacing: 1.5px;
}

.hero-side-label {
  position: absolute;
  z-index: 2;
  top: 50%;
  right: 20px;

  writing-mode: vertical-rl;
  transform: translateY(-50%);

  color: #e9d8c7;
  font-size: 8px;
  letter-spacing: 2.5px;
}

/* INTRODUCTION */

.introduction {
  position: relative;
  display: grid;
  grid-template-columns: 0.8fr 2fr;
  gap: 50px;
  overflow: hidden;
}

.intro-label {
  padding-top: 12px;

  display: flex;
  align-items: flex-start;
  gap: 12px;

  color: var(--rose-gold);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
}

.intro-label span {
  width: 25px;
  height: 1px;
  margin-top: 6px;
  background: var(--champagne-gold);
}

.intro-main {
  position: relative;
  z-index: 1;
  max-width: 750px;
}

.intro-kicker {
  margin: 0 0 22px;
  color: var(--rose-gold);
  font-size: 9px;
  letter-spacing: 2px;
}

.intro-main h2,
.section-heading h2,
.statement-content h2,
.contact-cta h2 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(40px, 5.3vw, 66px);
  font-weight: 400;
  line-height: 1.08;
}

.intro-main h2 em,
.section-heading h2 em,
.statement-content h2 em,
.contact-cta h2 em {
  color: var(--rose-gold);
  font-weight: 400;
}

.intro-description {
  max-width: 600px;
  margin: 28px 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 2;
}

.text-link {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 15px;

  padding-bottom: 8px;

  border-bottom: 1px solid var(--rose-gold);

  color: var(--mocha);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.2px;
}

.text-link span {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.text-link:hover span {
  transform: translateX(5px);
}

.intro-watermark {
  position: absolute;
  right: 4%;
  bottom: -100px;
  color: rgba(183, 110, 121, 0.06);
  font-family: 'Cormorant Garamond', serif;
  font-size: 350px;
  line-height: 1;
  pointer-events: none;
}

/* COMPANIES */

.companies-section {
  padding-top: 85px;
  background: var(--cream);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  margin-bottom: 70px;
}

.section-heading .eyebrow {
  margin-bottom: 18px;
  color: var(--rose-gold);
}

.section-heading h2 {
  font-size: clamp(42px, 5vw, 65px);
}

.section-heading > p {
  margin: 0 0 5px;
  color: var(--muted);
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  line-height: 1.5;
  text-align: right;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 100px;
}

.company-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: clamp(35px, 7vw, 95px);

  scroll-margin-top: 125px;
}

.company-card.reversed {
  grid-template-columns: 0.9fr 1.1fr;
}

.company-card.reversed .company-image-link {
  order: 2;
}

.company-card.reversed .company-information {
  order: 1;
}

.company-image-link {
  display: block;
  min-width: 0;
}

.company-image-wrap {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #e2d2c1;
}

.company-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;

  transition: transform 0.8s cubic-bezier(0.2, 0.65, 0.3, 1);
}

.company-image-link:hover .company-image {
  transform: scale(1.045);
}

.image-number {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Cormorant Garamond', serif;
  font-size: 23px;
}

.image-arrow {
  position: absolute;
  right: 18px;
  bottom: 18px;

  width: 43px;
  height: 43px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;

  color: white;
  font-size: 18px;

  transition:
    color 0.3s ease,
    background 0.3s ease;
}

.company-image-link:hover .image-arrow {
  color: var(--espresso);
  background: var(--champagne);
}

.company-information {
  min-width: 0;
  padding: 20px 0;
}

/* OFFICIAL COMPANY LOGOS */

.company-logo {
  width: 100%;
  max-width: 240px;
  height: 170px;

  margin-bottom: 22px;

  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.company-logo img {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: contain;
  object-position: left center;

  transition: transform 0.4s ease;
}

.company-information:hover .company-logo img {
  transform: scale(1.035);
}

.company-category {
  color: var(--rose-gold);
  font-size: 8px;
  letter-spacing: 2px;
}

.company-information h3 {
  margin: 16px 0;

  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(24px, 2.7vw, 35px);
  font-weight: 500;
  line-height: 1.2;
}

.company-divider {
  width: 45px;
  height: 1px;
  margin: 23px 0;
  background: var(--champagne-gold);
}

.company-information h4 {
  max-width: 420px;
  margin: 0 0 17px;

  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(28px, 3.1vw, 42px);
  font-weight: 400;
  line-height: 1.15;
}

.company-information > p {
  max-width: 430px;
  margin: 0 0 28px;
  color: var(--muted);
  font-size: 12px;
  line-height: 2;
}

/* BRAND STATEMENT */

.brand-statement {
  position: relative;
  min-height: 570px;
  padding: 100px 7%;

  display: grid;
  place-items: center;

  overflow: hidden;

  color: var(--ivory);
  text-align: center;
  background: var(--espresso);
}

.statement-background,
.statement-overlay {
  position: absolute;
  inset: 0;
}

.statement-background {
  background-image: url('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2200&q=85');
  background-size: cover;
  background-position: center;
}

.statement-overlay {
  background: rgba(39, 29, 27, 0.68);
}

.statement-content {
  position: relative;
  z-index: 1;
  max-width: 850px;
}

.statement-logo {
  display: block;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  object-fit: contain;
}

.statement-content > .eyebrow {
  color: #e8c7ad;
}

.statement-ornament {
  margin: 25px 0;
  color: #e8c7ad;
  font-size: 22px;
}

.statement-content h2 {
  font-size: clamp(43px, 6vw, 75px);
}

.statement-content h2 em {
  color: #e8c7ad;
}

.statement-content > p {
  max-width: 550px;
  margin: 25px auto 32px;

  color: #eee0d3;

  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  line-height: 1.65;
}

/* HOUSE JOURNAL */

.journal-section {
  background: var(--ivory);
}

.journal-heading {
  margin-bottom: 45px;
}

.journal-heading .text-link {
  margin-bottom: 8px;
}

.journal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.journal-card {
  min-height: 320px;
  padding: 28px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  background: #f2e8df;
  border: 1px solid rgba(183, 110, 121, 0.18);

  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}

.journal-card:hover {
  transform: translateY(-5px);
  border-color: var(--rose-gold);
}

.journal-topline {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;

  color: var(--rose-gold);
  font-size: 8px;
  letter-spacing: 1.3px;
}

.journal-star {
  font-size: 15px;
}

.journal-date {
  margin-top: 40px;
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 1.5px;
}

.journal-card h3 {
  margin: 15px 0 12px;

  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.15;
}

.journal-card > p {
  margin: 0 0 25px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.9;
}

.journal-link {
  margin-top: auto;
  padding-bottom: 6px;

  border-bottom: 1px solid var(--rose-gold);

  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1.3px;
}

.journal-link span {
  margin-left: 8px;
}

/* CONTACT CALL TO ACTION */

.contact-cta {
  padding: 100px 7%;
  background: #eee0d4;
  text-align: center;
}

.contact-cta > .eyebrow {
  margin-bottom: 25px;
  color: var(--rose-gold);
}

.contact-cta h2 {
  font-size: clamp(43px, 6vw, 70px);
}

.contact-cta > p {
  max-width: 470px;
  margin: 25px auto 30px;
  color: var(--muted);
  font-size: 12px;
  line-height: 2;
}

/* ANIMATIONS */

@keyframes hero-reveal {
  from {
    opacity: 0.6;
    transform: scale(1.06);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes content-reveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* TABLET */

@media (max-width: 900px) {
  .section-padding {
    padding: 80px 6%;
  }

  .introduction {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .company-card,
  .company-card.reversed {
    grid-template-columns: 1fr 1fr;
    gap: 35px;
  }

  .company-card.reversed .company-image-link {
    order: 2;
  }

  .company-card.reversed .company-information {
    order: 1;
  }

  .company-logo {
    max-width: 190px;
    height: 145px;
  }

  .journal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .journal-card:last-child {
    grid-column: 1 / -1;
  }
}

/* MOBILE */

@media (max-width: 600px) {
  .hero {
    min-height: 680px;
    min-height: 82svh;
  }

  .hero-content {
    padding: 70px 22px;
  }

  .hero-logo {
    width: 85px;
    height: 85px;
  }

  .hero h1 {
    font-size: clamp(43px, 11vw, 65px);
    letter-spacing: 0;
  }

  .hero h1 span {
    letter-spacing: 0;
  }

  .hero-content > .eyebrow {
    font-size: 7px;
    letter-spacing: 1.5px;
  }

  .hero-pretitle {
    font-size: 9px;
    letter-spacing: 3px;
  }

  .hero-description {
    font-size: 19px;
  }

  .hero-side-label {
    right: 8px;
    font-size: 6px;
  }

  .hero-bottom {
    bottom: 16px;
    font-size: 6px;
    letter-spacing: 0.6px;
  }

  .section-padding {
    padding: 65px 7%;
  }

  .intro-main h2,
  .section-heading h2,
  .statement-content h2,
  .contact-cta h2 {
    font-size: 43px;
  }

  .intro-watermark {
    right: -25px;
    bottom: -45px;
    font-size: 220px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 45px;
  }

  .section-heading > p {
    text-align: left;
  }

  .company-list {
    gap: 55px;
  }

  .company-card,
  .company-card.reversed {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .company-card.reversed .company-image-link,
  .company-card.reversed .company-information {
    order: initial;
  }

  .company-image-wrap {
    aspect-ratio: 4 / 4.5;
  }

  .company-information {
    padding-top: 5px;
  }

  .company-logo {
    max-width: 180px;
    height: 130px;
    margin-bottom: 15px;
  }

  .company-information h3 {
    font-size: 28px;
  }

  .company-information h4 {
    font-size: 35px;
  }

  .brand-statement {
    min-height: 490px;
    padding: 75px 7%;
  }

  .statement-logo {
    width: 65px;
    height: 65px;
  }

  .statement-content > p {
    font-size: 19px;
  }

  .journal-heading {
    gap: 25px;
  }

  .journal-grid {
    grid-template-columns: 1fr;
  }

  .journal-card:last-child {
    grid-column: auto;
  }

  .journal-card {
    min-height: 280px;
  }

  .contact-cta {
    padding: 75px 7%;
  }
}

/* ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {
  .hero-image,
  .hero-content {
    animation: none;
  }

  .company-image,
  .company-logo img,
  .journal-card,
  .text-link span {
    transition: none;
  }
}
</style>