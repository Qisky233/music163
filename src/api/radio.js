import request from '@/utils/request'

/**
 * 电台相关API
 */
export const useRadioAPI = () => {
  /**
   * 获取推荐电台
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getRecommendRadios = (limit = 6) => {
    return request.get('/dj/recommend', { params: { limit } })
  }

  /**
   * 获取热门电台
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getHotRadios = (limit = 5) => {
    return request.get('/dj/hot', { params: { limit } })
  }

  /**
   * 获取最新电台
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getNewRadios = (limit = 4) => {
    return request.get('/dj/new', { params: { limit } })
  }

  /**
   * 获取电台分类
   * @returns {Promise}
   */
  const getRadioCategories = () => {
    return request.get('/dj/catelist')
  }

  /**
   * 获取推荐DJ
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getRecommendDJs = (limit = 4) => {
    return request.get('/dj/recommend/dj', { params: { limit } })
  }

  return {
    getRecommendRadios,
    getHotRadios,
    getNewRadios,
    getRadioCategories,
    getRecommendDJs
  }
}