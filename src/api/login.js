import request from '@/utils/request'

// 获取租户名称
export function getTenantIdByName(tenancyName) {
  return request({
    url: 'services/app/Account/IsTenantAvailable',
    method: 'post',
    data: {
      tenancyName: tenancyName,
    }
  })
}

// 登录方法
export function login(userName, password, code, uuid) {
  const data = {
    UserNameOrEmailAddress: userName,
    password,
    code,
    uuid
  }
  return request({
    url: 'TokenAuth/Authenticate',
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: 'services/app/User/GetUserInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: 'TokenAuth/Logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}