<template>
  <div class="profile-container">
    <!-- 导航栏 -->
    <Navbar />

    <div class="main-content">
      用户中心
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.profile-container {
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