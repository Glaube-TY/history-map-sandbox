import { createRouter, createWebHashHistory } from 'vue-router';

import AboutPage from '@/pages/AboutPage.vue';
import HomePage from '@/pages/HomePage.vue';
import ScenarioPage from '@/pages/ScenarioPage.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/scenario/:id',
      name: 'scenario',
      component: ScenarioPage,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
    },
  ],
});

export default router;
