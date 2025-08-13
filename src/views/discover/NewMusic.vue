<template>
  <div class="new-music-container">

    <!-- 选项卡 -->
    <div class="tabs">
      <button :class="{active: activeTab === 'songs'}" @click="activeTab = 'songs'">新歌速递</button>
      <button :class="{active: activeTab === 'albums'}" @click="activeTab = 'albums'">新碟上架</button>
    </div>

    <!-- 地区筛选 -->
    <div v-if="activeTab === 'songs'" class="filter-container">
      <span class="filter-title">地区:</span>
      <div class="filter-options">
        <button :class="{active: currentSongType === 0}" @click="currentSongType = 0">全部</button>
        <button :class="{active: currentSongType === 7}" @click="currentSongType = 7">华语</button>
        <button :class="{active: currentSongType === 96}" @click="currentSongType = 96">欧美</button>
        <button :class="{active: currentSongType === 8}" @click="currentSongType = 8">日本</button>
        <button :class="{active: currentSongType === 16}" @click="currentSongType = 16">韩国</button>
      </div>
    </div>

    <div v-else class="filter-container">
      <span class="filter-title">地区:</span>
      <div class="filter-options">
        <button :class="{active: currentAlbumArea === 'ALL'}" @click="currentAlbumArea = 'ALL'">全部</button>
        <button :class="{active: currentAlbumArea === 'ZH'}" @click="currentAlbumArea = 'ZH'">华语</button>
        <button :class="{active: currentAlbumArea === 'EA'}" @click="currentAlbumArea = 'EA'">欧美</button>
        <button :class="{active: currentAlbumArea === 'JP'}" @click="currentAlbumArea = 'JP'">日本</button>
        <button :class="{active: currentAlbumArea === 'KR'}" @click="currentAlbumArea = 'KR'">韩国</button>
      </div>

      <span class="filter-title">类型:</span>
      <div class="filter-options">
        <button :class="{active: currentAlbumType === 'new'}" @click="currentAlbumType = 'new'">全部</button>
        <button :class="{active: currentAlbumType === 'hot'}" @click="currentAlbumType = 'hot'">热门</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 新歌列表 -->
    <div v-else-if="activeTab === 'songs'" class="song-list">
      <ul>
        <li v-for="(song, index) in songs" :key="song.id" class="song-item">
          <span class="rank">{{index + 1}}</span>
          <div class="song-info">
            <h3 class="song-name">{{song.name}}</h3>
            <p class="song-artist">{{song.ar?.map(artist => artist.name).join('/') || '未知歌手'}}</p>
          </div>
          <button class="play-btn" @click="playSong(song.id)">播放</button>
        </li>
      </ul>
    </div>

    <!-- 专辑列表 -->
    <div v-else class="album-list">
      <div v-for="album in albums" :key="album.id" class="album-card">
        <img :src="album.picUrl" alt="{{album.name}}" class="album-cover">
        <div class="album-info">
          <h3 class="album-name">{{album.name}}</h3>
          <p class="album-artist">{{album.artist.name}}</p>
          <p class="album-date">{{formatDate(album.publishTime)}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSongAPI, useAlbumAPI } from '../../api/index';
import { usePlayerStore } from '@/store/player';
import { format } from 'date-fns';

// 组件状态
const activeTab = ref('songs'); // songs: 新歌速递, albums: 新碟上架
const loading = ref(false);
const songs = ref([]);
const albums = ref([]);
const currentSongType = ref(0); // 0:全部,7:华语,96:欧美,8:日本,16:韩国
const currentAlbumArea = ref('ALL'); // ALL:全部,ZH:华语,EA:欧美,JP:日本,KR:韩国
const currentAlbumType = ref('new'); // new:全部, hot:热门
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);

// API调用
const { getTopSongs } = useSongAPI();
const { getTopAlbums } = useAlbumAPI();
const playerStore = usePlayerStore();

/**
 * 播放歌曲
 * @param {number} id - 歌曲ID
 */
const playSong = (id) => {
  playerStore.playSong(id);
};

/**
 * 加载新歌速递数据
 */
const loadSongsData = async () => {
  loading.value = true;
  try {
    const data = await getTopSongs(currentSongType.value);
    songs.value = data.data || [];
  } catch (error) {
    console.error('Failed to load songs:', error);
    songs.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * 加载新碟上架数据
 */
const loadAlbumsData = async () => {
  loading.value = true;
  try {
    const data = await getTopAlbums(
      currentAlbumArea.value,
      currentAlbumType.value,
      currentYear.value,
      currentMonth.value
    );
    albums.value = data.monthData || [];
  } catch (error) {
    console.error('Failed to load albums:', error);
    albums.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化日期
 * @param {number} date - 时间戳
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

// 监听选项卡切换
watch(activeTab, (newTab) => {
  if (newTab === 'songs') {
    loadSongsData();
  } else {
    loadAlbumsData();
  }
});

// 监听新歌速递地区变化
watch(currentSongType, loadSongsData);

// 监听新碟上架筛选条件变化
watch([currentAlbumArea, currentAlbumType], loadAlbumsData);

// 页面加载时初始化数据
onMounted(() => {
  loadSongsData();
});
</script>

<style scoped>
.new-music-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #c20c0c;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #c20c0c;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-title {
  display: inline-block;
  margin-right: 10px;
  font-weight: bold;
  align-self: center;
}

.filter-options {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-options button {
  padding: 4px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filter-options button.active {
  background-color: #c20c0c;
  color: #fff;
  border-color: #c20c0c;
}

.loading {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.song-list {
  margin-top: 20px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.rank {
  width: 30px;
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-right: 10px;
}

.song-info {
  flex: 1;
}

.song-name {
  margin: 0;
  font-size: 16px;
  cursor: pointer;
}

.song-name:hover {
  color: #c20c0c;
}

.song-artist {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #999;
}

.play-btn {
  padding: 6px 12px;
  background-color: #c20c0c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.album-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.album-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.album-info {
  padding: 12px;
}

.album-name {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: bold;
}

.album-artist {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #999;
}

.album-date {
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .new-music-container {
    padding: 15px;
  }

  .filter-container {
    flex-direction: column;
    gap: 10px;
  }

  .filter-options {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .album-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .album-cover {
    height: 140px;
  }
}

@media (max-width: 480px) {
  .song-name {
    font-size: 14px;
  }

  .song-artist {
    font-size: 12px;
  }

  .play-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .album-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .album-cover {
    height: 120px;
  }
}
</style>