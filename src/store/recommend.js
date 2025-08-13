import { defineStore } from 'pinia'
import { useRecommendAPI } from '../api'

const recommendAPI = useRecommendAPI()

/**
 * 推荐模块状态管理
 * 负责管理推荐歌单、推荐歌手、推荐MV等数据
 */
export const useRecommendStore = defineStore('recommend', {
  state: () => ({
    // 推荐歌单
    personalizedPlaylists: [],
    // 独家放送
    privateContent: null,
    // 推荐MV
    recommendMV: [],
    // 加载状态
    loading: false
  }),

  getters: {
    /**
     * 获取推荐歌单列表
     * @returns {Array} 推荐歌单列表
     */
    getPersonalizedPlaylists: (state) => state.personalizedPlaylists,

    /**
     * 获取独家放送内容
     * @returns {Object|null} 独家放送内容
     */
    getPrivateContent: (state) => state.privateContent,

    /**
     * 获取推荐MV列表
     * @returns {Array} 推荐MV列表
     */
    getRecommendMV: (state) => state.recommendMV
  },

  actions: {
    /**
     * 获取推荐歌单
     * @param {number} limit - 返回数量
     */
    async fetchPersonalizedPlaylists(limit = 10) {
      try {
        this.loading = true
        const res = await recommendAPI.getPersonalizedPlaylists(limit)
        this.personalizedPlaylists = res.result || []
      } catch (error) {
        console.error('获取推荐歌单失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取独家放送
     */
    async fetchPrivateContent() {
      try {
        this.loading = true
        const res = await recommendAPI.getPrivateContent()
        this.privateContent = res.result || null
      } catch (error) {
        console.error('获取独家放送失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取推荐MV
     */
    async fetchRecommendMV() {
      try {
        this.loading = true
        const res = await recommendAPI.getRecommendMV()
        this.recommendMV = res.result || []
      } catch (error) {
        console.error('获取推荐MV失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新所有推荐数据
     */
    async refreshAllRecommendData() {
      try {
        this.loading = true
        // 并行请求所有推荐数据
        const [playlistsRes, privateContentRes, mvRes] = await Promise.all([
          recommendAPI.getPersonalizedPlaylists(),
          recommendAPI.getPrivateContent(),
          recommendAPI.getRecommendMV()
        ])

        this.personalizedPlaylists = playlistsRes.result || []
        this.privateContent = privateContentRes.result || null
        this.recommendMV = mvRes.result || []
      } catch (error) {
        console.error('刷新推荐数据失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
})