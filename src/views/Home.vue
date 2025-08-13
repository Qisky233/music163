<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 轮播图 -->
      <div class="banner-container mt-20">
        <div class="banner-wrapper">
          <img v-for="(item, index) in banners" :key="index" :src="item.pic" alt="轮播图" class="banner-img" />
        </div>
      </div>

      <!-- 推荐歌单 -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">推荐歌单</h2>
          <a href="/playlist" class="more-link">查看更多</a>
        </div>
        <div class="playlist-grid">
          <div class="playlist-item" v-for="(playlist, index) in playlists" :key="index" @click="goToPlaylist(playlist.id)">
            <img :src="playlist.picUrl + '?param=200y200'" alt="歌单封面" class="playlist-cover" loading="lazy" />
            <div class="playlist-mask"></div>
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-playcount">{{ formatPlayCount(playlist.playCount) }}</p>
          </div>
        </div>
      </section>

      <!-- 热门歌手 -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">热门歌手</h2>
          <a href="/artist" class="more-link">查看更多</a>
        </div>
        <div class="artist-grid">
          <div class="artist-item" v-for="(artist, index) in artists" :key="index" @click="goToArtist(artist.id)">
            <img :src="artist.picUrl.trim().replace(/`/g, '')" alt="歌手头像" class="artist-avatar" loading="lazy" />
            <h3 class="artist-name">{{ artist.name }}</h3>
            <p class="artist-album">{{ artist.albumSize }}首单曲</p>
            <p class="artist-fans">粉丝: {{ formatPlayCount(artist.fansCount) }}</p>
          </div>
        </div>
      </section>

      <!-- 排行榜和最新音乐并排 -->
      <!-- <div class="side-by-side-container">
        排行榜
        <section class="section-container half-width">
          <div class="section-header">
            <h2 class="section-title">排行榜</h2>
            <a href="/toplist" class="more-link">查看更多</a>
          </div>
          <div class="toplist-container">
            <div class="toplist-item" v-for="(list, index) in topLists" :key="index" @click="goToPlaylist(list.id)">
              <div class="toplist-rank">{{ index + 1 }}</div>
              <img :src="list.coverImgUrl + '?param=100y100'" alt="排行榜封面" class="toplist-cover" loading="lazy" />
              <div class="toplist-info">
                <h3 class="toplist-name">{{ list.name }}</h3>
                <p class="toplist-desc">{{ list.description }}</p>
              </div>
            </div>
          </div>
        </section>

        最新音乐
        <section class="section-container half-width">
          <div class="section-header">
            <h2 class="section-title">最新音乐</h2>
            <a href="/newest" class="more-link">查看更多</a>
          </div>
          <div class="song-list">
            <div class="song-item" v-for="(song, index) in newSongs" :key="index" @click="playSong(song.id)">
              <div class="song-rank">{{ index + 1 }}</div>
              <div class="song-info">
                <h3 class="song-name">{{ song.name }}</h3>
                <p class="song-artist">{{ song.artists.map(artist => artist.name).join(' / ') }}</p>
              </div>
              <div class="song-duration">{{ formatTime(song.duration / 1000) }}</div>
            </div>
          </div>
        </section>
      </div> -->
    </main>

    <!-- 底部播放条 -->
    <PlayerBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistAPI, useMusicAPI, useArtistAPI, useBannerAPI, useTopListAPI } from '../api/index'
import { usePlayerStore } from '../store/player'
import Navbar from '../components/Navbar.vue'
import PlayerBar from '../components/PlayerBar.vue'

// 状态定义
const router = useRouter()
const playerStore = usePlayerStore()
const { getRecommendPlaylists } = usePlaylistAPI()
const { getSongDetail, getNewSongs } = useMusicAPI()
const { getHotArtists } = useArtistAPI()
const { getBanners } = useBannerAPI()
const { getTopList } = useTopListAPI()
const banners = ref([])
const playlists = ref([])
const artists = ref([])
const newSongs = ref([])
const topLists = ref([])
const loading = ref(true)

// 方法定义
/**
 * 获取轮播图数据
 */
const getBanners = async () => {
  try {
    const response = await bannerAPI.getBanners(0) // 0 表示 PC 端
    banners.value = response.banners.map(banner => ({
      pic: banner.imageUrl.trim().replace(/`/g, ''),
      url: banner.url.trim().replace(/`/g, ''),
      targetId: banner.targetId,
      targetType: banner.targetType
    }))
  } catch (error) {
    console.error('Failed to get banners:', error)
  }
}

/**
 * 获取推荐歌单
 */
const getRecommendPlaylists = async () => {
  try {
    const response = await playlistAPI.getRecommendPlaylists(12)
    playlists.value = response.result || []
  } catch (error) {
    console.error('Failed to get recommend playlists:', error)
  }
}

/**
 * 获取热门歌手
 */
const getHotArtists = async () => {
  try {
    const response = await artistAPI.getHotArtists(6)
    artists.value = response.artists || []
  } catch (error) {
    console.error('Failed to get hot artists:', error)
  }
}

/**
 * 获取最新音乐
 */
const getNewSongs = async () => {
  try {
    const response = await musicAPI.getNewSongs(10)
    // 根据接口数据结构处理数据
    newSongs.value = response.result.map(item => {
      const song = item.song
      return {
        id: song.id,
        name: song.name,
        artists: song.artists,
        duration: song.duration,
        album: song.album
      }
    })
  } catch (error) {
    console.error('Failed to get new songs:', error)
  }
}

/**
 * 获取排行榜
 */
const getTopLists = async () => {
  try {
    const response = await topListAPI.getTopList()
    // 获取前5个排行榜
    topLists.value = response.list.slice(0, 5)
  } catch (error) {
    console.error('Failed to get top lists:', error)
  }
}

/**
 * 格式化播放量
 * @param {number|null|undefined} playCount - 播放量
 * @returns {string} 格式化后的播放量字符串
 */
const formatPlayCount = (playCount) => {
  if (playCount == null || isNaN(playCount)) {
    return '0'
  } else if (playCount >= 100000000) {
    return (playCount / 100000000).toFixed(1) + '亿'
  } else if (playCount >= 10000) {
    return (playCount / 10000).toFixed(1) + '万'
  } else {
    return playCount.toString()
  }
}

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
 * 前往歌单详情页
 * @param {number} id - 歌单ID
 */
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

/**
 * 前往歌手详情页
 * @param {number} id - 歌手ID
 */
const goToArtist = (id) => {
  router.push(`/artist/${id}`)
}

/**
 * 播放歌曲
 * @param {number} id - 歌曲ID
 */
const playSong = async (id) => {
  try {
    // 获取歌曲详情
    const songDetail = await musicAPI.getSongDetail(id)
    if (songDetail.songs && songDetail.songs.length > 0) {
      const song = songDetail.songs[0]
      // 设置播放列表并播放
      playerStore.setPlaylist([song], 0)
    }
  } catch (error) {
    console.error('Failed to play song:', error)
  }
}

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true
    // 并行请求数据
    await Promise.all([
      getBanners(),
      getRecommendPlaylists(),
      getHotArtists(),
      getNewSongs(),
      getTopLists()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 首页容器样式 */
.home-container {
  min-height: 100vh;
  padding-top: var(--header-height); /* 导航栏高度 */
  padding-bottom: var(--player-height); /* 播放条高度 */
  box-sizing: border-box;
  background-color: var(--light-gray);
  overflow-x: hidden;
}

/* 主内容区样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 轮播图样式 */
.banner-container {
  width: 100%;
  height: 240px;
  overflow: hidden;
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  position: relative;
}

.banner-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
  position: absolute;
  top: 0;
  left: 0;
}

/* 推荐歌单样式 */
.section-container {
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease forwards;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  position: relative;
  padding-left: 12px;
}

.section-title::before {
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

.more-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
}

.more-link:hover {
  color: var(--primary-color);
}

/* 歌单网格布局 - 响应式 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* 歌单项样式 */
.playlist-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: var(--transition);
  background-color: var(--white);
  height: 260px;
  display: flex;
  flex-direction: column;
}

.playlist-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

/* 优化图片大小 */
.playlist-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.playlist-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 180px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-item:hover .playlist-mask {
  opacity: 1;
}

.playlist-name {
  padding: 12px 15px 8px;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color);
  flex: 1;
}

.playlist-playcount {
  padding: 0 15px 15px;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
}

.playlist-playcount::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcgNmw0IDIgLTQgMi00LTItNC0yIDQtMnptMCAxMEw3IDhIN2wtNCA0IDQgNHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4=');
  background-size: cover;
  margin-right: 5px;
}

/* 热门歌手样式 */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 25px;
}

.artist-item {
  text-align: center;
  transition: var(--transition);
  padding: 15px;
  border-radius: 12px;
  background-color: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.artist-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.artist-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 15px;
  border: 4px solid #f0f0f0;
  transition: var(--transition);
}

.artist-item:hover .artist-avatar {
  transform: scale(1.05);
  border-color: var(--primary-color);
}

.artist-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-color);
}

.artist-album {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 5px;
}

.artist-fans {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* 最新音乐样式 */
.song-list {
  background-color: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.song-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: var(--transition);
}

.song-item:hover {
  background-color: #fafafa;
}

.song-rank {
  width: 30px;
  text-align: center;
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 500;
}

.song-rank:nth-child(-n+3) {
  color: var(--primary-color);
  font-weight: 700;
}

.song-info {
  flex: 1;
  margin-left: 15px;
}

.song-name {
  font-size: 15px;
  margin: 0 0 3px;
  color: var(--text-color);
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.song-duration {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 并排容器样式 */
.side-by-side-container {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  align-items: stretch;
  flex-wrap: wrap;
}

.half-width {
  flex: 1;
  min-width: 300px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease forwards;
}

/* 排行榜样式 */
.toplist-container {
  background-color: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toplist-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: var(--transition);
}

.toplist-item:hover {
  background-color: #fafafa;
}

.toplist-rank {
  width: 30px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.toplist-rank:nth-child(-n+3) {
  color: var(--primary-color);
}

.toplist-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-left: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toplist-info {
  flex: 1;
  margin-left: 15px;
}

.toplist-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: var(--text-color);
}

.toplist-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }

  .banner-container {
    height: 160px;
    border-radius: 8px;
  }

  /* 移动端一行两个歌单 */
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .playlist-item {
    height: 220px;
    border-radius: 8px;
  }

  .playlist-cover {
    height: 140px;
  }

  .artist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .artist-item {
    padding: 10px;
    border-radius: 8px;
  }

  .artist-avatar {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }

  .section-title {
    font-size: 20px;
  }

  /* 移动端排行榜和最新音乐分行显示 */
  .side-by-side-container {
    flex-direction: column;
  }

  .half-width {
    min-width: 100%;
    margin-bottom: 20px;
  }

  .song-item, .toplist-item {
    padding: 12px 15px;
  }
}

@media (min-width: 1024px) {
  /* PC端一行六个歌单 */
  .playlist-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 加载动画 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
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
</style>