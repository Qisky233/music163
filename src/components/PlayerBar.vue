<template>
  <div class="player-bar">
    <div class="player-bar-wrapper">
      <!-- 当前歌曲信息 -->
      <div class="song-info" @click="openPlayerDetail">
        <img
          :src="currentSong?.al?.picUrl || defaultCover"
          alt="歌曲封面"
          class="song-cover"
        />
        <div class="song-meta">
          <h3 class="song-name">{{ currentSong?.name || '暂无播放歌曲' }}</h3>
          <p class="song-artist">{{ currentSong?.ar?.[0]?.name || '未知歌手' }}</p>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <button class="control-btn mode-btn" @click="togglePlayMode">
          <span class="mode-icon" :class="{
  'loop': playMode === 'loop',
  'random': playMode === 'random'
}"></span>
        </button>
        <button class="control-btn prev-btn" @click="prevSong">
          <span class="prev-icon"></span>
        </button>
        <button class="control-btn play-btn" @click="togglePlay">
          <span class="play-icon" :class="{ 'pause-icon': isPlaying }"></span>
        </button>
        <button class="control-btn next-btn" @click="nextSong">
          <span class="next-icon"></span>
        </button>
        <button class="control-btn favorite-btn" @click="toggleFavorite">
          <span class="favorite-icon" :class="{ active: isFavorite }"></span>
        </button>
      </div>

      <!-- 播放进度 -->
      <div class="progress-container">
        <span class="time current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="setProgress">
          <div class="progress-bg"></div>
          <div class="progress-value" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <span class="time total-time">{{ formatTime(duration) }}</span>
      </div>

      <!-- 音量控制 -->
      <div class="volume-container">
        <button class="volume-btn" @click="toggleMute">
          <span class="volume-icon" :class="{ 'mute-icon': isMuted }"></span>
        </button>
        <div class="volume-bar" @click="setVolume">
          <div class="volume-bg"></div>
          <div class="volume-value" :style="{ width: volume * 100 + '%' }"></div>
          <div class="volume-handle" :style="{ left: volume * 100 + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '../store/player'
import { useRouter } from 'vue-router'
import { useSongAPI } from '../api/index'

// 状态定义
const playerStore = usePlayerStore()
const router = useRouter()
const { checkFavorite, addFavorite, cancelFavorite } = useSongAPI()
const defaultCover = 'https://picsum.photos/200/200?random=1'
const isFavorite = ref(false)
const isDragging = ref(false)
const isMuted = ref(false)
const tempVolume = ref(0.7)

// 计算属性
const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const currentTime = computed(() => playerStore.currentTime)
const duration = computed(() => playerStore.duration)
const volume = computed(() => playerStore.volume)
const playMode = computed(() => playerStore.playMode)
const progressPercent = computed(() => playerStore.progressPercent)

// 监听当前歌曲变化
watch(currentSong, (newSong) => {
  if (newSong) {
    // 检查是否收藏
    checkIsFavorite(newSong.id)
  } else {
    isFavorite.value = false
  }
})

// 方法定义
/**
 * 格式化时间
 * @param {number} time - 时间（秒）
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * 切换播放/暂停
 */
const togglePlay = () => {
  playerStore.togglePlay()
}

/**
 * 上一首
 */
const prevSong = () => {
  playerStore.prevSong()
}

/**
 * 下一首
 */
const nextSong = () => {
  playerStore.nextSong()
}

/**
 * 切换播放模式
 */
const togglePlayMode = () => {
  playerStore.togglePlayMode()
}

/**
 * 设置播放进度
 * @param {MouseEvent} e - 鼠标事件
 */
const setProgress = (e) => {
  if (isDragging.value) return

  const progressBar = e.currentTarget
  const rect = progressBar.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = (x / rect.width) * 100
  playerStore.setProgress(percent)
}

/**
 * 设置音量
 * @param {MouseEvent} e - 鼠标事件
 */
const setVolume = (e) => {
  const volumeBar = e.currentTarget
  const rect = volumeBar.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = (x / rect.width)
  playerStore.setVolume(percent)
  isMuted.value = percent === 0
}

/**
 * 切换静音
 */
const toggleMute = () => {
  if (isMuted.value) {
    // 取消静音
    playerStore.setVolume(tempVolume.value)
    isMuted.value = false
  } else {
    // 静音
    tempVolume.value = volume.value
    playerStore.setVolume(0)
    isMuted.value = true
  }
}

/**
 * 检查歌曲是否已收藏
 * @param {number} songId - 歌曲ID
 */
const checkIsFavorite = async (songId) => {
  try {
    // 检查是否收藏
    const response = await checkFavorite(songId)
    isFavorite.value = response.isFavorite
  } catch (error) {
    console.error('Failed to check favorite status:', error)
    isFavorite.value = false
  }
}

/**
 * 切换收藏状态
 */
const toggleFavorite = async () => {
  if (!currentSong.value) return

  try {
    // 收藏/取消收藏
    if (isFavorite.value) {
      await cancelFavorite(currentSong.value.id)
    } else {
      await addFavorite(currentSong.value.id)
    }
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

/**
 * 打开播放器详情页
 */
const openPlayerDetail = () => {
  if (currentSong.value) {
    router.push('/player')
  }
}
</script>

<style scoped>
/* 播放条容器样式 */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--player-height);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: var(--transition);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
}

/* 播放条内容样式 */
.player-bar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 歌曲信息样式 */
.song-info {
  display: flex;
  align-items: center;
  width: 250px;
  cursor: pointer;
  transition: var(--transition);
}

.song-info:hover {
  transform: translateY(-2px);
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
  transition: var(--transition);
}

.song-info:hover .song-cover {
  transform: scale(1.08);
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.35);
}

.song-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 3px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  transition: var(--transition);
}

.song-info:hover .song-name {
  color: var(--primary-color);
}

.song-artist {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 播放控制样式 */
.player-controls {
  display: flex;
  align-items: center;
  margin: 0 20px;
}

.control-btn {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  margin: 0 10px;
  transition: var(--transition);
  outline: none;
}

.control-btn:hover {
  transform: scale(1.15);
}

.play-btn {
  width: 46px;
  height: 46px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 18px;
  box-shadow: 0 4px 15px rgba(211, 47, 47, 0.4);
  transition: var(--transition);
}

.play-btn:hover {
  background-color: var(--primary-dark);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.5);
}

.play-icon {
  width: 20px;
  height: 20px;
  display: block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath d='M8 5v14l11-7z' fill='%23fff'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  transition: var(--transition);
}

.play-icon.pause-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' fill='%23fff'/%3E%3C/svg%3E");
}

.prev-icon, .next-icon {
  width: 26px;
  height: 26px;
  display: block;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--text-secondary);
}

.prev-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' fill='%23333'/%3E%3C/svg%3E");
}

.next-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' fill='%23333'/%3E%3C/svg%3E");
}

.mode-icon {
  width: 22px;
  height: 22px;
  display: block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 10h18v2H3zm0-4h18v2H3zm0 8h12v2H3zm0 4h12v2H3z' fill='%23333'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

/* 添加播放模式切换样式 */
.mode-icon.loop {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z' fill='%23333'/%3E%3C/svg%3E");
}

.mode-icon.random {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 3c-4.97 0-9 4.03-9 9 0 2.49 1.02 4.76 2.67 6.34l-1.23 1.23 1.41 1.41 1.23-1.23c1.58 1.66 3.85 2.67 6.34 2.67 4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-3-8l3 1V7l-3 1.9V9z' fill='%23333'/%3E%3C/svg%3E");
}

.favorite-icon {
  width: 22px;
  height: 22px;
  display: block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='none' stroke='%23333' stroke-width='2'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.favorite-icon.active {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23d32f2f'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

/* 播放进度样式 */
.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 400px;
}

.time {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 10px;
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.progress-bar:hover {
  height: 6px;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.progress-value {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background-color: white;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(211, 47, 47, 0.6);
  cursor: pointer;
  transition: var(--transition);
  z-index: 1;
}

.progress-bar:hover .progress-handle {
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 15px rgba(211, 47, 47, 0.7);
}

/* 音量控制样式 */
.volume-container {
  display: flex;
  align-items: center;
  width: 120px;
  margin-left: 10px;
}

.volume-btn {
  width: 22px;
  height: 22px;
  margin-right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.volume-icon {
  width: 100%;
  height: 100%;
  display: block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm16.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' fill='%23333'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  transition: var(--transition);
}

.volume-icon.mute-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 9v6h4l5 5V4L11 9H7zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM17 4.44L19.56 7H17V4.44zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' fill='%23333'/%3E%3C/svg%3E");
}

.volume-btn:hover .volume-icon {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.volume-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.volume-bar:hover {
  height: 6px;
}

.volume-bg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.volume-value {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--text-secondary);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.volume-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background-color: white;
  border: 2px solid var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.volume-bar:hover .volume-handle {
  transform: translateY(-50%) scale(1.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .player-bar {
    height: var(--player-height-mobile);
    padding: 0 10px;
  }

  .player-bar-wrapper {
    padding: 0 15px;
  }

  .song-info {
    width: 35%;
    min-width: 150px;
  }

  .song-cover {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    margin-right: 10px;
  }

  .song-name {
    font-size: 13px;
  }

  .song-artist {
    font-size: 11px;
  }

  .player-controls {
    margin: 0 10px;
  }

  .control-btn {
    margin: 0 8px;
  }

  .play-btn {
    width: 40px;
    height: 40px;
    margin: 0 12px;
  }

  .progress-container {
    max-width: none;
    width: 100%;
  }

  .time {
    font-size: 11px;
    min-width: 35px;
    margin: 0 5px;
  }

  .volume-container {
    width: 50px;
    margin-left: 5px;
  }

  .volume-bar {
    display: none;
  }
}
</style>