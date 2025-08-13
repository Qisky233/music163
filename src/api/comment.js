import request from '@/utils/request'

/**
 * 评论相关API
 */
export const useCommentAPI = () => {
  /**
   * 获取歌曲评论
   * @param {number} id - 歌曲ID
   * @param {number} limit - 获取数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  const getSongComments = (id, limit = 20, offset = 0) => {
    return request.get('/comment/music', { params: { id, limit, offset } })
  }

  /**
   * 点赞评论
   * @param {number} id - 评论ID
   * @param {number} cid - 评论ID
   * @param {number} t - 1: 点赞, 0: 取消点赞
   * @returns {Promise}
   */
  const likeComment = (id, cid, t = 1) => {
    return request.get('/comment/like', { params: { id, cid, t } })
  }

  /**
   * 发表评论
   * @param {number} id - 歌曲/专辑/歌单ID
   * @param {string} content - 评论内容
   * @param {number} type - 评论类型 (0: 歌曲, 1: 专辑, 2: 歌单, 3: 视频)
   * @returns {Promise}
   */
  const postComment = (id, content, type = 0) => {
    return request.get('/comment', { params: { id, content, type } })
  }

  return {
    getSongComments,
    likeComment,
    postComment
  }
}