/**
 * 网络请求封装
 */
import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 基础URL，会被代理到实际的API服务器
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加请求头，如token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 处理响应数据
    return response.data
  },
  error => {
    // 处理响应错误
    console.error('响应拦截器错误:', error)
    return Promise.reject(error)
  }
)

export default request