import {
    listUser,
    getUser,
    delUser,
    addUser,
    updateUser,
    resetUserPwd,
    changeStatus,
    getUserPermissions,
    getUserPostDtos,
    getUserRoleDtos,
    importUser,
} from "@/api/system/user";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeselect as menuTreeselect } from "@/api/system/menu";
import UploadExcelComponent from "@/components/UploadExcel/index.vue";
export default {
    name: "User",
    components: { Treeselect, UploadExcelComponent },
    data() {
        return {
            activeTab: "user",
            // 遮罩层
            loading: true,
            // 选中的数据
            multipleSelection: [],
            // 选中Id数组
            ids: [],
            // 非多个禁用
            multiple: false,
            // 总条数
            total: 0,
            // 用户表格数据
            userList: null,
            // 弹出层标题
            title: "",
            // 部门树选项
            deptOptions: undefined,
            // 是否显示弹出层
            open: false,
            // 部门名称
            deptName: undefined,
            // 默认密码
            initPassword: undefined,
            // 日期范围
            dateRange: [],
            // 岗位选项
            postOptions: [],
            // 角色
            roleOptions: [],
            // 菜单权限
            menuOptions: [],
            // 表单参数
            form: {},
            defaultProps: {
                children: "children",
                label: "label",
            },
            // 用户导入参数
            upload: {
                // 是否显示弹出层（用户导入）
                open: false,
                // 弹出层标题（用户导入）
                title: "",
                //导入的数据
                importData: {},
            },
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                keyword: undefined,
                deptId: undefined,
            },
            // 表单校验
            rules: {
                userName: [
                    { required: true, message: "用户名称不能为空", trigger: "blur" },
                ],
                name: [
                    { required: true, message: "用户姓名不能为空", trigger: "blur" },
                ],
                deptId: [
                    { required: true, message: "归属部门不能为空", trigger: "blur" },
                ],
                password: [
                    { required: true, message: "用户密码不能为空", trigger: "blur" },
                ],
                emailAddress: [
                    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
                    {
                        type: "email",
                        message: "'请输入正确的邮箱地址",
                        trigger: ["blur", "change"],
                    },
                ],
                phoneNumber: [
                    { required: false, message: "手机号码不能为空", trigger: "blur" },
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: "请输入正确的手机号码",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    watch: {
        // 根据名称筛选部门树
        deptName(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.getList();
        this.getDeptTreeselect();
    },
    methods: {
        /** 查询用户列表 */
        getList() {
            this.loading = true;
            listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
                (response) => {
                    this.userList = response.result.items;
                    this.total = response.result.totalCount;
                    this.loading = false;
                }
            );
        },
        selectDept(val) {
            this.form.deptName = val.label;
        },
        // 获取勾选的菜单节点数据
        getMenuAllCheckedKeys() {
            // 半选中的菜单节点
            let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
            // 目前被选中的菜单节点
            let checkedKeys = this.$refs.menu.getCheckedKeys();
            // checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);

            let userPermissions = [
                {
                    isHalf: true,
                    MenuIds: halfCheckedKeys,
                },
                {
                    isHalf: false,
                    MenuIds: checkedKeys,
                },
            ];
            return userPermissions;
        },
        /** 根据用户ID查询菜单树结构 */
        getUserMenuTreeselect(id) {
            getUserPermissions(id).then((response) => {
                this.menuOptions = response.result.menus;
                this.$refs.menu.setCheckedKeys(response.result.checkedIds);
            });
        },
        /** 查询菜单树结构 */
        getMenuTreeselect() {
            menuTreeselect().then((response) => {
                this.menuOptions = response.result.items;
            });
        },
        /** 查询部门下拉树结构 */
        getDeptTreeselect() {
            treeselect().then((response) => {
                this.deptOptions = response.result.items;
            });
        },
        /** 获取岗位 */
        getUserPostDtos() {
            getUserPostDtos().then((response) => {
                this.postOptions = response.result;
            });
        },
        /** 获取角色 */
        getUserRoleDtos(id) {
            getUserRoleDtos(id).then((response) => {
                this.roleOptions = response.result;
            });
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.queryParams.deptId = data.id;
            this.getList();
        },
        // 用户状态修改
        handleStatusChange(row) {
            let text = row.isActive ? "启用" : "停用";
            this.$confirm(
                '确认要' + text + row.userName + '用户吗?',
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
        // 表单重置
        reset() {
            if (this.$refs.menu != undefined) {
                this.$refs.menu.setCheckedKeys([]);
            }
            this.form = {
                id: undefined,
                deptId: undefined,
                userName: undefined,
                name: undefined,
                password: undefined,
                phoneNumber: undefined,
                emailAddress: undefined,
                isActive: undefined,
                remark: undefined,
                postIds: [],
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.page = 1;
            this.getList();
        },
        /** 转换部门数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.label,
                children: node.children,
            };
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
            this.multiple = selection.length > 0;
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.getDeptTreeselect();
            this.getMenuTreeselect();
            this.getUserPostDtos();
            this.getUserRoleDtos();
            this.open = true;
            this.title = "添加用户";
            this.form.isActive = true;
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.getDeptTreeselect();
            const id = row.id || this.ids;
            this.$nextTick(() => {
                this.getUserMenuTreeselect(id);
                this.getUserPostDtos();
                this.getUserRoleDtos(id);
            });
            getUser(id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改用户";
                this.form.password = "";
            });
        },
        /** 重置密码按钮操作 */
        handleResetPwd(row) {
            this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
            })
                .then(({ value }) => {
                    resetUserPwd(row.id, value).then((response) => {
                        if (response.code === 200) {
                            this.msgSuccess("修改成功，新密码是：" + value);
                        }
                    });
                })
                .catch(() => { });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        this.form.roles = this.roleOptions;
                        this.form.userPermissions = this.getMenuAllCheckedKeys();
                        updateUser(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        this.form.roles = this.roleOptions;
                        this.form.userPermissions = this.getMenuAllCheckedKeys();
                        addUser(this.form).then((response) => {
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
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = (row.id || this.ids) + "";
            this.$confirm('是否确认删除用户编号为"' + ids + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(function () {
                    return delUser(ids);
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
                    : this.userList;
                const data = this.formatJson(filterVal, list);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "用户数据",
                    autoWidth: this.autoWidth,
                    bookType: this.bookType,
                });
                this.$refs.multipleTable.clearSelection();
            });
        },
        /** 导入按钮操作 */
        handleImport() {
            this.upload.title = "用户导入";
            this.upload.open = true;
        },
        /** 下载模板操作 */
        downloadTemplate() {
            import("@/vendor/Export2Excel").then((excel) => {
                //这里以Table列作为模板,不够可自行追加。需要注意的是保存数据时Header必须要与Property一一对应。
                const tHeader = this.getTableColumnNames(this.$refs.multipleTable, [
                    "创建时间",
                ]);
                const data = [];
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "用户数据模板",
                    autoWidth: this.autoWidth,
                    bookType: this.bookType,
                });
            });
        },
        beforeUpload(file) {
            const isLt1M = file.size / 1024 / 1024 < 1;
            if (isLt1M) {
                return true;
            }
            this.msgWarning("上传的文件大小不得超过1M");
            return false;
        },
        // 文件上传成功处理
        handleFileSuccess(response) {
            //这里提供两种方法供大家参考使用 by lc
            //方法1：使用封装好的reworkImportData方法构建，缺点是有前提条件【模板文件】必须依赖于：this.$refs.multipleTable.columns
            // const results = this.reworkImportData(
            //   response.results,
            //   this.$refs.multipleTable.columns
            // );
            //方法2：自己灵活构建
            response.results.forEach((r) => {
                response.headers.forEach((h) => {
                    if (h === "用户名") {
                        r.userName = r[h];
                    }
                    if (h === "姓名") {
                        r.name = r[h];
                    }
                    if (h === "部门") {
                        r.deptName = r[h];
                    }
                    if (h === "手机号码") {
                        r.phoneNumber = r[h];
                    }
                    if (h === "电子邮箱") {
                        r.emailAddress = r[h];
                    }
                    if (h === "激活状态") {
                        r.isActive = r[h];
                    }
                    delete r[h];
                });
            });
            debugger;
            this.upload.importData = {
                isUpdate: response.isUpdate,
                data: response.results,
            };
        },
        // 提交上传文件
        submitFileForm() {
            importUser(this.upload.importData).then((response) => {
                if (response.success) {
                    debugger;
                    this.upload.open = false;
                    this.msgSuccess("导入成功!");
                    this.getList();
                }
            });
        },
    },
};