import axios from 'axios'
import { message, notification, Modal } from 'ant-design-vue'
import { useUserStore } from '@/store/user'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'

// 是否显示重新登录
export let isRelogin = { show: false };

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  const isToken = (config.headers || {}).isToken === false
  const userStore = useUserStore()
  // if (userStore.token) {
  //   config.headers['Cookie'] = userStore.token
  // }
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }

  // 处理GET请求参数
  if (config.method === 'get' && config.params) {
    const params = tansParams(config.params);
    config.url += (config.url.includes('?') ? '&' : '?') + params;
    config.params = undefined;
  }

  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})
// 响应拦截器
service.interceptors.response.use(res => {
  const code = res.data.code || 200;
  const msg = errorCode[code] || res.data.msg || '请求失败'

  if (code === 401) {
    if (!isRelogin.show) {
      isRelogin.show = true;
      Modal.confirm({
        title: '系统提示',
        content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
        okText: '重新登录',
        cancelText: '取消',
        onOk() {
          isRelogin.show = false;
          useUserStore().logout().then(() => {
            location.href = '/login';
          })
        },
        onCancel() {
          isRelogin.show = false;
        }
      })
    }
    return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
  } else if (code === 500) {
    message.error(msg)
    return Promise.reject(new Error(msg))
  } else if (code !== 200) {
    notification.error({
      message: '错误',
      description: msg
    })
    return Promise.reject('error')
  } else {
    return res.data
  }
}, error => {
  console.log('err' + error)
  let { message: msg } = error;
  if (msg == 'Network Error') {
    msg = '后端接口连接异常';
  } else if (msg.includes('timeout')) {
    msg = '系统接口请求超时';
  } else if (msg.includes('Request failed with status code')) {
    msg = '系统接口' + msg.substr(msg.length - 3) + '异常';
  }
  message.error(msg, 5)
  return Promise.reject(error)
})

// 通用下载方法
export function download(url, params, filename) {
  return service.post(url, params, {
    responseType: 'blob'
  }).then(data => {
    const blob = new Blob([data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }).catch(error => {
    console.error('下载文件失败:', error)
    message.error('下载文件出现错误，请联系管理员！')
  })
}

// 转换参数
function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + '='
    if (value !== null && value !== undefined && typeof value !== 'object') {
      part += encodeURIComponent(value) + '&'
    } else if (value instanceof Array) {
      for (let i = 0; i < value.length; i++) {
        part += encodeURIComponent(propName) + '[' + i + ']=' + encodeURIComponent(value[i]) + '&'
      }
    }
    result += part
  }
  return result.slice(0, -1)
}

export default service