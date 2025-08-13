import request from '@/utils/request'

/**
 * 轮播图相关API
 */
export const useBannerAPI = () => {
  /**
   * 获取轮播图
   * @param {number} type - 资源类型 (0: pc, 1: android, 2: iphone, 3: ipad)
   * @returns {Promise}
   */
  const getBanners = (type = 0) => {
    return request.get('/banner', { params: { type } })
  }

  return {
    getBanners
  }
}