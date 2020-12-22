import request from '@/utils/request'

// 查询字典类型列表
export function listType(query) {
  return request({
    url: '/services/app/DictType/GetAll',
    method: 'get',
    params: query
  })
}

export function getDictTypes() {
  return request({
    url: '/services/app/DictType/getDictTypes',
    method: 'get',
    params: {}
  })
}

// 查询字典类型详细
export function getType(dictId) {
  return request({
    url: '/services/app/DictType/Get',
    method: 'get',
    params: {
      id: dictId
    }
  })
}

// 新增字典类型
export function addType(data) {
  return request({
    url: '/services/app/DictType/Create',
    method: 'post',
    data: data
  })
}

// 修改字典类型
export function updateType(data) {
  return request({
    url: '/services/app/DictType/Update',
    method: 'put',
    data: data
  })
}

// 删除字典类型
export function delType(dictId) {
  return request({
    url: '/services/app/DictType/Delete',
    method: 'delete',
    params: {
      ids: dictId
    }
  })
}

// 清理参数缓存
export function clearCache() {
  return request({
    url: '/system/dict/type/clearCache',
    method: 'delete'
  })
}

// 导出字典类型
export function exportType(query) {
  return request({
    url: '/system/dict/type/export',
    method: 'get',
    params: query
  })
}

// 获取字典选择框列表
export function optionselect() {
  return request({
    url: '/system/dict/type/optionselect',
    method: 'get'
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/app/DictType/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}