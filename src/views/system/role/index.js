import {
    listRole,
    getRole,
    delRole,
    addRole,
    updateRole,
    exportRole,
    dataScope,
    changeStatus,
    getRolePermissions,
} from "@/api/system/role";
import {
    treeselect as menuTreeselect,
    // roleMenuTreeselect,
} from "@/api/system/menu";
import {
    treeselect as deptTreeselect,
    roleDeptTreeselect,
} from "@/api/system/dept";

export default {
    name: "Role",
    data() {
        return {
            activeTab: "role",
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 非多个禁用
            multiple: true,
            // 选中的数据
            multipleSelection: [],
            // 总条数
            total: 0,
            // 角色表格数据
            roleList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 是否显示弹出层（数据权限）
            openDataScope: false,
            // 日期范围
            dateRange: [],
            // 状态数据字典
            // statusOptions: [],
            // 数据范围选项
            dataScopeOptions: [
                // {
                //     value: "1",
                //     label: "全部数据权限",
                // },
                // {
                //     value: "2",
                //     label: "自定数据权限",
                // },
                // {
                //     value: "3",
                //     label: "本部门数据权限",
                // },
                // {
                //     value: "4",
                //     label: "本部门及以下数据权限",
                // },
                // {
                //     value: "5",
                //     label: "仅本人数据权限",
                // },
            ],
            // 菜单权限
            menuOptions: [],
            // 部门列表
            deptOptions: [],
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                keyword: undefined,
            },
            // 表单参数
            form: {},
            defaultProps: {
                children: "children",
                label: "label",
            },
            // 表单校验
            rules: {
                name: [
                    { required: true, message: "角色代码不能为空", trigger: "blur" },
                ],
                displayName: [
                    { required: true, message: "角色名称不能为空", trigger: "blur" },
                ],
                // sort: [
                //   { required: true, message: "角色顺序不能为空", trigger: "blur" },
                // ],
            },
        };
    },
    created() {
        this.getList();
        // this.getDicts("sys_normal_disable").then((response) => {
        //   this.statusOptions = response.data;
        // });
    },
    methods: {
        /** 查询角色列表 */
        getList() {
            this.loading = true;
            listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
                (response) => {
                    this.roleList = response.result.items;
                    this.total = response.result.totalCount;
                    this.loading = false;
                }
            );
        },
        /** 查询菜单树结构 */
        getMenuTreeselect() {
            menuTreeselect().then((response) => {
                this.menuOptions = response.result.items;
            });
        },
        /** 查询部门树结构 */
        getDeptTreeselect() {
            deptTreeselect().then((response) => {
                this.deptOptions = response.data;
            });
        },
        // 所有勾选的菜单节点数据
        getMenuAllCheckedKeys() {
            // 半选中的菜单节点
            let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
            // 目前被选中的菜单节点
            let checkedKeys = this.$refs.menu.getCheckedKeys();
            // checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
            let rolePermissions = [
                {
                    isHalf: true,
                    MenuIds: halfCheckedKeys,
                },
                {
                    isHalf: false,
                    MenuIds: checkedKeys,
                },
            ];
            return rolePermissions;
        },
        // 所有部门节点数据
        getDeptAllCheckedKeys() {
            // 半选中的部门节点
            let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
            // 目前被选中的部门节点
            let checkedKeys = this.$refs.dept.getCheckedKeys();
            checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
            return checkedKeys;
        },
        /** 根据角色ID查询菜单树结构 */
        getRoleMenuTreeselect(id) {
            getRolePermissions(id).then((response) => {
                debugger;
                this.menuOptions = response.result.menus;
                this.$refs.menu.setCheckedKeys(response.result.checkedIds);
            });
        },
        /** 根据角色ID查询部门树结构 */
        getRoleDeptTreeselect(id) {
            roleDeptTreeselect(id).then((response) => {
                this.deptOptions = response.depts;
                this.$refs.dept.setCheckedKeys(response.checkedKeys);
            });
        },
        // 角色状态修改
        handleStatusChange(row) {
            let text = row.isActive ? "激活" : "停用";
            this.$confirm(
                '确认要' + text + row.displayName + '角色吗?',
                "警告",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(function () {
                    return changeStatus(row.id);
                })
                .then(() => {
                    this.msgSuccess(text + "成功");
                })
                .catch(function () {
                    row.isActive = !row.isActive;
                });
        },
        // 取消按钮
        cancel() {
            this.open = false;
            this.reset();
        },
        // 取消按钮（数据权限）
        cancelDataScope() {
            this.openDataScope = false;
            this.reset();
        },
        // 表单重置
        reset() {
            if (this.$refs.menu != undefined) {
                this.$refs.menu.setCheckedKeys([]);
            }
            this.form = {
                id: undefined,
                displayName: undefined,
                name: undefined,
                sort: 0,
                menuIds: [],
                deptIds: [],
                description: undefined,
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.getList();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.dateRange = [];
            this.resetForm("queryForm");
            this.handleQuery();
        },
        // 多选框选中数据
        handleSelectionChange(selection) {
            this.multipleSelection = selection;
            this.ids = selection.map((item) => item.id);
            this.multiple = !selection.length;
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.getMenuTreeselect();
            this.open = true;
            this.title = "添加角色";
            // this.form.isActive = true;
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            this.$nextTick(() => {
                this.getRoleMenuTreeselect(id);
            });
            getRole(id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改角色";
            });
        },
        /** 分配数据权限操作 */
        handleDataScope(row) {
            this.reset();
            this.$nextTick(() => {
                this.getRoleDeptTreeselect(row.id);
            });
            getRole(row.id).then((response) => {
                this.form = response.data;
                this.openDataScope = true;
                this.title = "分配数据权限";
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        this.form.rolePermissions = this.getMenuAllCheckedKeys();
                        updateRole(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        this.form.rolePermissions = this.getMenuAllCheckedKeys();
                        addRole(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("新增成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    }
                }
            });
        },
        /** 提交按钮（数据权限） */
        submitDataScope: function () {
            if (this.form.id != undefined) {
                this.form.deptIds = this.getDeptAllCheckedKeys();
                dataScope(this.form).then((response) => {
                    if (response.code === 200) {
                        this.msgSuccess("修改成功");
                        this.openDataScope = false;
                        this.getList();
                    }
                });
            }
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$confirm('是否确认删除角色编号为"' + ids + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(function () {
                    return delRole(ids);
                })
                .then(() => {
                    this.getList();
                    this.msgSuccess("删除成功");
                })
                .catch(function () { });
        },
        /** 导出按钮操作 */
        handleExport() {
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = this.getTableColumnNames(this.$refs.multipleTable);
                const filterVal = this.getTableColumnProperties(
                    this.$refs.multipleTable
                );
                const list = this.multipleSelection.length
                    ? this.multipleSelection
                    : this.roleList;
                const data = this.formatJson(filterVal, list);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "角色数据",
                    autoWidth: this.autoWidth,
                    bookType: this.bookType,
                });
                this.$refs.multipleTable.clearSelection();
            });
        },
    },
};