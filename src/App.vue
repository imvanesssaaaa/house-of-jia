<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div class="website-shell">
    <!-- ANNOUNCEMENT BAR -->
    <div class="announcement-strip">
      <span>HOUSE OF JIÆZÉLLE</span>
      <p>FOR EVERY DESTINATION, FOR EVERY ADVENTURE.</p>
    </div>

    <!-- NAVIGATION -->
    <header class="site-header">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <img
          src="/logos/house-of-jiaezelle.png"
          alt="House of Jiæzélle official logo"
          class="brand-logo"
        />

        <div class="brand-text">
          <span class="brand-name">HOUSE OF JIÆZÉLLE</span>
          <span class="brand-caption">A WORLD OF POSSIBILITIES</span>
        </div>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
      </button>

      <nav class="main-nav" :class="{ 'nav-open': menuOpen }">
        <RouterLink to="/" @click="closeMenu">Home</RouterLink>

        <RouterLink to="/about" @click="closeMenu">About</RouterLink>

        <RouterLink to="/announcements" @click="closeMenu">
          Announcements
        </RouterLink>

        <RouterLink to="/contact" @click="closeMenu">Contact</RouterLink>
      </nav>
    </header>

    <!-- PAGE CONTENT -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          
          <h2>HOUSE OF JIÆZÉLLE</h2>

          <p>
            Four worlds. One House.
            <br />
            An empire of elegance and imagination.
          </p>

          <span class="footer-motto">
            FOR EVERY DESTINATION, FOR EVERY ADVENTURE.
          </span>
        </div>

        <div class="footer-links">
          <h3>THE HOUSE</h3>

          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About Us</RouterLink>
          <RouterLink to="/announcements">Announcements</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
        </div>

        <div class="footer-links">
          <h3>OUR COMPANIES</h3>

          <RouterLink to="/shop">House of Jiæzélle Shop</RouterLink>
          <RouterLink to="/naux-hotel">NAUX Hotel</RouterLink>
          <RouterLink to="/jn-couture">JN Couture</RouterLink>
          <RouterLink to="/nausicaa-creative-studios">
            Nausicaa Creative Studios
          </RouterLink>
        </div>
      </div>

      <div class="footer-bottom">
        <span>
          © {{ new Date().getFullYear() }} HOUSE OF JIÆZÉLLE
        </span>

        <span>CRAFTED WITH ELEGANCE. UNITED BY VISION.</span>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&play=swap');

/* =========================================
   HOUSE OF JIÆZÉLLE — GLOBAL BRAND VARIABLES
========================================= */

:root {
  font-family: 'DM Sans', sans-serif;

  --ivory: #faf7f2;
  --cream: #f0e6dc;
  --champagne: #e8d8c3;
  --champagne-gold: #c5a572;
  --rose-gold: #b76e79;
  --antique-gold: #a58a60;
  --mocha: #594638;
  --espresso: #29241f;
  --muted: #81776c;
  --line: rgba(87, 70, 56, 0.19);

  color: var(--espresso);
  background: var(--ivory);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  scroll-behavior: smooth;
  scroll-padding-top: 110px;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

body,
button,
input,
textarea,
select {
  font-family: 'DM Sans', sans-serif;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

a {
  color: inherit;
  text-decoration: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--rose-gold);
  outline-offset: 4px;
}

img {
  max-width: 100%;
}

/* =========================================
   WEBSITE LAYOUT
========================================= */

.website-shell {
  width: 100%;
  min-height: 100vh;
  overflow: clip;
}

.main-content {
  width: 100%;
  min-height: 60vh;
}

/* =========================================
   ANNOUNCEMENT STRIP
========================================= */

.announcement-strip {
  width: 100%;
  min-height: 34px;
  padding: 8px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  background: var(--espresso);
  color: var(--ivory);

  font-size: 9px;
  letter-spacing: 2px;
}

.announcement-strip > span {
  font-weight: 600;
  color: var(--champagne);
}

.announcement-strip p {
  margin: 0;
  text-align: right;
  color: #e8d8c3;
}

/* =========================================
   NAVIGATION
========================================= */

.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  min-height: 104px;
  padding: 15px 5%;

  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 35px;

  background: rgba(250, 247, 242, 0.97);
  border-bottom: 1px solid var(--line);

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  min-width: 0;
}

.brand-logo {
  display: block;
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  object-fit: contain;
  object-position: center;
  background: transparent;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(17px, 1.8vw, 27px);
  font-weight: 600;
  letter-spacing: 1.2px;
  white-space: nowrap;
}

.brand-caption {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 2px;
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(18px, 2.8vw, 42px);
}

.main-nav a {
  position: relative;
  padding: 12px 0;

  color: var(--mocha);

  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;

  transition: color 0.3s ease;
}

.main-nav a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 4px;

  width: 0;
  height: 1px;

  background: var(--rose-gold);
  transition: width 0.3s ease;
}

.main-nav a:hover,
.main-nav a.router-link-exact-active {
  color: var(--rose-gold);
}

.main-nav a:hover::after,
.main-nav a.router-link-exact-active::after {
  width: 100%;
}

.menu-toggle {
  display: none;
}

/* =========================================
   FOOTER
========================================= */

.site-footer {
  width: 100%;
  padding: 75px 7% 25px;
  background: var(--espresso);
  color: var(--ivory);
}

.footer-top {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 1.2fr;
  gap: 55px;

  padding-bottom: 55px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 12px;
}

.footer-brand h2 {
  margin: 0 0 12px;

  font-family: 'Cormorant Garamond', serif;
  font-size: 25px;
  font-weight: 500;
  letter-spacing: 1.5px;
}

.footer-brand p {
  margin: 0 0 20px;

  color: #d1c3b1;

  font-family: 'Cormorant Garamond', serif;
  font-size: 19px;
  line-height: 1.7;
}

.footer-motto {
  color: var(--champagne-gold);
  font-size: 8px;
  line-height: 1.8;
  letter-spacing: 1.3px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.footer-links h3 {
  margin: 7px 0 12px;

  color: var(--champagne-gold);

  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
}

.footer-links a {
  color: #d8cec0;
  font-size: 12px;
  line-height: 1.7;

  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #e6a6a9;
}

.footer-bottom {
  padding-top: 22px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  border-top: 1px solid rgba(255, 255, 255, 0.16);

  color: #c5b8a7;

  font-size: 8px;
  letter-spacing: 1.3px;
  line-height: 1.8;
}

/* =========================================
   TABLET
========================================= */

@media (max-width: 1000px) {
  .site-header {
    gap: 20px;
  }

  .brand-logo {
    width: 46px;
    height: 46px;
  }

  .brand-name {
    font-size: 19px;
  }

  .brand-caption {
    font-size: 7px;
    letter-spacing: 1.4px;
  }

  .main-nav {
    gap: 20px;
  }

  .main-nav a {
    font-size: 9px;
    letter-spacing: 1px;
  }

  .footer-top {
    gap: 30px;
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 760px) {
  .announcement-strip {
    justify-content: center;
    text-align: center;
  }

  .announcement-strip > span {
    display: none;
  }

  .announcement-strip p {
    font-size: 8px;
    letter-spacing: 1.2px;
  }

  .site-header {
    min-height: 80px;
    padding: 12px 5%;
    grid-template-columns: minmax(0, 1fr) 42px;
    gap: 12px;
  }

  .brand {
    gap: 9px;
  }

  .brand-logo {
    width: 40px;
    height: 40px;
  }

  .brand-name {
    font-size: clamp(14px, 4vw, 19px);
    letter-spacing: 0.4px;
  }

  .brand-caption {
    font-size: 6px;
    letter-spacing: 1px;
  }

  .menu-toggle {
    width: 40px;
    height: 40px;
    padding: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;

    border: 1px solid var(--line);
    background: transparent;
    cursor: pointer;
  }

  .menu-toggle span {
    display: block;
    width: 100%;
    height: 1px;
    background: var(--rose-gold);
  }

  .main-nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;

    padding: 10px 6% 22px;

    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0;

    background: var(--ivory);
    border-bottom: 1px solid var(--line);
  }

  .main-nav.nav-open {
    display: flex;
  }

  .main-nav a {
    padding: 16px 0;
    border-bottom: 1px solid var(--line);
    font-size: 10px;
  }

  .main-nav a::after {
    display: none;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 38px;
  }

  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .site-footer {
    padding: 55px 7% 22px;
  }
}

/* =========================================
   ACCESSIBILITY
========================================= */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>