import request from '@/utils/request'

/**
 * 排行榜相关API
 */
export const useTopListAPI = () => {
  /**
   * 获取排行榜列表
   * @returns {Promise}
   */
  const getTopList = () => {
    return request.get('/toplist')
  }

  /**
   * 获取排行榜详情
   * @param {number} id - 排行榜ID
   * @returns {Promise}
   */
  const getTopListDetail = (id) => {
    return request.get('/playlist/detail', { params: { id } })
  }

  return {
    getTopList,
    getTopListDetail
  }
}