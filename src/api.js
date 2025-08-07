import axios from 'axios'
import { useUserStore } from './store/user'

// 创建Axios实例
const instance = axios.create({
  baseURL: 'https://music163-jet.vercel.app/',
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    // 添加令牌到请求头
    if (userStore.token && !userStore.isTokenExpired()) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 检查响应数据
    if (response.data.code !== 200) {
      console.error('API Error:', response.data.message)
      return Promise.reject(new Error(response.data.message || 'Request failed'))
    }
    return response.data
  },
  error => {
    // 处理响应错误
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      console.error(`API Error (${status}):`, error.response.data)

      // 处理令牌过期
      if (status === 401) {
        const userStore = useUserStore()
        if (!userStore.isTokenExpired()) {
          // 令牌未过期但仍返回401，可能是令牌无效
          userStore.logout()
        } else {
          // 令牌已过期，尝试刷新
          return userStore.refreshToken().then(() => {
            // 刷新成功后重试请求
            const config = error.config
            config.headers['Authorization'] = `Bearer ${userStore.token}`
            return instance(config)
          })
        }
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('API Error: No response received', error.request)
    } else {
      // 设置请求时发生错误
      console.error('API Error: Request setup failed', error.message)
    }
    return Promise.reject(error)
  }
)

/**
 * 用户认证相关API
 */
export const authAPI = {
  /**
   * 发送验证码
   * @param {string} phone - 手机号
   * @returns {Promise}
   */
  sendCode(phone) {
    return instance.get('/captcha/sent', { params: { phone } })
  },

  /**
   * 手机号登录
   * @param {string} phone - 手机号
   * @param {string} captcha - 验证码
   * @returns {Promise}
   */
  login(phone, captcha) {
    return instance.get('/login/cellphone', { params: { phone, captcha } })
  },

  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo() {
    return instance.get('/user/account')
  }
}

/**
 * 歌单相关API
 */
export const playlistAPI = {
  /**
   * 获取我的歌单
   * @param {number} uid - 用户ID
   * @returns {Promise}
   */
  getMyPlaylists(uid) {
    return instance.get('/user/playlist', { params: { uid } })
  },

  /**
   * 获取歌单详情
   * @param {number} id - 歌单ID
   * @returns {Promise}
   */
  getPlaylistDetail(id) {
    return instance.get('/playlist/detail', { params: { id } })
  },

  /**
   * 获取推荐歌单
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  getRecommendPlaylists(limit = 10) {
    return instance.get('/personalized', { params: { limit } })
  },

  /**
   * 收藏歌单
   * @param {number} id - 歌单ID
   * @param {boolean} t - 1: 收藏, 2: 取消收藏
   * @returns {Promise}
   */
  subscribePlaylist(id, t = 1) {
    return instance.get('/playlist/subscribe', { params: { id, t } })
  }
}

/**
 * 音乐相关API
 */
export const musicAPI = {
  /**
   * 获取歌曲详情
   * @param {string} ids - 歌曲ID，多个用逗号分隔
   * @returns {Promise}
   */
  getSongDetail(ids) {
    return instance.get('/song/detail', { params: { ids } })
  },

  /**
   * 获取歌词
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  getLyric(id) {
    return instance.get('/lyric', { params: { id } })
  },

  /**
   * 获取播放历史
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  getPlayHistory(limit = 100) {
    return instance.get('/user/record', { params: { limit, type: 0 } })
  },

  /**
   * 获取最新音乐
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  getNewSongs(limit = 10) {
    return instance.get('/personalized/newsong', { params: { limit } })
  }
}

/**
 * 歌曲相关API
 */
export const songAPI = {
  /**
   * 获取歌曲URL
   * @param {number} id - 歌曲ID
   * @param {number} br - 音频质量 (999000: 无损, 320000: 320kbps, 128000: 128kbps)
   * @returns {Promise}
   */
  getSongUrl(id, br = 320000) {
    return instance.get('/song/url', { params: { id, br } })
  },

  /**
   * 获取歌曲详情
   * @param {string} ids - 歌曲ID，多个用逗号分隔
   * @returns {Promise}
   */
  getSongDetail(ids) {
    return instance.get('/song/detail', { params: { ids } })
  },

  /**
   * 获取歌词
   * @param {number} id - 歌曲ID
   * @returns {Promise}
   */
  getLyric(id) {
    return instance.get('/lyric', { params: { id } })
  },

  /**
   * 获取播放历史
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  getPlayHistory(limit = 100) {
    return instance.get('/user/record', { params: { limit, type: 0 } })
  },

  /**
   * 获取最新音乐
   * @param {number} limit - 获取数量
   * @returns {Promise}
   */
  getNewSongs(limit = 10) {
    return instance.get('/personalized/newsong', { params: { limit } })
  }
}

/**
 * 歌手相关API
 */
export const artistAPI = {
  /**
   * 获取热门歌手
   * @param {number} limit - 获取数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  getHotArtists(limit = 6, offset = 0) {
    return instance.get('/top/artists', { params: { limit, offset } })
  }
}

/**
 * 搜索相关API
 */
export const searchAPI = {
  /**
   * 搜索
   * @param {string} keywords - 搜索关键词
   * @param {number} type - 搜索类型 (1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户)
   * @param {number} limit - 获取数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  search(keywords, type = 1, limit = 30, offset = 0) {
    return instance.get('/search', { params: { keywords, type, limit, offset } })
  },

  /**
   * 搜索建议
   * @param {string} keywords - 搜索关键词
   * @returns {Promise}
   */
  getSearchSuggest(keywords) {
    return instance.get('/search/suggest', { params: { keywords, type: 'mobile' } })
  },

  /**
   * 获取热门搜索
   * @returns {Promise}
   */
  getHotSearch() {
    return instance.get('/search/hot/detail')
  }
}

/**
 * 轮播图相关API
 */
export const bannerAPI = {
  /**
   * 获取轮播图
   * @param {number} type - 资源类型 (0: pc, 1: android, 2: iphone, 3: ipad)
   * @returns {Promise}
   */
  getBanners(type = 0) {
    return instance.get('/banner', { params: { type } })
  }
}

/**
 * 排行榜相关API
 */
export const topListAPI = {
  /**
   * 获取排行榜列表
   * @returns {Promise}
   */
  getTopList() {
    return instance.get('/toplist')
  },

  /**
   * 获取排行榜详情
   * @param {number} id - 排行榜ID
   * @returns {Promise}
   */
  getTopListDetail(id) {
    return instance.get('/playlist/detail', { params: { id } })
  }
}

/**
 * 评论相关API
 */
export const commentAPI = {
  /**
   * 获取歌曲评论
   * @param {number} id - 歌曲ID
   * @param {number} limit - 获取数量
   * @param {number} offset - 偏移量
   * @returns {Promise}
   */
  getSongComments(id, limit = 20, offset = 0) {
    return instance.get('/comment/music', { params: { id, limit, offset } })
  },

  /**
   * 点赞评论
   * @param {number} id - 评论ID
   * @param {number} cid - 评论ID
   * @param {number} t - 1: 点赞, 0: 取消点赞
   * @returns {Promise}
   */
  likeComment(id, cid, t = 1) {
    return instance.get('/comment/like', { params: { id, cid, t } })
  },

  /**
   * 发表评论
   * @param {number} id - 歌曲/专辑/歌单ID
   * @param {string} content - 评论内容
   * @param {number} type - 评论类型 (0: 歌曲, 1: 专辑, 2: 歌单, 3: 视频)
   * @returns {Promise}
   */
  postComment(id, content, type = 0) {
    return instance.get('/comment', { params: { id, content, type } })
  }
}

export default instance