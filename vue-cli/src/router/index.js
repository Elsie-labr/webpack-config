import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../view/Home/Home.vue')
const About = () => import('../view/About/About.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      component: Home,
    },
    {
      path: '/about',
      component: About,
    },
  ],
})
