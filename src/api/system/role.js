import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/services/app/Role/GetAll',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/services/app/Role/Get',
    method: 'get',
    params: {
      id: roleId
    }
  })
}

// 获取角色权限
export function getRolePermissions(roleId) {
  return request({
    url: '/services/app/Role/GetRolePermissions',
    method: 'get',
    params: {
      id: roleId
    }
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/services/app/Role/Create',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/services/app/Role/Update',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeStatus(roleId) {
  return request({
    url: '/services/app/Role/ChangeStatus',
    method: 'post',
    data: {
      id: roleId
    }
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: '/services/app/Role/Delete',
    method: 'delete',
    params: {
      ids: roleId
    }
  })
}

// 导出角色
export function exportRole(query) {
  return request({
    url: '/system/role/export',
    method: 'get',
    params: query
  })
}