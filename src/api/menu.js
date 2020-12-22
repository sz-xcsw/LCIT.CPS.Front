import request from '@/utils/request'
import routeResult from './route'

// 获取路由
export const getRouters = () => {
  return request({
    url: 'services/app/Menu/GetRoutersByMenu',
    method: 'get'
  })

  // return Promise.resolve(routeResult) 
}