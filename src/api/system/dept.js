import request from '@/utils/request'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/services/app/Department/GetDepartments',
    method: 'get',
    params: query
  })
}

// 查询部门列表
export function getDeptsByWhere(query) {
  return request({
    url: '/services/app/Department/GetDeptsByWhere',
    method: 'get',
    params: query
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/services/app/Department/GetExcludeChild',
    method: 'get',
    params: {
      id: deptId
    }
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/services/app/Department/Get',
    method: 'get',
    params: {
      id: deptId
    }
  })
}

// 查询部门下拉树结构
export function treeselect() {
  return request({
    url: '/services/app/Department/GetDeptTreeNodes',
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/services/app/Department/Create',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/services/app/Department/Update',
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/services/app/Department/Delete',
    method: 'delete',
    params: {
      ids: deptId
    }
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/app/Department/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}