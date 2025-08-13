<template>
  <div class="playlists-container">
    <!-- 歌单列表 -->
    <div class="playlist-grid">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item">
        <router-link :to="`/playlist/${playlist.id}`">
          <div class="playlist-cover">
            <img :src="playlist.picUrl" :alt="playlist.name" class="cover-img">
            <div class="playlist-playcount">
              <i class="play-icon"></i>
              <span>{{ formatPlayCount(playlist.playCount) }}</span>
            </div>
          </div>
          <div class="playlist-name">{{ playlist.name }}</div>
        </router-link>
      </div>
    </div>

    <!-- 换一批按钮 -->
    <div class="load-more-container">
      <button class="load-more-btn" @click="refreshPlaylists" :loading="isLoading">换一批</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlaylistAPI } from '@/api/playlist.js'
import { message } from 'ant-design-vue'

// 初始化数据
const playlists = ref([])
const currentLimit = ref(18) // 每次加载18个（3行×6列）
const isLoading = ref(false)

// 导入API
const { getRecommendPlaylists } = usePlaylistAPI()

/**
 * 格式化播放量
 * @param {number} count - 播放量
 * @returns {string} 格式化后的播放量字符串
 */
const formatPlayCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

/**
 * 加载推荐歌单
 */
const loadRecommendPlaylists = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    const response = await getRecommendPlaylists(currentLimit.value)
    if (response.code === 200) {
      playlists.value = response.result
      // 如果返回的歌单数量少于请求的数量，说明没有更多歌单了
      // 换一批功能不需要判断是否有更多数据
    } else {
      message.error('获取歌单失败')
    }
  } catch (error) {
    console.error('获取歌单出错:', error)
    message.error('网络错误，获取歌单失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 刷新歌单（换一批）
 */
const refreshPlaylists = () => {
  if (isLoading.value) return

  // 重置歌单列表，准备加载新数据
  playlists.value = []
  loadRecommendPlaylists()
}

// 组件挂载时加载数据
onMounted(() => {
  loadRecommendPlaylists()
})
</script>

<style scoped>
.playlists-container {
  padding: 20px;
}

/* 歌单网格布局 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

/* 歌单项样式 */
.playlist-item {
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.playlist-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 正方形比例 */
  overflow: hidden;
}

.cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.playlist-item:hover .cover-img {
  transform: scale(1.05);
}

.playlist-playcount {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  border-top-left-radius: 4px;
}

.play-icon {
  margin-right: 5px;
  width: 14px;
  height: 14px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>') no-repeat;
  background-size: contain;
}

.playlist-name {
  margin-top: 10px;
  padding: 0 5px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
}

/* 加载更多按钮样式 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-more-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.load-more-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .playlist-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 992px) {
  .playlist-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .playlists-container {
    padding: 15px;
  }

  .playlist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .playlist-name {
    font-size: 13px;
  }
}
</style>