<template>
  <div class="playlist-detail-container">
    <!-- 歌单头部信息 -->
    <div class="playlist-header">
      <img :src="playlist.coverImgUrl + '?param=400y400'" alt="歌单封面" class="playlist-cover">
      <div class="playlist-info">
        <div class="playlist-tag">歌单</div>
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <div class="playlist-creator">
          <img :src="playlist.creator.avatarUrl + '?param=50y50'" alt="创建者头像" class="creator-avatar">
          <span class="creator-name">{{ playlist.creator.nickname }}</span>
        </div>
        <div class="playlist-stats">
          <span class="stat-item">{{ formatPlayCount(playlist.playCount) }} 播放</span>
          <span class="stat-item">{{ playlist.trackCount }} 首歌曲</span>
          <span class="stat-item">{{ formatDate(playlist.createTime) }} 创建</span>
        </div>
        <div class="playlist-actions">
          <button class="play-btn" @click="playAll">播放全部</button>
          <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
            {{ isFavorite ? '已收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 歌单描述 -->
    <div class="playlist-description" v-if="playlist.description">
      <h3>简介</h3>
      <p>{{ playlist.description }}</p>
    </div>

    <!-- 歌曲列表 -->
    <div class="song-list-container">
      <div class="song-list-header">
        <div class="header-item index">序号</div>
        <div class="header-item title">歌曲标题</div>
        <div class="header-item artist">歌手</div>
        <div class="header-item album">专辑</div>
        <div class="header-item duration">时长</div>
      </div>
      <div class="song-list">
        <div v-for="(song, index) in playlist.tracks" :key="song.id" class="song-item" @click="playSong(song, index)">
          <div class="song-index">{{ index + 1 }}</div>
          <div class="song-info">
            <h4 class="song-name">{{ song.name }}</h4>
            <p class="song-artist">
              {{ song.ar.map(artist => artist.name).join('/') }}
            </p>
          </div>
          <div class="song-album">{{ song.al.name }}</div>
          <div class="song-duration">{{ formatDuration(song.dt) }}</div>
          <div class="song-actions">
            <button class="favorite-btn" :class="{ active: song.isFavorite }" @click.stop="toggleSongFavorite(song)">
              {{ song.isFavorite ? '★' : '☆' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistAPI, useSongAPI } from '../api'
import { usePlayerStore } from '../store/player'
import { message } from 'ant-design-vue'

// 初始化API
const playlistAPI = usePlaylistAPI()
const songAPI = useSongAPI()

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

// 状态定义
const playlist = ref({})
const loading = ref(true)
const isFavorite = ref(false)
const playlistId = computed(() => route.params.id)

/**
 * 格式化播放量
 * @param {number} playCount - 播放量
 * @returns {string} 格式化后的播放量字符串
 */
const formatPlayCount = (playCount) => {
  if (playCount >= 100000000) {
    return (playCount / 100000000).toFixed(1) + '亿'
  } else if (playCount >= 10000) {
    return (playCount / 10000).toFixed(1) + '万'
  } else {
    return playCount.toString()
  }
}

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

/**
 * 格式化歌曲时长
 * @param {number} duration - 时长（毫秒）
 * @returns {string} 格式化后的时长字符串
 */
const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 1000 / 60)
  const seconds = Math.floor((duration / 1000) % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

/**
 * 获取歌单详情
 */
const getPlaylistDetail = async () => {
  loading.value = true
  try {
    const response = await playlistAPI.getPlaylistDetail(playlistId.value)
    playlist.value = response.playlist
    // 检查是否收藏
    checkIsFavorite()
  } catch (error) {
    console.error('获取歌单详情失败:', error)
    message.error('获取歌单详情失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

/**
 * 检查是否收藏
 */
const checkIsFavorite = async () => {
  try {
    const response = await playlistAPI.checkFavorite(playlistId.value)
    isFavorite.value = response
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

/**
 * 切换收藏状态
 */
const toggleFavorite = async () => {
  try {
    if (isFavorite.value) {
      await playlistAPI.cancelFavorite(playlistId.value)
      message.success('已取消收藏')
    } else {
      await playlistAPI.addFavorite(playlistId.value)
      message.success('收藏成功')
    }
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    message.error('操作失败，请重试')
  }
}

/**
 * 播放全部歌曲
 */
const playAll = () => {
  if (playlist.value.tracks && playlist.value.tracks.length > 0) {
    playerStore.setPlayList(playlist.value.tracks)
    playerStore.playSong(0)
    message.success(`开始播放《${playlist.value.name}》`)
  }
}

/**
 * 播放指定歌曲
 * @param {Object} song - 歌曲对象
 * @param {number} index - 歌曲索引
 */
const playSong = (song, index) => {
  playerStore.setPlayList(playlist.value.tracks)
  playerStore.playSong(index)
}

/**
 * 切换歌曲收藏状态
 * @param {Object} song - 歌曲对象
 */
const toggleSongFavorite = async (song) => {
  try {
    const isCurrentlyFavorite = song.isFavorite || false
    if (isCurrentlyFavorite) {
      await songAPI.cancelFavorite(song.id)
      message.success(`已取消收藏《${song.name}》`)
    } else {
      await songAPI.addFavorite(song.id)
      message.success(`已收藏《${song.name}》`)
    }
    // 更新本地状态
    song.isFavorite = !isCurrentlyFavorite
  } catch (error) {
    console.error('切换歌曲收藏状态失败:', error)
    message.error('操作失败，请重试')
  }
}

// 初始化
onMounted(() => {
  getPlaylistDetail()
})
</script>

<style scoped>
.playlist-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.playlist-header {
  display: flex;
  margin-bottom: 30px;
}

.playlist-cover {
  width: 240px;
  height: 240px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 30px;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-tag {
  display: inline-block;
  background-color: #f0f2f5;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
}

.playlist-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
}

.playlist-creator {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.creator-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.creator-name {
  color: #666;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.playlist-actions {
  display: flex;
  gap: 15px;
}

.play-btn {
  padding: 8px 24px;
  background-color: #e6162d;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn {
  padding: 8px 20px;
  background-color: #f0f2f5;
  color: #666;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
}

.favorite-btn.active {
  background-color: #ffe8ea;
  color: #e6162d;
}

.playlist-description {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.playlist-description h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.song-list-container {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.song-list-header {
  display: flex;
  background-color: #f7f8fa;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.header-item {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.index {
  width: 80px;
  text-align: center;
}

.title {
  flex: 1;
}

.artist {
  width: 200px;
}

.album {
  width: 200px;
}

.duration {
  width: 100px;
  text-align: right;
}

.song-list {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #f7f8fa;
}

.song-index {
  width: 80px;
  text-align: center;
  color: #999;
}

.song-info {
  flex: 1;
}

.song-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.song-artist {
  font-size: 14px;
  color: #999;
}

.song-album {
  width: 200px;
  color: #999;
  font-size: 14px;
}

.song-duration {
  width: 100px;
  text-align: right;
  color: #999;
  font-size: 14px;
}

.song-actions {
  margin-left: 20px;
}

.song-actions .favorite-btn {
  padding: 4px 8px;
  font-size: 14px;
}
</style>