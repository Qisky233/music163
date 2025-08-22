import { defineStore } from 'pinia'

/**
 * 用户状态管理模块
 * 负责管理用户登录状态、个人信息等
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false, // 用户登录状态
    userInfo:null,    
    token: null,       // 用户令牌
    expires: null,      // 令牌过期时间
  }),

  // 其余代码保持不变...
  getters: {
    avatarUrl: (state) => state.userInfo.avatarUrl || null,
    nickname: (state) => state.userInfo.userName || null // 注意这里可能需要和接口返回的字段对应
  },

  actions: {
    setLoginStatus(data) {
      this.isLoggedIn = true
      // 合并用户信息，确保默认字段被正确赋值
      this.userInfo = {
        ...this.userInfo, // 保留默认值
        ...data.userInfo  // 覆盖接口返回的信息
      }
      this.token = data.token
      this.expires = data.expires
      
      // 持久化存储到本地
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      localStorage.setItem('token', data.token)
      localStorage.setItem('expires', data.expires)
    },

    restoreState() {
      const userInfo = localStorage.getItem('userInfo')
      const token = localStorage.getItem('token')
      const expires = localStorage.getItem('expires')

      if (userInfo && token && expires) {
        try {
          const parsedUserInfo = JSON.parse(userInfo)
          // 恢复时合并默认值
          this.userInfo = {
            ...this.state.userInfo,
            ...parsedUserInfo
          }
          this.token = token
          this.expires = parseInt(expires)
          this.isLoggedIn = !this.isTokenExpired()

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