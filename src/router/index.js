import { createRouter, createWebHistory } from 'vue-router'

// 懒加载组件
const Home = () => import('../views/Home.vue')
const PlaylistDetail = () => import('../views/PlaylistDetail.vue')
const Player = () => import('../views/Player.vue')
const Search = () => import('../views/Search.vue')
const UserProfile = () => import('../views/UserProfile.vue')
const Discover = () => import('../views/Discover.vue')
const Artists = () => import('../views/discover/Artists.vue')
const NewMusic = () => import('../views/discover/NewMusic.vue')
const Playlists = () => import('../views/discover/Playlists.vue')
const Toplists = () => import('../views/discover/Toplists.vue')
const PodcastRadio = () => import('../views/PodcastRadio.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '为我推荐'
    }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover,
    meta: {
      title: '发现音乐'
    },
    children: [
      { path: '', redirect: '/discover/playlists' },

      {
        path: 'artists',
        name: 'Artists',
        component: Artists,
        meta: {
          title: '歌手'
        }
      },
      {
        path: 'newMusic',
        name: 'NewMusic',
        component: NewMusic,
        meta: {
          title: '新歌速递'
        }
      },
      {
        path: 'playlists',
        name: 'Playlists',
        component: Playlists,
        meta: {
          title: '推荐歌单'
        }
      },
      {
        path: 'toplists',
        name: 'Toplists',
        component: Toplists,
        meta: {
          title: '排行榜'
        }
      }
    ]
  },
  {
    path: '/podcastradio',
    name: 'PodcastRadio',
    component: PodcastRadio,
    meta: {
      title: '播客电台'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: {
      title: '搜索'
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      title: '个人中心',
      requiresAuth: false
    }
  },
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