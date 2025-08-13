<template>
  <div class="toplists-container">
    <div class="toplists-header">
      <div class="tabs-container">
        <div :class="['tab', currentTab === 'official' ? 'active' : '']" @click="switchTab('official')">官方榜</div>
        <div :class="['tab', currentTab === 'selection' ? 'active' : '']" @click="switchTab('selection')">精选榜</div>
      </div>
    </div>

    <!-- 官方榜 -->
    <div v-if="currentTab === 'official'" class="rankings-container official-rankings">
      <div class="ranking-card" v-for="(rank, index) in officialRankings" :key="index" @click="goToRankingDetail(rank.id)">
        <div class="ranking-header" :style="{ backgroundColor: rank.color }">{{ rank.name }}</div>
        <div class="ranking-content">
          <ul class="song-list">
            <li v-for="(song, songIndex) in rank.songs" :key="songIndex" class="song-item">
              <div class="rank-number">{{ songIndex + 1 }}</div>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artists.map(artist => artist.name).join(' / ') }}</div>
              </div>
              <div class="play-count">{{ formatPlayCount(song.playCount) }}</div>
            </li>
          </ul>
          <div class="ranking-footer">
            <span class="update-time">更新时间: {{ rank.updateTime }}</span>
            <span class="more-btn">查看更多</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 精选榜 -->
    <div v-else-if="currentTab === 'selection'" class="rankings-container selection-rankings">
      <div class="ranking-card" v-for="(rank, index) in selectionRankings" :key="index" @click="goToRankingDetail(rank.id)">
        <div class="ranking-header" :style="{ backgroundColor: rank.color }">{{ rank.name }}</div>
        <div class="ranking-content">
          <div class="ranking-cover">
            <img :src="rank.coverImgUrl + '?param=200y200'" alt="{{ rank.name }}" class="cover-img" />
          </div>
          <ul class="song-list">
            <li v-for="(song, songIndex) in rank.songs.slice(0, 3)" :key="songIndex" class="song-item">
              <div class="rank-number">{{ songIndex + 1 }}</div>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artists.map(artist => artist.name).join(' / ') }}</div>
              </div>
            </li>
          </ul>
          <div class="ranking-footer">
            <span class="update-time">更新时间: {{ rank.updateTime }}</span>
            <span class="more-btn">查看更多</span>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTopListAPI } from '../../api/index'

// 状态定义
const router = useRouter()
const currentTab = ref('official')
const officialRankings = ref([])
const selectionRankings = ref([])
const loading = ref(true)

// 初始化API
const { getTopList, getTopListDetail } = useTopListAPI()

/**
 * 切换标签页
 * @param {string} tab - 标签页名称
 */
const switchTab = (tab) => {
  currentTab.value = tab
}

/**
 * 获取排行榜数据
 */
const fetchRankings = async () => {
  try {
    loading.value = true

    // 获取排行榜列表
    const topListResponse = await getTopList()
    const allRankings = topListResponse.list || []

    // 从API获取的所有榜单中筛选出主要榜单和精选榜单
    const mainRankIds = [3778678, 2884035, 3779629, 19723756]; // 热歌榜、原创榜、新歌榜、飙升榜ID
    
    // 官方榜（主要榜单）
    officialRankings.value = allRankings
      .filter(rank => mainRankIds.includes(rank.id))
      .map(rank => ({
        id: rank.id,
        name: rank.name,
        color: getRankColor(rank.id),
        coverImgUrl: rank.coverImgUrl || '',
        songs: [],
        updateTime: ''
      }));
    
    // 精选榜（其他所有榜单）
    selectionRankings.value = allRankings
      .filter(rank => !mainRankIds.includes(rank.id))
      .map(rank => ({
        id: rank.id,
        name: rank.name,
        color: getRandomColor(),
        coverImgUrl: rank.coverImgUrl || '',
        songs: [],
        updateTime: ''
      }));
    
    // 为榜单设置颜色
    function getRankColor(id) {
      const colorMap = {
        19723756: '#9c27b0', // 飙升榜
        3779629: '#e91e63',  // 新歌榜
        2884035: '#4caf50',  // 原创榜
        3778678: '#ff5722'   // 热歌榜
      };
      return colorMap[id] || '#2196f3';
    }
    
    // 生成随机颜色（用于精选榜）
    function getRandomColor() {
      const colors = ['#2196f3', '#00bcd4', '#009688', '#795548', '#607d8b', '#9e9e9e'];
      return colors[Math.floor(Math.random() * colors.length)];
    }



    // 为官方榜和精选榜获取详细歌曲数据
    for (const rank of [...officialRankings.value, ...selectionRankings.value]) {
      try {
        const detailResponse = await getTopListDetail(rank.id)
        if (detailResponse && detailResponse.playlist && detailResponse.playlist.tracks) {
          rank.songs = detailResponse.playlist.tracks.slice(0, 5).map(track => ({
            id: track.id,
            name: track.name,
            artists: track.ar || [],
            playCount: track.playCount || 0
          }))
          // 格式化更新时间
          const updateTime = new Date(detailResponse.playlist.updateTime)
          rank.updateTime = `${updateTime.getFullYear()}-${(updateTime.getMonth() + 1).toString().padStart(2, '0')}-${updateTime.getDate().toString().padStart(2, '0')}`
        }
      } catch (error) {
        console.error(`Failed to fetch detail for ranking ${rank.name} (${rank.id}):`, error)
        // 设置默认空数据，避免页面显示错误
        rank.songs = []
        rank.updateTime = '未知'
      }
    }
  } catch (error) {
    console.error('Failed to fetch rankings:', error)
  } finally {
    loading.value = false
  }
}

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
 * 前往排行榜详情页
 * @param {number} id - 排行榜ID
 */
const goToRankingDetail = (id) => {
  router.push(`/toplist/${id}`)
}

// 生命周期钩子
onMounted(() => {
  fetchRankings()
})
</script>

<style scoped>
/* 排行榜容器样式 */
.toplists-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 排行榜头部样式 */
.toplists-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.toplists-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* 标签页样式 */
.tabs-container {
  display: flex;
  gap: 20px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.tab.active {
  background-color: var(--primary-color);
  color: white;
}

/* 排行榜内容容器 */
.rankings-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 排行榜卡片样式 */
.ranking-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: white;
}

.ranking-card:hover {
  transform: translateY(-5px);
}

/* 排行榜头部 */
.ranking-header {
  padding: 12px 15px;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

/* 排行榜内容 */
.ranking-content {
  padding: 15px;
}

/* 排行榜封面 */
.ranking-cover {
  width: 100%;
  height: 180px;
  margin-bottom: 15px;
  border-radius: 6px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ranking-card:hover .cover-img {
  transform: scale(1.05);
}

/* 歌曲列表样式 */
.song-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.song-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #999;
  margin-right: 10px;
}

.song-info {
  flex: 1;
  overflow: hidden;
}

.song-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-count {
  font-size: 12px;
  color: #999;
}

/* 排行榜底部 */
.ranking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.more-btn {
  color: var(--primary-color);
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .rankings-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .toplists-container {
    padding: 15px;
  }

  .toplists-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .official-rankings {
    grid-template-columns: 1fr;
  }

  .selection-rankings {
    grid-template-columns: repeat(3, 1fr);
  }

  .genre-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .tabs-container {
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
    width: 100%;
  }

  .genre-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>