import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

// 懒加载组件
const Login = () => import('../views/Login.vue')
// 暂时注释掉尚未创建的组件
// const PlaylistDetail = () => import('../views/PlaylistDetail.vue')
// const Player = () => import('../views/Player.vue')
// const Search = () => import('../views/Search.vue')
// const UserProfile = () => import('../views/UserProfile.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  // 暂时注释掉尚未创建的路由
  // {
  //   path: '/playlist/:id',
  //   name: 'PlaylistDetail',
  //   component: PlaylistDetail,
  //   props: true
  // },
  // {
  //   path: '/player',
  //   name: 'Player',
  //   component: Player
  // },
  // {
  //   path: '/search',
  //   name: 'Search',
  //   component: Search
  // },
  // 暂时注释掉尚未创建的UserProfile组件
  // {
  //   path: '/profile',
  //   name: 'UserProfile',
  //   component: UserProfile,
  //   meta: {
  //     requiresAuth: true
  //   }
  // },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'  // 重定向到首页
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    const expires = localStorage.getItem('expires')

    if (token && expires && Date.now() < parseInt(expires)) {
      // 已登录且令牌有效
      next()
    } else {
      // 未登录或令牌过期，重定向到登录页
      next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else {
    next()
  }
})

export default router