import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/services/app/Menu/GetMenuList',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: 'services/app/Menu/Get',
    method: 'get',
    params: {
      id: menuId
    }
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/services/app/Menu/GetMenuTreeNodes',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: 'services/app/Menu/Create',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: 'services/app/Menu/Update',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: 'services/app/Menu/Delete',
    method: 'delete',
    params: {
      ids: menuId
    }
  })
}

// 改变激活状态
export function changeStatus(id) {
  return request({
    url: '/services/app/Menu/ChangeStatus',
    method: 'post',
    data: {
      id: id
    }
  })
}