import request from '@/utils/request'

//查询岗位列表
export function listPost(query) {
  return request({
    url: '/services/app/Post/GetAll',
    method: 'get',
    params: query
  })
}

//查询岗位详细
export function getPost(id) {
  return request({
    url: '/services/app/Post/Get',
    method: 'get',
    params: {
      id: id
    }
  })
}

//新增岗位
export function addPost(data) {
  return request({
    url: '/services/app/Post/Create',
    method: 'post',
    data: data
  })
}

//修改岗位
export function updatePost(data) {
  return request({
    url: '/services/app/Post/Update',
    method: 'put',
    data: data
  })
}

//删除岗位（行内删除和选择性删除）
export function delPost(ids) {
  return request({
    url: '/services/app/Post/Delete',
    method: 'delete',
    params: {
      ids: ids
    }
  })
}

//改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/app/Post/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}