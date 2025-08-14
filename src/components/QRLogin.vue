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
          <div class="cookie-input-container" v-if="!loginSuccess">
            <input
              type="text"
              v-model="cookieInput"
              class="cookie-input"
              placeholder="请输入Cookie"
            >
            <button @click="handleCookieLogin" class="set-cookie-btn">
              使用Cookie登录
            </button>
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
// 导入必要的依赖
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { message } from 'ant-design-vue'
import { useQrLoginAPI } from '../api/qrLogin';

// 状态定义
const qrCodeSrc = ref('');
const loading = ref(false);
const loginSuccess = ref(false);
const pollTimer = ref(null);
const currentKey = ref('');
const cookieInput = ref(''); // 输入框绑定的Cookie值
const userStore = useUserStore()
const router = useRouter()
const { getQRKey, generateQRCode, checkQRStatus, getUserInfoByCookie } = useQrLoginAPI();
const emit = defineEmits(['show-phone-login', 'close-modal'])
// 处理切换到手机号登录
const handlePhoneLogin = () => {
  // 发射事件通知父组件切换登录方式
  emit('show-phone-login')
  // 如果需要可以同时关闭当前登录弹窗
  // emit('close-modal')
}
// 处理手动输入Cookie登录
const handleCookieLogin = () => {
  if (cookieInput.value.trim()) {
    // 清除轮询定时器
    if (pollTimer.value) {
      clearInterval(pollTimer.value);
      pollTimer.value = null;
    }
    
    // 直接存储Cookie到userStore的token
    userStore.token = cookieInput.value.trim()
    console.log('手动输入的Cookie存储到token:', userStore.token)
    
    // 触发登录成功处理
    handleLoginSuccess()
  } else {
    message.warning('请输入有效的Cookie')
  }
}

// 生成新的二维码
// generateNewQR方法中直接使用返回的base64
const generateNewQR = async () => {
  try {
    loading.value = true;
    qrCodeSrc.value = '';
    
    // 获取key
    const key = await getQRKey();
    // 直接获取接口返回的完整base64
    const base64WithPrefix = await generateQRCode(key);
    
    // 直接赋值（无需任何转换）
    qrCodeSrc.value = base64WithPrefix;
    
    // 开始轮询
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
  console.error('二维码图片加载失败');
  qrCodeSrc.value = '';
};

// 轮询扫码状态（修正定时器存储和状态处理）
// 轮询扫码状态（仅检查同一key下的code变化）
const startPolling = (key) => {
  // 清除已有定时器，确保唯一
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
  }
  
  // 存储当前key对应的上一次状态码，用于检测变化
  let lastCode = null;

  pollTimer.value = setInterval(async () => {
    // 只处理当前key的轮询，避免处理已切换的二维码
    if (currentKey.value !== key) {
      clearInterval(pollTimer.value);
      return;
    }

    try {
      const status = await checkQRStatus(key);
      
      // 验证返回格式
      if (typeof status !== 'object' || status.code === undefined) {
        throw new Error('二维码状态接口返回格式异常');
      }

      // 仅当状态码发生变化时才处理
      if (status.code !== lastCode) {
        lastCode = status.code; // 更新上次状态码

        if (status.code === 803) {
          clearInterval(pollTimer.value);
          console.log('登录成功，处理用户信息');
          handleLoginSuccess(status.cookie); // 传递cookie
        } else if (status.code === 800) {
          clearInterval(pollTimer.value);
          message.warn('二维码已过期，正在重新生成');
          generateNewQR();
        } else if (status.code === 801) {
          statusText.value = '请使用手机扫码登录';
        } else if (status.code === 802) {
          statusText.value = '已扫码，请在手机上确认';
        } else {
          // 处理其他未定义的状态码
          console.log('收到未定义的状态码:', status.code);
        }
      }
    } catch (error) {
      // 检查错误响应中是否包含合法code，如果有则不处理错误
      const hasValidCode = error.response?.data?.code !== undefined;
      if (hasValidCode) {
        const currentCode = error.response.data.code;
        // 错误响应中的code变化时才处理
        if (currentCode !== lastCode) {
          lastCode = currentCode;
          console.log('错误响应中包含新状态码:', currentCode);
          // 可根据需要添加错误响应中状态码的处理逻辑
        }
        return;
      }

      clearInterval(pollTimer.value);
      const errorInfo = {
        message: error.message || '未知错误',
        status: error.response?.status,
        data: error.response?.data,
        config: error.config?.url
      };
      console.error('轮询失败:', errorInfo);
      message.error(`轮询失败: ${errorInfo.message}`);
      
      // 3秒后重试生成二维码（仅当还是当前key时）
      setTimeout(() => {
        if (!loading.value && currentKey.value === key) {
          generateNewQR();
        }
      }, 3000);
    }
  }, 2000);
};
// 处理登录成功（使用qrLogin.js中的getUserInfoByCookie）
const handleLoginSuccess = async (cookie) => {
  loginSuccess.value = true;
  
  try {
    if (!userStore.token) {
      throw new Error('未获取到有效的Cookie')
    }

    // 打印Cookie到控制台
    console.log('登录使用的Cookie(token):', userStore.token)
    
    // 通知父组件关闭弹窗
    emit('login-success');
    
    // 获取用户信息
    const userInfoResponse = await getUserInfoByCookie();
    const userInfo = userInfoResponse.data;

    // 存储登录状态，直接使用token（已存储Cookie）
    userStore.setLoginStatus({
      userInfo,
      token: userStore.token,  // 直接使用已存储的token
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    message.success('登录成功');
    
    // 4. 跳转页面
    setTimeout(() => {
      emit('login-success');
      router.push(router.currentRoute.value.query.redirect || '/');
    }, 1500);
  } catch (error) {
    console.error('处理登录信息失败:', error);
    message.error('登录信息处理失败，请重新登录');
    setTimeout(generateNewQR, 2000);
  }
};

// 组件挂载时生成二维码（避免重复调用）
onMounted(() => {
  if (!qrCodeSrc.value) { // 仅在未生成时调用
    generateNewQR();
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
});
</script>
  
  <style scoped>
  /* 新增Cookie输入样式 */
.cookie-input-container {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding: 0 10px;
}

.cookie-input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.set-cookie-btn {
  padding: 0 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.set-cookie-btn:hover {
  background-color: #0f62d9;
}

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