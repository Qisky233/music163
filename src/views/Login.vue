<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <h1 class="logo-text">YPlayer</h1>
        <p class="slogan">网易云音乐网页播放器</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="phone" class="form-label">手机号</label>
          <input
            type="tel"
            id="phone"
            v-model="phone"
            class="form-input"
            placeholder="请输入手机号"
            required
            maxlength="11"
          />
        </div>

        <div class="form-group">
          <label for="captcha" class="form-label">验证码</label>
          <div class="captcha-container">
            <input
              type="text"
              id="captcha"
              v-model="captcha"
              class="form-input captcha-input"
              placeholder="请输入验证码"
              required
              maxlength="6"
            />
            <button
              type="button"
              class="send-code-btn"
              :disabled="isSendingCode || !isPhoneValid"
              @click="sendCode"
            >
              {{ isSendingCode ? `${countDown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button type="submit" class="login-btn" :disabled="!isFormValid">登录</button>
      </form>

      <div class="other-login">
        <p>其他登录方式</p>
        <div class="social-icons">
          <span class="icon wechat"></span>
          <span class="icon qq"></span>
          <span class="icon weibo"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api'
import { useUserStore } from '../store/user'
import { message } from 'ant-design-vue'

// 状态定义
const router = useRouter()
const userStore = useUserStore()
const phone = ref('')
const captcha = ref('')
const isSendingCode = ref(false)
const countDown = ref(60)
const timer = ref(null)

// 计算属性
const isPhoneValid = computed(() => {
  // 简单的手机号验证
  return /^1[3-9]\d{9}$/.test(phone.value)
})

const isFormValid = computed(() => {
  return isPhoneValid.value && captcha.value.length === 6
})

// 方法定义
/**
 * 发送验证码
 */
const sendCode = async () => {
  if (!isPhoneValid.value) {
    message.error('请输入有效的手机号')
    return
  }

  try {
    isSendingCode.value = true
    await authAPI.sendCode(phone.value)
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
    console.error('Failed to send code:', error)
    message.error('验证码发送失败，请重试')
    isSendingCode.value = false
  }
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!isFormValid.value) return

  try {
    const response = await authAPI.login(phone.value, captcha.value)
    if (response && response.code === 200) {
      // 登录成功
      const userInfo = response.profile
      const token = response.token
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天有效期

      // 设置登录状态
      userStore.setLoginStatus({
        userInfo,
        token,
        expires
      })

      message.success('登录成功')

      // 跳转到之前的页面或首页
      const redirect = router.currentRoute.value.query.redirect
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/')
      }
    } else {
      message.error('登录失败，请检查手机号和验证码')
    }
  } catch (error) {
    console.error('Failed to login:', error)
    message.error('登录失败，请重试')
  }
}

// 生命周期钩子
onUnmounted(() => {
  // 清除定时器
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
/* 登录容器样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 登录卡片样式 */
.login-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }
}
</style>