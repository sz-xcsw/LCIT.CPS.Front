import request from '@/utils/request'

// 查询岗位列表
export function listStockIn(query) {
  return request({
    url: '/services/ware/StockIn/GetAll',
    method: 'get',
    params: query
  })
}

// 查询岗位详细
export function getStockIn(stockInId) {
  return request({
    url: '/services/ware/StockIn/Get',
    method: 'get',
    params: {
      id: stockInId
    }
  })
}

// 新增岗位
export function addStockIn(data) {
  return request({
    url: '/services/ware/StockIn/Create',
    method: 'post',
    data: data
  })
}

// 修改岗位
export function updateStockIn(data) {
  return request({
    url: '/services/ware/StockIn/Update',
    method: 'put',
    data: data
  })
}

// 删除岗位（行内删除和选择性删除）
export function delStockIn(stockInId) {
  return request({
    url: '/services/ware/StockIn/Delete',
    method: 'delete',
    params: {
      ids: stockInId
    }
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/ware/StockIn/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}