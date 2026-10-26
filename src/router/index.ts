import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import AnnouncementsView from '../views/AnnouncementsView.vue'
import ContactView from '../views/ContactView.vue'
import CompanyView from '../views/CompanyView.vue'
import ShopView from '../views/ShopView.vue'
import JNCoutureView from '../views/JNCoutureView.vue'
import NauxHotelView from '../views/NauxHotelView.vue'
import NausicaaStudiosView from '../views/NausicaaStudiosView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/announcements', name: 'announcements', component: AnnouncementsView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/naux-hotel', name: 'naux-hotel', component: NauxHotelView },
    { path: '/jn-couture', name: 'jn-couture', component: JNCoutureView },
    { path: '/nausicaa-creative-studios', name: 'nausicaa-creative-studios', component: NausicaaStudiosView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 110, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
