<template>
  <div class="profile-container">
    <!-- 导航栏 -->
    <Navbar />

    <div class="main-content">
      <!-- 添加路由视图，用于显示子组件（包括菜单） -->
      <router-view />
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
/* UserProfile.vue 的样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  margin-top: var(--header-height); 
  /* 确保没有设置 overflow: hidden 或固定高度导致内容被截断 */
}
</style>