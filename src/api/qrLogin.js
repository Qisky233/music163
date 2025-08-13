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
   // 修改generateQRCode方法，直接返回接口提供的base64
    const generateQRCode = (key) => {
      return request.get('/login/qr/create', {
        params: {
          key,
          qrimg: true,
          timestamp: Date.now()
        },
        // 注意：这里不再需要需要设置responseType为arraybuffer，保持默认json即可
      })
        .then(res => {
          // 假设接口返回的数据格式为 { qrimg: "data:image/png;base64,xxxx" }
          if (!res.data.qrimg) {
            throw new Error('接口未返回回有效的二维码base64数据');
          }
          // 直接返回完整的base64字符串（包含data URI前缀）
          return res.data.qrimg;
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
    }).then(res => {
      // 验证接口返回的核心字段
      if (res.data.code === undefined) {
        throw new Error('二维码状态接口返回格式异常，缺少code字段');
      }
      // 提取并返回需要的字段（确保与接口返回格式一致）
      return {
        code: res.data.code,
        message: res.data.message || '', // 确保message始终存在
        cookie: res.data.cookie // 仅在登录成功(803)时存在
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