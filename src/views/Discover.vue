<template>
  <div class="discover-container">
    <!-- 导航栏 -->
    <Navbar />

    <div class="main-content">
      <!-- <h1 class="page-title">发现音乐</h1> -->

      <!-- 分类导航 -->
      <div class="category-tabs">
        <router-link
          to="/discover/playlists"
          class="tab-item"
          :class="{ 'active': $route.path === '/discover/playlists' }"
        >
          歌单广场
        </router-link>
        <router-link
          to="/discover/toplists"
          class="tab-item"
          :class="{ 'active': $route.path === '/discover/toplists' }"
        >
          排行榜
        </router-link>
        <router-link
          to="/discover/artists"
          class="tab-item"
          :class="{ 'active': $route.path === '/discover/artists' }"
        >
          歌手
        </router-link>
        <router-link
          to="/discover/newMusic"
          class="tab-item"
          :class="{ 'active': $route.path === '/discover/newMusic' }"
        >
          最新音乐
        </router-link>
      </div>

      <!-- 分类内容区域 -->
      <div class="category-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.discover-container {
  min-height: 100vh;
  padding-bottom: var(--player-height); /* 播放条高度 */
  box-sizing: border-box;
  background-color: var(--light-gray);
  overflow-x: hidden;
}

/* 主内容区样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: var(--player-height);
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--text-primary);
}

/* 分类导航样式 */
.category-tabs {
  display: flex;
  overflow-x: auto;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  scrollbar-width: none; /* Firefox */
}

.category-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tab-item {
  padding: 8px 16px;
  margin-right: 16px;
  font-size: 16px;
  color: var(--text-secondary);
  white-space: nowrap;
  border-radius: 4px;
  transition: all 0.3s;
}

.tab-item:hover {
  color: var(--primary-color);
  background-color: rgba(0, 0, 0, 0.05);
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: bold;
  border-bottom: 2px solid var(--primary-color);
  background-color: transparent;
}

/* 分类内容区域样式 */
.category-content {
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }

  .tab-item {
    padding: 6px 12px;
    margin-right: 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px 10px;
  }

  .page-title {
    font-size: 18px;
  }

  .tab-item {
    padding: 5px 10px;
    margin-right: 10px;
    font-size: 13px;
  }
}
</style>