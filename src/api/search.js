import request from '@/utils/request'

/**
 * 搜索相关API
 */
export const useSearchAPI = () => {
  /**
   * 搜索音乐
   * @param {string} keywords - 搜索关键词
   * @param {number} type - 搜索类型: 1-单曲, 10-专辑, 100-歌手, 1000-歌单, 1002-用户
   * @param {number} limit - 返回数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  const search = (keywords, type = 1, limit = 30, offset = 0) => {
    return request.get('/search', { params: { keywords, type, limit, offset } })
  }

  /**
   * 获取搜索建议
   * @param {string} keywords - 搜索关键词
   * @returns {Promise}
   */
  const getSearchSuggest = (keywords) => {
    return request.get('/search/suggest', { params: { keywords } })
  }

  /**
   * 获取热门搜索
   * @returns {Promise}
   */
  const getHotSearch = () => {
    return request.get('/search/hot')
  }

  return {
    search,
    getSearchSuggest,
    getHotSearch
  }
}