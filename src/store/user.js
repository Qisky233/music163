import { defineStore } from 'pinia'

/**
 * 用户状态管理模块
 * 负责管理用户登录状态、个人信息等
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false, // 用户登录状态
    userInfo: null,    // 用户信息
    token: null,       // 用户令牌
    expires: null,      // 令牌过期时间
  }),

  getters: {
    /**
     * 获取用户头像URL
     * @returns {string|null} 用户头像URL或null
     */
    avatarUrl: (state) => state.userInfo?.avatarUrl || null,

    /**
     * 获取用户昵称
     * @returns {string|null} 用户昵称或null
     */
    nickname: (state) => state.userInfo?.nickname || null
  },

  actions: {
    /**
     * 设置用户登录状态和信息
     * @param {Object} data - 包含用户信息和令牌的数据
     * @param {Object} data.userInfo - 用户信息对象
     * @param {string} data.token - 用户令牌
     * @param {number} data.expires - 令牌过期时间戳
     */
    setLoginStatus(data) {
      this.isLoggedIn = true
      this.userInfo = data.userInfo
      this.token = data.token
      this.expires = data.expires
      
      // 持久化存储到本地
      localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
      localStorage.setItem('token', data.token)
      localStorage.setItem('expires', data.expires)
    },

    /**
     * 退出登录
     * 清除用户状态和本地存储
     */
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      this.token = null
      this.expires = null

      // 清除本地存储
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      localStorage.removeItem('expires')
    },

    /**
     * 检查令牌是否过期
     * @returns {boolean} 令牌是否已过期
     */
    isTokenExpired() {
      if (!this.expires) return true
      return Date.now() > this.expires
    },

    /**
     * 从本地存储恢复用户状态
     * 在应用初始化时调用
     */
    restoreState() {
      const userInfo = localStorage.getItem('userInfo')
      const token = localStorage.getItem('token')
      const expires = localStorage.getItem('expires')

      if (userInfo && token && expires) {
        try {
          this.userInfo = JSON.parse(userInfo)
          this.token = token
          this.expires = parseInt(expires)
          this.isLoggedIn = !this.isTokenExpired()

          // 如果令牌已过期，自动刷新
          if (this.isTokenExpired() && this.isLoggedIn) {
            this.refreshToken()
          }
        } catch (error) {
          console.error('Failed to restore user state:', error)
          this.logout()
        }
      }
    },

    /**
     * 刷新令牌
     * 当令牌过期时调用
     */
    async refreshToken() {
      try {
        // 这里需要实现调用API刷新令牌的逻辑
        // const response = await axios.post('/api/refreshToken', { token: this.token })
        // 假设刷新成功后更新令牌和过期时间
        // this.token = response.data.token
        // this.expires = response.data.expires
        // localStorage.setItem('token', this.token)
        // localStorage.setItem('expires', this.expires)
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.logout()
      }
    }
  }
})