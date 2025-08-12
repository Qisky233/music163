<template>
    <div class="qr-login-container">
      <div class="qr-login-wrapper">
        <!-- 顶部logo -->
        <div class="logo-wrapper">
          <div class="logo"></div>
        </div>
  
        <div class="qr-content">
          <div class="tab-container">
            <div class="tab active">二维码登录</div>
          </div>
  
          <!-- 二维码显示区域 -->
          <div class="qr-login-container">
        <!-- 直接使用带前缀的Base64作为图片源 -->
            <img 
            v-if="qrCodeSrc" 
            :src="qrCodeSrc" 
            alt="登录二维码" 
            class="qr-code"
            @error="handleQrError"
            >
            <p v-else-if="loading">正在生成二维码...</p>
            <p v-else class="error-message">二维码加载失败，请点击重试</p>
            <button @click="generateNewQR" v-if="!loading" class="retry-btn">重试</button>
          </div>
          <!-- 登录成功提示 -->
          <div class="login-success" v-if="loginSuccess">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="#4CAF50">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <p class="success-text">登录成功，正在跳转...</p>
          </div>
  
          <!-- 切换到手机号登录 -->
          <button 
            type="button" 
            class="phone-login-btn"
            @click="handlePhoneLogin"
          >
            手机号登录
          </button>
        </div>
      </div>
    </div>
  </template>
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { message } from 'ant-design-vue'
import { qrLoginAPI } from '../api.js';

// 存储带完整前缀的Base64字符串（如 data:image/png;base64,xxxx）
const qrCodeSrc = ref('');
const loading = ref(false);
// 状态定义
const qrImage = ref('')
const statusText = ref('请使用手机扫码登录')
const loginSuccess = ref(false)
const pollTimer = ref(null) // 轮询定时器
const currentKey = ref('') // 当前二维码key
const emit = defineEmits(['show-phone-login', 'login-success'])

const userStore = useUserStore()
const router = useRouter()
// 生成新的二维码
const generateNewQR = async () => {
  try {
    loading.value = true;
    qrCodeSrc.value = '';
    
    // 获取key
    const key = await qrLoginAPI.getQRKey();
    // 获取带完整前缀的二维码数据
    const base64WithPrefix = await qrLoginAPI.generateQRCode(key);
    
    // 直接赋值（包含前缀，可直接作为img的src）
    qrCodeSrc.value = base64WithPrefix;
    
    // 开始轮询扫码状态（根据实际需求实现）
    startPolling(key);
  } catch (error) {
    console.error('生成二维码失败:', error);
    qrCodeSrc.value = '';
  } finally {
    loading.value = false;
  }
};

// 处理图片加载失败
const handleQrError = () => {
  console.error('二维码图片加载失败，可能是Base64数据无效');
  qrCodeSrc.value = '';
};

// 轮询扫码状态（示例）
const startPolling = (key) => {
  const timer = setInterval(async () => {
    try {
      const status = await qrLoginAPI.checkQRStatus(key);
      if (status.code === 803) {
        clearInterval(timer);
        console.log('登录成功，跳转页面');
        // 处理登录成功逻辑
      } else if (status.code === 800) {
        clearInterval(timer);
        console.log('二维码已过期，重新生成');
        generateNewQR(); // 自动重试
      }
    } catch (error) {
      clearInterval(timer);
      console.error('轮询失败:', error);
    }
  }, 2000);
};

// 初始化生成二维码
generateNewQR();


// 处理登录成功
const handleLoginSuccess = async (cookie) => {
  loginSuccess.value = true
  
  try {
    // 解析cookie中的用户信息
    const cookies = cookie.split(';').reduce((obj, item) => {
      const [key, value] = item.trim().split('=')
      if (key && value) obj[key] = value
      return obj
    }, {})

    // 从接口获取完整用户信息（使用cookie）
    const userInfo = await qrLoginAPI.getUserInfoByCookie(cookies)
    
    // 存储登录状态
    userStore.setLoginStatus({
      userInfo,
      token: cookies.MUSIC_U || cookies.__csrf,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    message.success('登录成功')
    
    // 延迟跳转
    setTimeout(() => {
      emit('login-success')
      router.push(router.currentRoute.value.query.redirect || '/')
    }, 1500)
  } catch (error) {
    console.error('处理登录信息失败:', error)
    message.error('登录信息处理失败，请重新登录')
    // 失败后重新生成二维码
    setTimeout(generateNewQR, 2000)
  }
}

// 组件挂载时生成二维码
onMounted(() => {
  generateNewQR()
})

// 组件卸载时清理
onUnmounted(() => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
  }
})
</script>
  
  <style scoped>
  .qr-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .qr-code {
    width: 240px;
    height: 240px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  
  .error-message {
    color: #ff4d4f;
    margin: 15px 0;
  }
  
  .retry-btn {
    padding: 8px 16px;
    background: #1677ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .retry-btn:hover {
    background: #0f62d9;
  }
  .qr-login-container {
    width: 100%;
    height: 100%;
  }
  
  .qr-login-wrapper {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
  }
  
  /* logo样式 */
  .logo-wrapper {
    padding: 20px 0 15px;
    text-align: center;
  }
  
  .logo {
    width: 120px;
    height: 40px;
    margin: 0 auto;
    background: url('https://s1.music.126.net/style/favicon.ico') no-repeat center;
    background-size: contain;
  }
  
  .qr-content {
    padding: 0 20px 20px;
  }
  
  .tab-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .tab {
    font-size: 16px;
    color: #666;
    padding: 6px 15px;
    cursor: pointer;
  }
  
  .tab.active {
    color: #333;
    font-weight: 600;
    border-bottom: 2px solid var(--primary-color);
  }
  
  /* 二维码区域 */
  .qr-code-area {
    text-align: center;
    padding: 15px 0;
  }
  
  .qr-image {
    width: 200px;
    height: 200px;
    margin: 0 auto 15px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  
  .qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .qr-tip {
    color: #666;
    font-size: 14px;
    margin: 10px 0;
  }
  
  /* 加载状态 */
  .loading {
    text-align: center;
    padding: 40px 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 登录成功 */
  .login-success {
    text-align: center;
    padding: 40px 0;
  }
  
  .success-text {
    margin-top: 15px;
    font-size: 16px;
    color: #333;
  }
  
  /* 手机号登录按钮 */
  .phone-login-btn {
    width: 100%;
    height: 40px;
    margin-top: 20px;
    background-color: white;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .phone-login-btn:hover {
    background-color: rgba(0, 120, 255, 0.05);
  }
  </style>