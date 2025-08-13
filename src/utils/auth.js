/**
 * 认证工具类
 * 提供token的存取功能
 */

/**
 * 获取token
 * @returns {string|null} token值
 */
export function getToken() {
  return localStorage.getItem('token') || null
}

/**
 * 设置token
 * @param {string} token - token值
 */
export function setToken(token) {
  localStorage.setItem('token', token)
}

/**
 * 移除token
 */
export function removeToken() {
  localStorage.removeItem('token')
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象
 */
export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem('userInfo')
}