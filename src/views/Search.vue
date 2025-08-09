<template>
    <div class="search-container">
      <!-- 导航栏 -->
      <Navbar />
  
      <!-- 主内容区 -->
      <main class="main-content">
        <div class="search-result-container">
          <h1 class="search-title">搜索结果</h1>
          <div class="keyword-display">
            <!-- 显示从路由参数中获取的搜索关键词 -->
            <p>搜索关键词：<span class="keyword">{{ keyword }}</span></p>
          </div>
        </div>
      </main>
  
      <!-- 底部播放条 -->
      <PlayerBar />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import Navbar from '../components/Navbar.vue'
  import PlayerBar from '../components/PlayerBar.vue'
  
  // 从路由参数中获取搜索关键词
  const route = useRoute()
  const keyword = ref('')
  
  // 初始化时解析路由参数
  onMounted(() => {
    keyword.value = route.query.keyword || '无关键词'
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
    padding: 40px;
    box-shadow: var(--shadow);
    text-align: center;
    animation: fadeIn 0.5s ease;
  }
  
  /* 搜索标题 */
  .search-title {
    font-size: 24px;
    color: var(--text-color);
    margin-bottom: 20px;
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
    font-size: 18px;
    color: var(--text-secondary);
  }
  
  .keyword {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  /* 动画效果 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .search-result-container {
      padding: 20px;
    }
  
    .search-title {
      font-size: 20px;
    }
  
    .keyword-display {
      font-size: 16px;
    }
  }
  </style>