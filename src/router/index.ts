import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import HubView from '../views/HubView.vue';
import PersonaView from '../views/PersonaView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/hub', name: 'hub', component: HubView },
  { path: '/persona/:personaId', name: 'persona', component: PersonaView, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
