<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>这是一个测试页面，用于验证Navbar组件是否能正常加载。</p>
    <Navbar />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 80px;
}
</style>