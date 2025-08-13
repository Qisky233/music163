import request from '@/utils/request'

/**
 * 歌单相关API
 */
export const usePlaylistAPI = () => {
  /**
   * 获取歌单详情
   * @param {number} id - 歌单ID
   * @returns {Promise}
   */
  const getPlaylistDetail = (id) => {
    return request.get('/playlist/detail', { params: { id } })
  }

  /**
   * 获取歌单歌曲列表
   * @param {number} id - 歌单ID
   * @param {number} limit - 返回数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  const getPlaylistTracks = (id, limit = 1000, offset = 0) => {
    return request.get('/playlist/track/all', { params: { id, limit, offset } })
  }

  /**
   * 获取推荐歌单
   * @param {number} limit - 返回数量
   * @returns {Promise}
   */
  const getRecommendPlaylists = (limit = 10) => {
    return request.get('/personalized', { params: { limit } })
  }

  return {
    getPlaylistDetail,
    getPlaylistTracks,
    getRecommendPlaylists
  }
}