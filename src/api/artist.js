import request from '@/utils/request'

/**
 * 歌手相关API
 */
export const useArtistAPI = () => {
  /**
   * 获取热门歌手
   * @param {number} limit - 获取数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  const getHotArtists = (limit = 6, offset = 0) => {
    return request.get('/top/artists', { params: { limit, offset } })
  }

  /**
   * 获取歌手详情
   * @param {number} id - 歌手ID
   * @returns {Promise}
   */
  const getArtistDetail = (id) => {
    return request.get('/artist/detail', { params: { id } })
  }

  /**
   * 获取歌手热门歌曲
   * @param {number} id - 歌手ID
   * @returns {Promise}
   */
  const getArtistHotSongs = (id) => {
    return request.get('/artist/top/song', { params: { id } })
  }

  /**
   * 获取歌手列表
   * @param {Object} params - 筛选参数
   * @param {string|number} params.initial - 按首字母索引查找参数,如 'b' 或 0(代表#),热门传-1
   * @param {number} params.type - 歌手类型: -1(全部), 1(男歌手), 2(女歌手), 3(乐队)
   * @param {number} params.area - 地区: -1(全部), 7(华语), 96(欧美), 8(日本), 16(韩国), 0(其他)
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.limit - 返回数量,默认为30
   * @param {number} params.offset - 偏移数量，用于分页,默认为0
   * @returns {Promise}
   */
  const fetchArtists = (params = {}) => {
    const { initial = '', type = -1, area = -1, keyword = '', limit = 30, offset = 0 } = params;
    return request.get('/artist/list', {
      params: {
        initial,
        type,
        area,
        keyword,
        limit,
        offset
      }
    })
  }

  /**
   * 获取歌手分类
   * @returns {Promise}
   */
  const fetchArtistCategories = () => {
    return request.get('/artist/categories')
  }

  return {
    getHotArtists,
    getArtistDetail,
    getArtistHotSongs,
    fetchArtists,
    fetchArtistCategories
  }
}