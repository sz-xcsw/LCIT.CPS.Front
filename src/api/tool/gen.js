import request from '@/utils/request'

// 查询生成表数据
export function listTable(query) {
  return request({
    url: '/services/app/Coding/GetTableNames',
    method: 'get',
    params: query
  })
}
// 查询db数据库列表
export function listDbTable(query) {
  return request({
    url: '/tool/gen/db/list',
    method: 'get',
    params: query
  })
}

// 查询表详细信息
export function getGenTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'get'
  })
}

// 修改代码生成信息
export function updateGenTable(data) {
  return request({
    url: '/tool/gen',
    method: 'put',
    data: data
  })
}

// 导入表
export function importTable(data) {
  return request({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data
  })
}
// 生成代码
export function generateCodes(formData) {
  return request({
    url: '/services/app/Coding/GenerateCodes',
    method: 'post',
    data: formData
  })
}
// 删除表数据
export function delTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete'
  })
}

// 查询表字段
export function getTableColumns(tableName) {
  return request({
    url: '/services/app/Coding/GetTableColumns',
    method: 'get',
    params: {
      tableName: tableName
    }
  })
}

//获取模块名称
export function getModuleNames() {
  return request({
    url: '/services/app/Coding/GetModuleNames',
    method: 'get',
    params: {}
  })
}

