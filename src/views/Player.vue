<template>
  <div class="player-container">
    <!-- 播放器头部 -->
    <div class="player-header">
      <button class="back-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2 class="player-title">{{ currentSong.name }}</h2>
    </div>

    <!-- 专辑封面 -->
    <div class="album-cover-container">
      <div class="album-cover-wrapper" :class="{ rotating: isPlaying }">
        <img :src="currentSong.al.picUrl + '?param=500y500'" alt="专辑封面" class="album-cover">
      </div>
    </div>

    <!-- 歌词区域 -->
    <div class="lyrics-container">
      <div class="lyrics-scroll" ref="lyricsScroll">
        <div v-for="(line, index) in lyrics" :key="index" :class="{ 'active': currentLyricIndex === index }" class="lyric-line">
          {{ line.txt }}
        </div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="player-controls">
      <!-- 进度条 -->
      <div class="progress-container">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="setProgress">
          <div class="progress-filled" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="duration">{{ formatTime(duration) }}</span>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button class="mode-btn" @click="changePlayMode">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon v-if="playMode === 'sequence'" points="19.07 4.93 14.14 9.86 19.07 14.79 17.66 16.2 12 10.54 6.34 16.2 4.93 14.79 9.86 9.86 4.93 4.93 6.34 3.54 12 9.2 17.66 3.54 19.07 4.93"></polygon>
            <path v-else-if="playMode === 'random'" d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 14.14 0M15.54 8.46a5 5 0 0 1 0 7.07M8.46 15.54a5 5 0 0 1 7.07 0"></path>
            <line v-else="playMode === 'loop'" x1="8" y1="6" x2="16" y2="18"></line>
            <line v-else="playMode === 'loop'" x1="16" y1="6" x2="8" y2="18"></line>
          </svg>
        </button>
        <button class="prev-btn" @click="prevSong">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5"></line>
          </svg>
        </button>
        <button class="play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
          <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button class="next-btn" @click="nextSong">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
        </button>
        <button class="volume-btn" @click="toggleVolume">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path v-if="volume > 0.3" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>
        <button class="quality-btn" @click="toggleQualityMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>{{ audioQualityText }}</span>
        </button>
        <div class="quality-menu" v-show="showQualityMenu">
          <ul>
            <li v-for="quality in audioQualityList" :key="quality.value" @click="setQuality(quality.value)">
              {{ quality.label }}
              <span v-if="quality.value === audioQuality.value">✓</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 音量控制 -->
      <div class="volume-control" v-show="showVolume">
        <input type="range" min="0" max="1" step="0.01" :value="volume" @input="setVolume">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../store/player'
import { useSongAPI } from '../api'
import { message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'

// 路由和状态管理
const router = useRouter()
const playerStore = usePlayerStore()

// API初始化
const songAPI = useSongAPI()

// 从store解构状态
const { currentSong, isPlaying, currentTime, duration, volume, playMode, lyrics, currentLyricIndex, audioQuality, audioQualityList, audioQualityText } = storeToRefs(playerStore)

// 计算属性
const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

// 状态定义
const showVolume = ref(false)
const showQualityMenu = ref(false)
const lyricsScroll = ref(null)

/**
 * 格式化时间
 * @param {number} time - 时间（秒）
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
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
 * 改变播放模式
 */
const changePlayMode = () => {
  playerStore.changePlayMode()
}

/**
 * 设置进度
 * @param {Event} e - 点击事件
 */
const setProgress = (e) => {
  const progressBar = e.currentTarget
  const clickX = e.offsetX
  const progressPercent = (clickX / progressBar.offsetWidth) * 100
  const seekTime = (progressPercent / 100) * duration.value
  playerStore.seek(seekTime)
}

/**
 * 切换音量显示
 */
const toggleVolume = () => {
  showVolume.value = !showVolume.value
}

/**
 * 设置音量
 * @param {Event} e - 输入事件
 */
const setVolume = (e) => {
  const newVolume = parseFloat(e.target.value)
  playerStore.setVolume(newVolume)
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 切换音频质量菜单显示
 */
const toggleQualityMenu = () => {
  showQualityMenu.value = !showQualityMenu.value
}

/**
 * 设置音频质量
 * @param {number} quality - 音频质量值
 */
const setQuality = (quality) => {
  playerStore.setAudioQuality(quality)
  showQualityMenu.value = false
}

/**
 * 更新歌词索引
 */
const updateLyricIndex = () => {
  if (!lyrics.value || lyrics.value.length === 0) return

  // 找到当前时间对应的歌词索引
  const currentIndex = lyrics.value.findIndex((line, index) => {
    const nextLine = lyrics.value[index + 1]
    return line.time <= currentTime.value && (!nextLine || nextLine.time > currentTime.value)
  })

  if (currentIndex !== -1 && currentIndex !== currentLyricIndex.value) {
    currentLyricIndex.value = currentIndex
    // 滚动到当前歌词
    scrollToLyric()
  }
}

/**
 * 滚动到当前歌词
 */
const scrollToLyric = () => {
  if (!lyricsScroll.value || currentLyricIndex.value === -1) return

  const lyricElements = lyricsScroll.value.querySelectorAll('.lyric-line')
  if (!lyricElements || lyricElements.length === 0) return

  const currentElement = lyricElements[currentLyricIndex.value]
  if (!currentElement) return

  const scrollTop = currentElement.offsetTop - lyricsScroll.value.offsetHeight / 2 + currentElement.offsetHeight / 2
  lyricsScroll.value.scrollTop = scrollTop
}

// 监听歌词索引变化，滚动到当前歌词
watch(currentLyricIndex, (newIndex) => {
  if (newIndex !== -1) {
    scrollToLyric()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 不需要额外清理，player store会管理音频实例
})
</script>

<style scoped>
.player-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fafafa;
}

.player-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  margin-right: 20px;
}

.player-title {
  font-size: 20px;
  font-weight: bold;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-cover-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.album-cover-wrapper {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
}

.rotating {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  margin-bottom: 30px;
}

.lyrics-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  text-align: center;
}

.lyric-line {
  padding: 8px 0;
  color: #666;
  transition: color 0.3s, transform 0.3s;
}

.lyric-line.active {
  color: #e6162d;
  transform: scale(1.05);
}

.player-controls {
  width: 100%;
}

.progress-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.current-time, .duration {
  width: 60px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
  margin: 0 10px;
  position: relative;
  cursor: pointer;
}

.progress-filled {
  height: 100%;
  background-color: #e6162d;
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.mode-btn, .volume-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin: 0 15px;
}

.prev-btn, .next-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  margin: 0 20px;
}

.play-btn {
  background: #e6162d;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 20px;
}

.volume-control {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.volume-control input {
  width: 200px;
}

.quality-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin: 0 15px;
  display: flex;
  align-items: center;
}

.quality-btn span {
  margin-left: 5px;
  font-size: 14px;
}

.quality-menu {
  position: absolute;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 100;
  min-width: 100px;
  margin-top: 10px;
}

.quality-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quality-menu li {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-menu li:hover {
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .album-cover-wrapper {
    width: 200px;
    height: 200px;
  }
}
</style>