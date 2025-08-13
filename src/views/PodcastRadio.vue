<template>
  <div class="podcast-container">
    <!-- 导航栏 -->
    <Navbar />

    <div class="main-content">
      播客电台
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.podcast-container {
  min-height: 100vh;
  padding-bottom: var(--player-height); /* 播放条高度 */
  box-sizing: border-box;
  background-color: var(--light-gray);
  overflow-x: hidden;
}

/* 主内容区样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: var(--player-height);
  padding: 20px;
}
</style>