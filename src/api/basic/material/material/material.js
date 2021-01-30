import request from '@/utils/request'

//查询列表
export function listMaterial(query) {
    return request({
        url: '/services/basic/Material/GetAll',
        method: 'get',
        params: query
    })
}

//查询详细
export function getMaterial(id) {
    return request({
        url: '/services/basic/Material/Get',
        method: 'get',
        params: {
            id: id
        }
    })
}

// 查询物料分类下拉树结构
export function treeselect() {
    return request({
        url: '/services/basic/Material/GetMaterialTreeNodes',
        method: 'get'
    })
}

//新增
export function addMaterial(data) {
    return request({
        url: '/services/basic/Material/Create',
        method: 'post',
        data: data
    })
}

//修改
export function updateMaterial(data) {
    return request({
        url: '/services/basic/Material/Update',
        method: 'put',
        data: data
    })
}

//删除（行内删除和选择性删除）
export function delMaterial(ids) {
    return request({
        url: '/services/basic/Material/Delete',
        method: 'delete',
        params: {
            ids: ids
        }
    })
}

//改变激活状态
export function changeStatus(id) {
    return request({
        url: '/services/basic/Material/ChangeStatus',
        method: 'post',
        data: {
            id: id
        }
    })
}