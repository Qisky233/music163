import request from '@/utils/request'

/**
 * 二维码登录相关API
 */
export const useQrLoginAPI = () => {
  /**
   * 获取二维码key
   * @returns {Promise}
   */
  const getQRKey = () => {
    return request.get('/login/qr/key', { params: { timestamp: Date.now() } })
      .then(res => res.data.unikey)
  }

  /**
   * 生成二维码
   * @param {string} key - 二维码key
   * @returns {Promise<string>} 带前缀的Base64字符串
   */
  const generateQRCode = (key) => {
    return request.get('/login/qr/create', {
      params: {
        key,
        qrimg: true,
        timestamp: Date.now()
      },
      responseType: 'arraybuffer'
    })
      .then(res => {
        // 构造完整的Base64字符串
        return 'data:image/png;base64,' + Buffer.from(res.data, 'binary').toString('base64')
      })
  }

  /**
   * 检查二维码状态
   * @param {string} key - 二维码key
   * @returns {Promise}
   */
  const checkQRStatus = (key) => {
    return request.get('/login/qr/check', {
      params: {
        key,
        timestamp: Date.now()
      }
    })
  }

  /**
   * 通过cookie获取用户信息
   * @param {Object} cookies - cookie对象
   * @returns {Promise}
   */
  const getUserInfoByCookie = () => {
    return request.get('/user/account')
  }

  return {
    getQRKey,
    generateQRCode,
    checkQRStatus,
    getUserInfoByCookie
  }
}