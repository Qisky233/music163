<template>
  <div class="artists-container">

    <!-- 分类导航 -->
    <div class="artists-filter">
      <div class="filter-group">
        <span class="filter-title">字母索引:</span>
        <div class="filter-items">
          <button v-for="item in initials" :key="item.value" :class="{active: currentInitial === item.value}" @click="currentInitial = item.value">{{item.label}}</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-title">歌手类型:</span>
        <div class="filter-items">
          <button v-for="item in types" :key="item.value" :class="{active: currentType === item.value}" @click="currentType = item.value">{{item.label}}</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-title">所属地区:</span>
        <div class="filter-items">
          <button v-for="item in areas" :key="item.value" :class="{active: currentArea === item.value}" @click="currentArea = item.value">{{item.label}}</button>
        </div>
      </div>
    </div>

    <!-- 歌手列表 -->
    <div class="artists-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="artists.length === 0" class="empty">暂无歌手数据</div>
      <ul class="artist-cards">
        <li v-for="artist in artists" :key="artist.id" class="artist-card" @click="navigateToArtistDetail(artist.id)">
          <div class="artist-avatar">
            <img ref="lazyImages" :data-src="artist.picUrl" :src="'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg?param=300y300'" alt="{{artist.name}}" />
          </div>
          <div class="artist-info">
            <h3 class="artist-name">{{artist.name}}</h3>
            <p class="artist-songs">{{artist.musicSize}}首歌曲</p>
          </div>
          <div class="artist-arrow">→</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useArtistAPI } from '@/api/artist';
const { fetchArtists } = useArtistAPI();
import { message } from 'ant-design-vue';

// 组件状态
const artists = ref([]);
const loading = ref(false);
const lazyImages = ref([]); // 用于存储懒加载图片的引用
let observer = null;


const currentInitial = ref('-1'); // -1:热门, 0:#, 'a'-'z':字母
const currentType = ref('-1'); // -1:全部, 1:男歌手, 2:女歌手, 3:乐队
const currentArea = ref('-1'); // -1:全部, 7:华语, 96:欧美, 8:日本, 16:韩国, 0:其他
const offset = ref(0);
const limit = 50; // 只显示前50个歌手
const initials = [
  { label: '热门', value: '-1' },
  { label: '#', value: '0' },
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
  { label: 'D', value: 'd' },
  { label: 'E', value: 'e' },
  { label: 'F', value: 'f' },
  { label: 'G', value: 'g' },
  { label: 'H', value: 'h' },
  { label: 'I', value: 'i' },
  { label: 'J', value: 'j' },
  { label: 'K', value: 'k' },
  { label: 'L', value: 'l' },
  { label: 'M', value: 'm' },
  { label: 'N', value: 'n' },
  { label: 'O', value: 'o' },
  { label: 'P', value: 'p' },
  { label: 'Q', value: 'q' },
  { label: 'R', value: 'r' },
  { label: 'S', value: 's' },
  { label: 'T', value: 't' },
  { label: 'U', value: 'u' },
  { label: 'V', value: 'v' },
  { label: 'W', value: 'w' },
  { label: 'X', value: 'x' },
  { label: 'Y', value: 'y' },
  { label: 'Z', value: 'z' }
];
const types = [
  { label: '全部', value: '-1' },
  { label: '男歌手', value: '1' },
  { label: '女歌手', value: '2' },
  { label: '乐队', value: '3' }
];
const areas = [
  { label: '全部', value: '-1' },
  { label: '华语', value: '7' },
  { label: '欧美', value: '96' },
  { label: '日本', value: '8' },
  { label: '韩国', value: '16' },
  { label: '其他', value: '0' }
];
const router = useRouter();

/**
 * 页面加载时初始化数据
 */
onMounted(() => {
  fetchArtistsData();
  // 初始化图片懒加载
  nextTick(() => {
    initLazyLoad();
  });
});

/**
 * 初始化图片懒加载
 */
const initLazyLoad = () => {
  // 检查浏览器是否支持IntersectionObserver
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
          }
          // 加载后不再观察
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '0px 0px 200px 0px' // 提前200px加载
    });

    // 观察所有图片
    if (lazyImages.value.length) {
      lazyImages.value.forEach(img => {
        observer.observe(img);
      });
    }
  } else {
    // 降级处理，直接加载所有图片
    loadAllImages();
  }
};

/**
 * 降级处理：加载所有图片
 */
const loadAllImages = () => {
  if (lazyImages.value.length) {
    lazyImages.value.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.setAttribute('src', src);
        img.removeAttribute('data-src');
      }
    });
  }
};

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  // 停止观察图片
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

/**
 * 获取歌手数据
 * 只加载前50个歌手，不进行分页加载
 */
const fetchArtistsData = async () => {
  // 如果已经在加载中，则不再请求
  if (loading.value) return;

  loading.value = true;
  try {
    const params = {
      initial: currentInitial.value,
      type: parseInt(currentType.value),
      area: parseInt(currentArea.value),
      limit: limit,
      offset: 0
    };
    const data = await fetchArtists(params);
    const newArtists = data.artists || [];

    // 最多只显示50个歌手
    artists.value = newArtists.slice(0, 50);
  } catch (error) {
    message.error('获取歌手数据失败');
    console.error('Failed to fetch artists:', error);
    artists.value = [];
  } finally {
    loading.value = false;
  }
};

// 不使用滚动加载，因此移除handleScroll函数

// 删除原来的handleSearch函数，已被watch替代

/**
 * 导航到歌手详情页
 * @param {number} id - 歌手ID
 */
const navigateToArtistDetail = (id) => {
  router.push({ path: `/artist/${id}` });
};

// 监听分类变化，重新获取数据
watch([currentInitial, currentType, currentArea], () => {
  fetchArtistsData();
});


</script>

<style scoped>
.artists-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.artists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 8px 16px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.artists-filter {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 10px;
}

.filter-title {
  display: inline-block;
  width: 60px;
  font-weight: bold;
}

.filter-items {
  display: inline-block;
  flex-wrap: wrap;
}

.filter-items button {
  margin: 0 8px 8px 0;
  padding: 4px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-items button:hover {
  background-color: #f0f0f0;
}

.filter-items button.active {
  background-color: #c20c0c;
  color: #fff;
  border-color: #c20c0c;
}

.artists-list {
  margin-top: 20px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.artist-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
}

.artist-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.artist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.artist-avatar {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.3s;
}

.artist-card:hover .artist-avatar img {
  transform: scale(1.05);
}

.artist-info {
  padding: 12px;
}

.artist-name {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: bold;
}

.artist-songs {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.artist-arrow {
  position: absolute;
  bottom: 12px;
  right: 12px;
  color: #999;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .artist-cards {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .artists-container {
    padding: 15px;
  }

  .artists-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
    margin-top: 10px;
  }

  .filter-title {
    display: block;
    margin-bottom: 8px;
  }

  .artist-cards {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .artist-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .artist-avatar {
    height: 120px;
  }
}
</style>