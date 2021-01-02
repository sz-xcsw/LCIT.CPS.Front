import request from '@/utils/request'

// 查询岗位列表
export function listSalesOrder(query) {
  return request({
    url: '/services/sale/SalesOrder/GetAll',
    method: 'get',
    params: query
  })
}

// 查询岗位详细
export function getSalesOrder(salesOrderId) {
  return request({
    url: '/services/sale/SalesOrder/Get',
    method: 'get',
    params: {
      id: salesOrderId
    }
  })
}

// 新增岗位
export function addSalesOrder(data) {
  return request({
    url: '/services/sale/SalesOrder/Create',
    method: 'post',
    data: data
  })
}

// 修改岗位
export function updateSalesOrder(data) {
  return request({
    url: '/services/sale/SalesOrder/Update',
    method: 'put',
    data: data
  })
}

// 删除岗位（行内删除和选择性删除）
export function delSalesOrder(salesOrderId) {
  return request({
    url: '/services/sale/SalesOrder/Delete',
    method: 'delete',
    params: {
      ids: salesOrderId
    }
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/sale/SalesOrder/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}