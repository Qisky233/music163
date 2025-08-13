import request from '@/utils/request'

/**
 * 专辑相关API
 */
export const useAlbumAPI = () => {
  /**
   * 获取专辑详情
   * @param {number} id - 专辑ID
   * @returns {Promise}
   */
  const getAlbumDetail = (id) => {
    return request.get('/album', { params: { id } })
  }

  /**
   * 获取新碟上架列表
   * @param {string} area - 地区类型 (ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本)
   * @param {string} type - 类型 (new:全部 hot:热门)
   * @param {number} year - 年份
   * @param {number} month - 月份
   * @param {number} offset - 偏移量
   * @param {number} limit - 数量
   * @returns {Promise}
   */
  const getTopAlbums = (area = 'ALL', type = 'new', year = new Date().getFullYear(), month = new Date().getMonth() + 1, offset = 0, limit = 30) => {
    return request.get('/top/album', {
      params: {
        area,
        type,
        year,
        month,
        offset,
        limit
      }
    })
  }

  return {
    getAlbumDetail,
    getTopAlbums
  }
}