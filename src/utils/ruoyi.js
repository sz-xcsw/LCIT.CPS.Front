/**
 * 通用js方法封装处理
 */

const baseURL = process.env.VUE_APP_BASE_API;

// 日期格式化
// export function parseTime(time, pattern) {
//   debugger;
//   if (arguments.length === 0 || !time) {
//     return null;
//   }
//   const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
//   let date;
//   if (typeof time === "object") {
//     date = time;
//   } else {
//     if (typeof time === "string" && /^[0-9]+$/.test(time)) {
//       time = parseInt(time);
//     } else if (typeof time === "string") {
//       time = time.replace(new RegExp(/-/gm), "/");
//     }
//     if (typeof time === "number" && time.toString().length === 10) {
//       time = time * 1000;
//     }
//     date = new Date(time);
//   }
//   const formatObj = {
//     y: date.getFullYear(),
//     m: date.getMonth() + 1,
//     d: date.getDate(),
//     h: date.getHours(),
//     i: date.getMinutes(),
//     s: date.getSeconds(),
//     a: date.getDay(),
//   };
//   const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
//     let value = formatObj[key];
//     // Note: getDay() returns 0 on Sunday
//     if (key === "a") {
//       return ["日", "一", "二", "三", "四", "五", "六"][value];
//     }
//     if (result.length > 0 && value < 10) {
//       value = "0" + value;
//     }
//     return value || 0;
//   });
//   return time_str;
// }

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params;
  search.beginTime = "";
  search.endTime = "";
  if (null != dateRange && "" != dateRange) {
    search.beginTime = this.dateRange[0];
    search.endTime = this.dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).map((key) => {
    if (datas[key].dictValue == value) { //if (datas[key].dictValue == "" + value) {  //alter by lc
      actions.push(datas[key].dictLabel);
      return false;
    }
  });
  return actions.join("");
}

// 通用下载方法
export function download(fileName) {
  window.location.href =
    baseURL +
    "/common/download?fileName=" +
    encodeURI(fileName) +
    "&delete=" +
    true;
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === "undefined") {
      flag = false;
      return "";
    }
    return arg;
  });
  return flag ? str : "";
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || "id";
  parentId = parentId || "parentId";
  children = children || "children";
  rootId = rootId || 0;
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  //循环所有项
  const treeData = cloneData.filter((father) => {
    let branchArr = cloneData.filter((child) => {
      //返回每一项的子级数组
      return father[id] === child[parentId];
    });
    branchArr.length > 0 ? (father.children = branchArr) : "";
    //返回第一层
    return father[parentId] === rootId;
  });
  return treeData != "" ? treeData : data;
}

export function formatJson(filterVal, jsonData) {
  return jsonData.map((v) =>
    filterVal.map((j) => {
      if (j === "creationTime") {
        return this.parseTime(v[j]);
      } else {
        return v[j];
      }
    })
  );
}

/**
 * 获取el-table的列名
 * @param {*} refTable el-table的ref值
 * @param {*} excludes 排除不要的列名
 */
export function getTableColumnNames(refTable, excludes) {
  let columnNames = [];
  refTable.columns.forEach((item, i) => {
    if (item.label !== undefined && item.label != "操作") {
      if (excludes == undefined) {
        columnNames.push(item.label);
      }
      else {
        if (excludes.indexOf(item.label) != -1) {
          return;//说明有需要排除的值
        }
        columnNames.push(item.label);
      }
    }
  });
  return columnNames;
}

/**
 * 获取el-table列的属性名
 * @param {*} refTable el-table的ref值
 * @param {*} excludes 排除不要的属性名称
 */
export function getTableColumnProperties(refTable, excludes) {
  let properties = [];
  refTable.columns.forEach((item, i) => {
    if (item.property !== undefined) {
      if (excludes == undefined) {
        properties.push(item.property);
      }
      else {
        if (excludes.indexOf(item.property) != -1) {
          return;//说明有需要排除的值
        }
        properties.push(item.property);
      }
    }
  });
  return properties;
}

/**
 * 重构导入的数据 注意：使用此方法要遵循以下原则：
 * 1.导入数据所用的【模板文件】中的header，在el-table下columns数组中都要包含到，否则需要单独重构。
 * @param {*} results 导入数据
 * @param {*} columns el-table的列
 */
export function reworkImportData(results, columns) {
  results.forEach((r, i) => {
    var keys = Object.keys(r);
    keys.forEach((key, k) => {
      columns.forEach((item, j) => {
        if (item.label === key) {
          r[item.property] = r[key];
          delete r[key];
        }
      });
    });
  });
  return results;
}

