/**
 * 推荐相关API
 */
import request from './request'

export const useRecommendAPI = () => {
  /**
   * 获取推荐歌单
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getPersonalizedPlaylists = (limit = 10) => {
    return request.get('/personalized', { params: { limit } })
  }

  /**
   * 获取独家放送
   * @returns {Promise}
   */
  const getPrivateContent = () => {
    return request.get('/personalized/privatecontent')
  }

  /**
   * 获取推荐MV
   * @returns {Promise}
   */
  const getRecommendMV = () => {
    return request.get('/personalized/mv')
  }

  return {
    getPersonalizedPlaylists,
    getPrivateContent,
    getRecommendMV
  }
}