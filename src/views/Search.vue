<template>
  <div class="search-container">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="search-result-container">
        <h1 class="search-title">搜索结果</h1>
        <div class="keyword-display">
          <p>搜索关键词：<span class="keyword">{{ keyword }}</span></p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
        </div>

        <!-- 搜索结果列表 -->
        <div v-else class="search-results">
          <div 
            v-for="song in songs" 
            :key="song.id" 
            class="search-result-item" 
            @click="playSong(song)"
          >
            <div class="song-info">
              <h4 class="song-name">{{ song.name }}</h4>
              <p class="song-artist">
                {{ song.artists.map(artist => artist.name).join('、') }}
              </p>
            </div>
            <div class="play-icon" @click.stop="playSong(song)"></div>
          </div>

          <!-- 无结果提示 -->
          <div v-if="!loading && songs.length === 0" class="no-result">
            <p>没有找到与"{{ keyword }}"相关的内容</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部播放条 -->
    <PlayerBar />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchAPI, songAPI } from '../api'
import { usePlayerStore } from '../store/player'
import Navbar from '../components/Navbar.vue'
import PlayerBar from '../components/PlayerBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()

// 状态定义
const keyword = ref(route.query.keyword || '')
const songs = ref([])
const loading = ref(false)

// 执行搜索
const performSearch = async () => {
  if (!keyword.value.trim()) return

  loading.value = true
  try {
    const response = await searchAPI.search(keyword.value, 1, 30) // 只搜索单曲
    songs.value = response.result?.songs || []
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

// 播放歌曲
const playSong = async (song) => {
  try {
    const response = await songAPI.getSongUrl(song.id)
    if (response.data && response.data.length > 0) {
      const songUrl = response.data[0].url
      if (songUrl) {
        playerStore.setCurrentSong({
          id: song.id,
          name: song.name,
          artist: song.artists.map(a => a.name).join('、'),
          album: song.album.name,
          url: songUrl,
          duration: song.duration / 1000
        })
      }
    }
  } catch (error) {
    console.error('播放失败:', error)
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 初始化搜索
onMounted(() => {
  if (keyword.value) {
    performSearch()
  }
})

// 监听关键词变化
watch(() => route.query.keyword, (newKeyword) => {
  keyword.value = newKeyword || ''
  if (keyword.value) {
    performSearch()
  }
})
</script>

<style scoped>
/* 搜索容器样式 */
.search-container {
  min-height: 100vh;
  padding-top: var(--header-height);
  padding-bottom: var(--player-height);
  background-color: var(--light-gray);
}

/* 主内容区样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 搜索结果容器 */
.search-result-container {
  background-color: var(--white);
  border-radius: 12px;
  padding: 30px;
  box-shadow: var(--shadow);
}

/* 搜索标题 */
.search-title {
  font-size: 24px;
  color: var(--text-color);
  margin-bottom: 15px;
  position: relative;
  padding-left: 12px;
}

.search-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

/* 关键词显示 */
.keyword-display {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.keyword {
  color: var(--primary-color);
  font-weight: 600;
}

/* 搜索结果列表 */
.search-results {
  margin-top: 20px;
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
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
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

/* 无结果提示 */
.no-result {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(211, 47, 47, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-result-container {
    padding: 20px 15px;
  }

  .search-title {
    font-size: 20px;
  }
}
</style>