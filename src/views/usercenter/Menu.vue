<template>
  <div class="user-menu">
    <h2>用户中心</h2>
    <div class="menu-scroll-container">
      <div class="menu-container">
        <!-- 上半部分：3个1/3宽卡片 -->
        <div class="menu-row top-row">
          <router-link to="/profile/my-like" class="menu-btn">我的喜欢</router-link>
          <router-link to="/profile/my-collect" class="menu-btn">我的收藏</router-link>
          <router-link to="/profile/recently-play" class="menu-btn">最近播放</router-link>
        </div>
        
        <!-- 下半部分：2个1/2宽卡片 -->
        <div class="menu-row bottom-row">
          <router-link to="/profile/create-music-list" class="menu-btn">创建的歌单</router-link>
          <router-link to="/profile/collect-music-list" class="menu-btn">收藏的歌单</router-link>
        </div>
      </div>
    </div>
    <!-- 子路由视图 -->
    <router-view class="sub-router-view" />
  </div>
</template>

<style scoped>
.user-menu {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

h2 {
  color: #333;
  font-size: 20px;
  margin: 0 0 30px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #f2f2f2;
}

/* 滚动容器 - 移动端使用 */
.menu-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 25px;
  display: block;
  width: 100%;
}

/* 主容器：包含上下两部分卡片 */
.menu-container {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px; /* 容器内边距 */
  box-sizing: border-box;
  min-width: 600px; /* 确保PC端布局稳定 */
}

/* 行容器通用样式 */
.menu-row {
  display: flex;
  gap: 15px; /* 卡片间距 */
  width: 100%;
  box-sizing: border-box;
}

/* 上半部分：3个卡片占3/5高度 */
.top-row {
  height: 60%; /* 3/5高度 */
  margin-bottom: 15px; /* 上下部分间距 */
}

/* 下半部分：2个卡片占2/5高度 */
.bottom-row {
  height: 40%; /* 2/5高度 */
}

/* 卡片基础样式 */
.menu-btn {
  background-color: white;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  box-sizing: border-box;
}

/* 上半部分卡片：各占1/3宽度 */
.top-row .menu-btn {
  width: calc(100% / 3);
  height: 100%;
}

/* 下半部分卡片：各占1/2宽度 */
.bottom-row .menu-btn {
  width: 50%;
  height: 100%;
}

/* 激活状态 */
.menu-btn.router-link-exact-active {
  background-color: #f5f0ff;
  color: #722ed1;
  border-color: #e9d5ff;
  box-shadow: 0 2px 8px rgba(114, 46, 209, 0.15);
}

/* 悬停效果 */
.menu-btn:not(.router-link-exact-active):hover {
  border-color: #ddd;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* 子路由视图容器 */
.sub-router-view {
  width: 100%;
  min-height: 300px;
  padding: 15px;
  box-sizing: border-box;
}

/* 移动端样式调整 */
@media (max-width: 768px) {
  .user-menu {
    padding: 15px;
    margin-top: var(--header-height);
  }
  
  .menu-container {
    padding: 15px;
    min-width: auto;
    height: auto; /* 移动端取消固定高度 */
  }
  
  .menu-row {
    flex-direction: column;
    gap: 12px;
    height: auto; /* 移动端行高自适应 */
  }
  
  .top-row, .bottom-row {
    margin-bottom: 12px;
  }
  
  .top-row .menu-btn, .bottom-row .menu-btn {
    width: 100%;
    height: 80px; /* 移动端固定卡片高度 */
  }
  
  .menu-btn {
    font-size: 15px;
  }
}

/* PC端样式细化 */
@media (min-width: 769px) {
  .menu-scroll-container {
    overflow: visible;
  }
  
  .menu-container {
    height: 400px; /* 固定容器总高度，便于比例分配 */
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .menu-btn {
    font-size: 17px;
  }
}
</style>