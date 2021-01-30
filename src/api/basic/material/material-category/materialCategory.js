import request from '@/utils/request'

//查询列表
export function listMaterialCategory(query) {
  return request({
    url: '/services/basic/MaterialCategory/GetMaterialCategorys',
    method: 'get',
    params: query
  })
}

// 查询物料分类列表
export function getMaterialCategorysByWhere(query) {
  return request({
    url: '/services/basic/MaterialCategory/GetMaterialCategorysByWhere',
    method: 'get',
    params: query
  })
}

// 查询物料分类列表（排除节点）
export function listMaterialCategoryExcludeChild(categoryId) {
  return request({
    url: '/services/basic/MaterialCategory/GetExcludeChild',
    method: 'get',
    params: {
      id: categoryId
    }
  })
}

//查询详细
export function getMaterialCategory(id) {
  return request({
    url: '/services/basic/MaterialCategory/Get',
    method: 'get',
    params: {
      id: id
    }
  })
}

// 查询物料分类下拉树结构
export function treeselect() {
  return request({
    url: '/services/basic/MaterialCategory/GetMaterialCategoryTreeNodes',
    method: 'get'
  })
}

//新增
export function addMaterialCategory(data) {
  return request({
    url: '/services/basic/MaterialCategory/Create',
    method: 'post',
    data: data
  })
}

//修改
export function updateMaterialCategory(data) {
  return request({
    url: '/services/basic/MaterialCategory/Update',
    method: 'put',
    data: data
  })
}

//删除（行内删除和选择性删除）
export function delMaterialCategory(ids) {
  return request({
    url: '/services/basic/MaterialCategory/Delete',
    method: 'delete',
    params: {
      ids: ids
    }
  })
}

//改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/basic/MaterialCategory/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}