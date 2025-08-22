import request from '@/utils/request'
import { useUserStore } from '@/store/user'
/**
 * 用户认证相关API
 */
export const useUserAPI = () => {
  /**
   * 发送验证码
   * @param {string} phone - 手机号
   * @returns {Promise}
   */
  const sendCode = (phone) => {
    return request.get('/captcha/sent', { params: { phone } })
  }

  /**
   * 手机号登录
   * @param {string} phone - 手机号
   * @param {string} captcha - 验证码
   * @returns {Promise}
   */
  const login = (phone, captcha) => {
    return request.get('/login/cellphone', { params: { phone, captcha } })
  }

  /**
   * 获取用户信息
   * @returns {Promise}
   */
  const getUserInfo = () => {
    const userStore = useUserStore()
    const timestamp = Date.now();
    const realIP = '116.25.146.177';
    const result = userStore.token
    return request.get(`/user/account?cookie=${result}&timestamp=${timestamp}&realIP=${realIP}`)
  }

  /**
   * 退出登录
   * @returns {Promise}
   */
  const logout = () => {
    return request.post('/logout')
  }

  return {
    sendCode,
    login,
    getUserInfo,
    logout
  }
}