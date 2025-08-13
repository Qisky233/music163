<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 顶部logo -->
      <div class="logo-wrapper">
        <div class="logo"></div>
      </div>

      <!-- 登录表单 -->
      <div class="form-wrapper">
        <div class="tab-container">
          <div class="tab active">手机号登录</div>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <!-- 手机号输入 -->
          <div class="input-group">
            <input
              type="tel"
              v-model="phone"
              class="form-input"
              placeholder="请输入手机号"
              maxlength="11"
              required
            >
          </div>

          <!-- 验证码输入 -->
          <div class="input-group">
            <input
              type="text"
              v-model="captcha"
              class="form-input"
              placeholder="请输入验证码"
              maxlength="6"
              required
            >
            <button 
              type="button"
              class="captcha-btn"
              :disabled="isSendingCode || !isPhoneValid"
              @click="sendCode"
            >
              {{ isSendingCode ? `${countDown}秒后重试` : '获取验证码' }}
            </button>
          </div>

          <!-- 登录按钮 -->
          <button 
            type="submit" 
            class="login-btn"
            :disabled="!isFormValid"
          >
            登录
          </button>
          
          <button 
            type="button" 
            class="qr-login-btn"
           @click="handleQRLogin" 
             >
           二维码登录
          </button>
        </form>
        <!-- 其他登录方式 -->
        <div class="other-login">
          <div class="divider">
            <span class="line"></span>
            <span class="text">其他登录方式</span>
            <span class="line"></span>
          </div>
          <div class="social-icons">
            <button class="icon-btn wechat" @click="loginWithWechat"></button>
            <button class="icon-btn qq" @click="loginWithQQ"></button>
            <button class="icon-btn weibo" @click="loginWithWeibo"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAPI } from '../api/index'
import { useUserStore } from '../store/user'
import { message } from 'ant-design-vue'

const router = useRouter()
const userStore = useUserStore()
const { sendCode, login } = useUserAPI()

// 状态定义
const phone = ref('')
const captcha = ref('')
const isSendingCode = ref(false)
const countDown = ref(60)
const timer = ref(null)
const showQRModal = ref(false)
const emit = defineEmits(['close-navbar-modal', 'show-qr-modal', 'show-phone-login'])

// 修改二维码登录处理方法
const handleQRLogin = () => {
  // 触发事件通知切换到二维码登录
  emit('show-qr-modal')
}
// 计算属性
const isPhoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const isFormValid = computed(() => {
  return isPhoneValid.value && captcha.value.length === 6
})

// 发送验证码
const sendCode = async () => {
  if (!isPhoneValid.value) {
    message.error('请输入有效的手机号')
    return
  }

  try {
    isSendingCode.value = true
    await sendCode(phone.value)
    message.success('验证码发送成功')

    // 倒计时
    countDown.value = 60
    timer.value = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer.value)
        isSendingCode.value = false
      }
    }, 1000)
  } catch (error) {
    console.error('验证码发送失败:', error)
    message.error('验证码发送失败，请重试')
    isSendingCode.value = false
  }
}

// 处理登录
const handleLogin = async () => {
  if (!isFormValid.value) return

  try {
    const response = await login(phone.value, captcha.value)
    if (response.code === 200) {
      // 登录成功处理
      userStore.setLoginStatus({
        userInfo: response.profile,
        token: response.token,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000
      })
      
      message.success('登录成功')
      router.push(router.currentRoute.value.query.redirect || '/')
    } else {
      message.error('登录失败，请检查验证码')
    }
  } catch (error) {
    console.error('登录失败:', error)
    message.error('登录失败，请重试')
  }
}

// 第三方登录方法
const loginWithWechat = () => message.info('微信登录功能即将上线')
const loginWithQQ = () => message.info('QQ登录功能即将上线')
const loginWithWeibo = () => message.info('微博登录功能即将上线')

// 清除定时器
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px);
    opacity: 0.8;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}
/* 基础容器样式 - 适合嵌入弹窗 */
.login-container {
  width: 100%;
  height: 100%;
}

.login-wrapper {
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

/* 表单样式 */
.form-wrapper {
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

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 15px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);
}

/* 验证码按钮 */
.captcha-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 26px;
  padding: 0 8px;
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  cursor: pointer;
}

.captcha-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 40px;
  margin-top: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: var(--primary-dark);
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 二维码登录按钮 */
.qr-login-btn {
  width: 100%;
  height: 40px;
  margin-top: 8px;
  background-color: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-login-btn:hover {
  background-color: rgba(0, 120, 255, 0.05);
}

/* 其他登录方式 */
.other-login {
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.text {
  padding: 0 10px;
  font-size: 12px;
  color: #999;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-size: 60%;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.wechat {
  background-color: #07C160;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik04LjUgMTMuNWMxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6bTcgMGMxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgMi45IDIgMiAyIDJ6bTQuNSAzYy0xLjEgMC0yIC45LTIgMnMuOSAyIDIgMiAyLS45IDItMi0uOS0yLTItMnptLTkgMGMtMS4xIDAtMiAuOS0yIDJzLjkgMiAyIDIgMi0uOSAyLTItLjktMi0yLTJ6bTQuNS0xM2M0LjEgMCA3LjUgMy40IDcuNSA3LjUgMCAxLjEuMiAyLjEuNiAzLjFsMS41LTEuNWMuMi0uMi41LS4zLjctLjMuMiAwIC41LjEuNy4zLjQuNC40IDEgMCAxLjRsLTQuNSA0LjVjLS40LjQtMSAuNC0xLjQgMC0uMi0uMi0uMy0uNS0uMy0uNyAwLS4yLjEtLjUuMy0uN2wxLjUtMS41Yy0xLS40LTIuMS0uNi0zLjEtLjYtMy4zIDAtNi0yLjctNi02czIuNy02IDYtNnoiLz48L3N2Zz4=');
}

.qq {
  background-color: #12B7F5;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAxMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptLTUgMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptMTAgMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptLTUgOWMtMy4zIDAtNi0yLjctNi02czIuNy02IDYtNiA2IDIuNyA2IDYtMi43IDYtNiA2em0wLTExYy0yLjggMC01IDIuMi01IDVzMi4yIDUgNSA1IDUtMi4yIDUtNS0yLjItNS01LTV6Ii8+PC9zdmc+');
}

.weibo {
  background-color: #E6162D;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAxMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptLTUgMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptMTAgMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTAtMmMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMSAxLS40IDEtMS0uNC0xLTEtMXptLTUgOWMtMy4zIDAtNi0yLjctNi02czIuNy02IDYtNiA2IDIuNyA2IDYtMi43IDYtNiA2em0wLTExYy0yLjggMC01IDIuMi01IDVzMi4yIDUgNSA1IDUtMi4yIDUtNS0yLjItNS01LTV6Ii8+PC9zdmc+');
}
</style>