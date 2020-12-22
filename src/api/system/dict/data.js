import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/services/app/DictData/GetAll',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dataCode) {
  return request({
    url: '/services/app/DictData/Get',
    method: 'get',
    params: {
      id: dataCode
    }
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/services/app/DictData/Create',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/services/app/DictData/Update',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dataCode) {
  return request({
    url: '/services/app/DictData/Delete',
    method: 'delete',
    params: {
      ids: dataCode
    }
  })
}

// 导出字典数据
export function exportData(query) {
  return request({
    url: '/system/dict/data/export',
    method: 'get',
    params: query
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/app/DictData/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}