import request from '@/utils/request'

// 查询岗位列表
export function listPurchaseOrder(query) {
  return request({
    url: '/services/pur/PurchaseOrder/GetAll',
    method: 'get',
    params: query
  })
}

// 查询岗位详细
export function getPurchaseOrder(purchaseOrderId) {
  return request({
    url: '/services/pur/PurchaseOrder/Get',
    method: 'get',
    params: {
      id: purchaseOrderId
    }
  })
}

// 新增岗位
export function addPurchaseOrder(data) {
  return request({
    url: '/services/pur/PurchaseOrder/Create',
    method: 'post',
    data: data
  })
}

// 修改岗位
export function updatePurchaseOrder(data) {
  return request({
    url: '/services/pur/PurchaseOrder/Update',
    method: 'put',
    data: data
  })
}

// 删除岗位（行内删除和选择性删除）
export function delPurchaseOrder(purchaseOrderId) {
  return request({
    url: '/services/pur/PurchaseOrder/Delete',
    method: 'delete',
    params: {
      ids: purchaseOrderId
    }
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/pur/PurchaseOrder/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}