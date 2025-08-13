import request from '@/utils/request'

/**
 * 歌曲相关API
 */
export const useSongAPI = () => {
  /**
   * 获取歌曲URL
   * @param {number} id - 歌曲ID
   * @param {number} br - 音频质量 (999000: 无损, 320000: 320kbps, 128000: 128kbps)
   * @returns {Promise}
   */
  const getSongUrl = (id, br = 320000) => {
    return request.get('/song/url', { params: { id, br } })
  }

  /**
 * 获取歌曲详情
 * @param {string} ids - 歌曲ID，多个用逗号分隔
 * @returns {Promise}
 */
  const getSongDetail = (ids) => {
    return request.get('/song/detail', { params: { ids } })
  }

  /**
   * 获取歌词
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  const getLyric = (id) => {
    return request.get('/lyric', { params: { id } })
  }

  /**
   * 获取播放历史
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  const getPlayHistory = (limit = 100) => {
    return request.get('/user/record', { params: { limit, type: 0 } })
  }

  /**
   * 获取最新音乐
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  const getNewSongs = (limit = 10) => {
    return request.get('/personalized/newsong', { params: { limit } })
  }

  /**
   * 获取新歌速递
   * @param {number} type - 地区类型 (0:全部,7:华语,96:欧美,8:日本,16:韩国)
   * @returns {Promise}
   */
  const getTopSongs = (type = 0) => {
    return request.get('/top/song', { params: { type } })
  }

  /**
   * 检查歌曲是否已收藏
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  const checkFavorite = (id) => {
    return request.get('/like', { params: { id } })
  }

  /**
   * 添加歌曲到收藏
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  const addFavorite = (id) => {
    return request.get('/like', { params: { id, like: true } })
  }

  /**
   * 取消歌曲收藏
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  const cancelFavorite = (id) => {
    return request.get('/like', { params: { id, like: false } })
  }

  /**
   * 获取收藏的歌曲
   * @returns {Promise}
   */
  const getFavoriteSongs = () => {
    return request.get('/likelist')
  }

  return {
    getSongUrl,
    getSongDetail,
    getLyric,
    getPlayHistory,
    getNewSongs,
    getTopSongs,
    checkFavorite,
    addFavorite,
    cancelFavorite,
    getFavoriteSongs
  }
}