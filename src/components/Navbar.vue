<template>
  <div class="search-overlay" v-if="showOverlay"></div>
  <header class="navbar-container">
    <div class="navbar-wrapper">
      <div class="logo-container">
        <a href="/" class="logo">
          <span class="logo-text">YPlayer</span>
        </a>
      </div>

      <nav class="nav-links" v-if="!isMobile">
        <a href="/" class="nav-link" :class="{ active: currentRoute === '/' }">首页</a>
        <a href="/discover" class="nav-link" :class="{ active: currentRoute === '/discover' }">发现</a>
        <a href="/my" class="nav-link" :class="{ active: currentRoute === '/my' }">个人中心</a>
        <a href="/playlist" class="nav-link" :class="{ active: currentRoute === '/playlist' }">歌单</a>
      </nav>
      
      <div class="search-container">

        <button 
      class="floating-search-button"
      @click="handleSearch" 
    >搜索</button>
        <div class="search-input-wrapper" @click.stop="showOverlay = true">
          <input
            type="text"
            placeholder="搜索歌曲、歌手、专辑..."
            class="search-input"
            v-model="searchKeyword"
            @keydown.enter="handleSearch"
            @focus="getSearchSuggest"
            @input="debounceGetSearchSuggest"
          />
          <span class="search-icon" @click="handleSearch" v-if="searchKeyword"></span>
        </div>

        <!-- 搜索结果下拉框 -->
        <div class="search-results" v-if="showSuggestions">
          <div class="search-results-header">
            <h3>搜索结果</h3>
          </div>
          <div class="search-results-list" ref="searchResultsList">
            <div
              class="search-result-item" 
              v-for="song in searchSuggestions"
              :key="song.id"
              @click="playSong(song)"
            >
              <div class="song-info">
                <h4 class="song-name">{{ song.name }}</h4>
                <p class="song-artist">
                  {{ song.artists.map(artist => artist.name).join('、') }}
                </p>
              </div>
              <div class="play-icon"></div>
            </div>
          </div>
          <div class="loading-indicator" v-if="loadingMore">
            <div class="spinner"></div>
          </div>
        </div>
      </div>

      <div class="user-actions">
        <div v-if="userStore.isLoggedIn" class="user-profile">
          <img
            :src="userStore.avatarUrl"
            alt="用户头像"
            class="avatar"
            @click="toggleUserMenu"
          />
          <div class="user-menu" v-if="showUserMenu">
            <a href="/profile" class="menu-item">个人中心</a>
            <a href="/settings" class="menu-item">设置</a>
            <div class="menu-divider"></div>
            <a href="#" class="menu-item logout" @click="handleLogout">退出登录</a>
          </div>
        </div>
        <button v-else class="login-btn" @click="handleLogin">登录</button>
      </div>

      <button class="mobile-menu-btn" :class="{ 'active': showMobileMenu }" @click="toggleMobileMenu" v-if="isMobile">
        <span class="menu-icon"></span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ 'show': showMobileMenu }">
      <nav class="mobile-nav-links">
        <a href="/" class="mobile-nav-link" @click="closeMobileMenu">首页</a>
        <a href="/discover" class="mobile-nav-link" @click="closeMobileMenu">发现</a>
        <a href="/my" class="mobile-nav-link" @click="closeMobileMenu">个人中心</a>
        <a href="/playlist" class="mobile-nav-link" @click="closeMobileMenu">歌单</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
// 引入必要的库和API
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { searchAPI, songAPI } from '../api'
import { usePlayerStore } from '../store/player'

// 状态定义
const userStore = useUserStore()
const playerStore = usePlayerStore()
const router = useRouter()
const searchKeyword = ref('')
const isMobile = ref(false)
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const currentRoute = ref(router.currentRoute.value.path)
const searchSuggestions = ref([])
const showSuggestions = ref(false)
const showOverlay = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const totalResults = ref(0)
const searchResultsList = ref(null)
const debounceTimer = ref(null)

// 计算属性
const isLogin = computed(() => userStore.isLoggedIn)

// 方法定义
/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

/**
 * 切换移动端菜单
 */
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

/**
 * 关闭移动端菜单
 */
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

/**
 * 切换用户菜单
 */
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } })
    searchKeyword.value = ''
    showSuggestions.value = false
  }
}

/**
 * 处理登录
 */
const handleLogin = () => {
  router.push('/login')
}

/**
 * 处理登出
 */
const handleLogout = (e) => {
  e.preventDefault()
  userStore.logout()
  showUserMenu.value = false
  router.push('/')
}

/**
 * 获取搜索建议
 */
const getSearchSuggest = async () => {
  if (searchKeyword.value.trim().length < 2) {
    showSuggestions.value = false
    return
  }

  try {
    currentPage.value = 1
    // 使用search方法代替getSearchSuggest，以支持分页
    const response = await searchAPI.search(searchKeyword.value, 1, 10, 0)
    searchSuggestions.value = response.result.songs || []
    totalResults.value = response.result.songCount || 0
    showSuggestions.value = searchSuggestions.value.length > 0
    showOverlay.value = showSuggestions.value
  } catch (error) {
    console.error('Failed to get search suggestions:', error)
    showSuggestions.value = false
  }
}

/**
 * 防抖获取搜索建议
 */
const debounceGetSearchSuggest = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = setTimeout(() => {
    getSearchSuggest()
  }, 500)
}

/**
 * 加载更多搜索结果
 */
const loadMoreResults = async () => {
  if (loadingMore.value || searchSuggestions.value.length >= totalResults.value) {
    return
  }

  loadingMore.value = true
  currentPage.value++

  try {
    const offset = (currentPage.value - 1) * 10
    const response = await searchAPI.search(searchKeyword.value, 1, 10, offset)
    searchSuggestions.value = [...searchSuggestions.value, ...(response.result.songs || [])]
  } catch (error) {
    console.error('Failed to load more search results:', error)
  } finally {
    loadingMore.value = false
  }
}

/**
 * 播放歌曲
 */
const playSong = async (song) => {
  try {
    // 获取歌曲URL
    const response = await songAPI.getSongUrl(song.id)
    if (response.data && response.data.length > 0) {
      const songUrl = response.data[0].url
      // 更新播放器状态
      playerStore.setCurrentSong({
        id: song.id,
        name: song.name,
        artist: song.artists.map(artist => artist.name).join('、'),
        album: song.album.name,
        url: songUrl,
        duration: song.duration
      })
      playerStore.play()
      // 关闭搜索建议
      showSuggestions.value = false
      showOverlay.value = false
    }
  } catch (error) {
    console.error('Failed to play song:', error)
  }
}

/**
 * 监听滚动事件，实现触底加载更多
 */
const handleScroll = () => {
  if (!searchResultsList.value || loadingMore.value) {
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = searchResultsList.value
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadMoreResults()
  }
}

// 生命周期钩子
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('click', (e) => {
    // 点击其他地方关闭用户菜单
    if (!e.target.closest('.user-profile')) {
      showUserMenu.value = false
    }

    // 点击其他地方关闭搜索建议和蒙版
    if (!e.target.closest('.search-input-wrapper') && !e.target.closest('.search-results')) {
      showSuggestions.value = false
      showOverlay.value = false
    }
  })

  // 监听路由变化
  router.afterEach((to) => {
    currentRoute.value = to.path
    // 路由变化时关闭搜索建议和蒙版
    showSuggestions.value = false
    showOverlay.value = false
  })

  // 监听搜索结果列表的滚动事件
  watch(showSuggestions, (newValue) => {
    if (newValue) {
      nextTick(() => {
        if (searchResultsList.value) {
          searchResultsList.value.addEventListener('scroll', handleScroll)
        }
      })
    } else if (searchResultsList.value) {
      searchResultsList.value.removeEventListener('scroll', handleScroll)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 导航栏容器样式 */
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow);
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: var(--transition);
}

/* 间距类 */
.mt-20 {
  margin-top: 20px;
}

/* 导航栏内容样式 */
.navbar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo样式 */
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -1px;
}

/* 导航链接样式 */
.nav-links {
  display: flex;
  margin: 0 20px;
}

.nav-link {
  padding: 0 15px;
  font-size: 16px;
  color: var(--text-color);
  height: var(--header-height);
  line-height: var(--header-height);
  position: relative;
  transition: var(--transition);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.active {
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary-color);
}

/* 搜索框样式 */
.search-container {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  height: 36px;
  background-color: #f0f0f0;
  border-radius: 18px;
  overflow: hidden;
  transition: var(--transition);
}

.search-input-wrapper:hover {
  background-color: #e8e8e8;
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMTgiIHkxPSI2IiB4Mj0iNiIgeTI9IjE4Ii8+PGxpbmUgeDE9IjYiIHkxPSI2IiB4Mj0iMTgiIHkyPSIxOCIvPjwvc3ZnPg==');
  background-size: cover;
  cursor: pointer;
}
/* 新增浮动按钮样式 */
.floating-search-button {
  position: absolute;
  right: -70px; /* 按钮定位到搜索框右侧 */
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.floating-search-button:hover {
  background-color: var(--primary-dark);
}

/* 搜索蒙版样式 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 搜索结果下拉框样式 */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: var(--white);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1002;
  max-height: 400px;
  overflow: hidden;
  box-sizing: border-box;
}

.search-results-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--medium-gray);
}

.search-results-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.search-results-list {
  max-height: 320px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--light-gray);
  cursor: pointer;
  transition: var(--transition);
}

.search-result-item:hover {
  background-color: var(--light-gray);
}

.song-info {
  flex: 1;
  overflow: hidden;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-icon {
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBzdHJva2U9IiMzMzMiIGQ9Ik04IDV2MTBsNi01eiIvPjwvZz48L3N2Zz4=');
  background-size: cover;
  opacity: 0;
  transition: var(--transition);
}

.search-result-item:hover .play-icon {
  opacity: 1;
}

/* 加载指示器样式 */
.loading-indicator {
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--light-gray);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 用户操作区样式 */
.user-actions {
  display: flex;
  align-items: center;
}

.user-profile {
  position: relative;
  margin-left: 20px;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: var(--transition);
}

.user-profile:hover .avatar {
  border-color: var(--primary-color);
}

.user-menu {
  position: absolute;
  top: 45px;
  right: 0;
  width: 160px;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 10px 0;
  z-index: 1001;
  display: none;
  animation: fadeIn 0.2s ease;
}

.user-menu.show {
  display: block;
}

.menu-item {
  display: block;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-color);
  transition: var(--transition);
}

.menu-item:hover {
  background-color: var(--light-gray);
  color: var(--primary-color);
}

.menu-divider {
  height: 1px;
  background-color: var(--medium-gray);
  margin: 5px 0;
}

.logout {
  color: var(--primary-color);
}

.login-btn {
  padding: 6px 16px;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}

.login-btn:hover {
  background-color: #b71c1c;
  transform: translateY(-2px);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  position: relative;
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  transition: var(--transition);
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  transition: var(--transition);
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  top: 6px;
}

.mobile-menu-btn.active .menu-icon {
  background-color: transparent;
}

.mobile-menu-btn.active .menu-icon::before {
  top: 0;
  transform: rotate(45deg);
}

.mobile-menu-btn.active .menu-icon::after {
  top: 0;
  transform: rotate(-45deg);
}

/* 移动端菜单样式 */
.mobile-menu {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  background-color: var(--white);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  padding: 15px 0;
  display: none;
  animation: fadeIn 0.3s ease;
}

.mobile-menu.show {
  display: block;
}

.mobile-menu.show {
  display: block;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

.mobile-nav-link {
  padding: 12px 0;
  font-size: 16px;
  color: var(--text-color);
  border-bottom: 1px solid var(--medium-gray);
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .navbar-wrapper {
    padding: 0 15px;
  }

  .nav-links,
  .user-profile {
    display: none;
  }

  .search-container {
    max-width: none;
    margin: 0 10px;
  }

  .mobile-menu-btn {
    display: flex;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}
</style>