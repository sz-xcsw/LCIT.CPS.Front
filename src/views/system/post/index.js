import {
    listPost,
    getPost,
    delPost,
    addPost,
    updatePost,
    exportPost,
    changeStatus,
} from "@/api/system/post";

export default {
    name: "Post",
    data() {
        return {
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 总条数
            total: 0,
            // 岗位表格数据
            postList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 日期范围
            dateRange: [],
            // 非多个禁用
            multiple: true,
            // 选中的数据
            multipleSelection: [],
            // 激活状态数据字典
            // statusOptions: [],
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                keyword: undefined,
                // status: undefined,
                skipCount: 0,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                postName: [
                    { required: true, message: "岗位名称不能为空", trigger: "blur" },
                ],
                postCode: [
                    { required: true, message: "岗位编码不能为空", trigger: "blur" },
                ],
                sort: [
                    { required: true, message: "岗位顺序不能为空", trigger: "blur" },
                ],
            },
        };
    },
    created() {
        this.getList();
        // this.getDicts("sys_normal_disable").then((response) => {
        // this.statusOptions = response.data;
        // });
        // this.statusOptions = [
        // { dictValue: true, dictLabel: "是" },
        // { dictValue: false, dictLabel: "否" },
        // ];        
    },
    methods: {
        /** 查询岗位列表 */
        getList() {
            this.loading = true;
            listPost(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
                this.postList = response.result.items;
                this.total = response.result.totalCount;
                this.loading = false;
            });
        },
        // 岗位状态字典翻译
        // statusFormat(row, column) {
        // return this.selectDictLabel(this.statusOptions, row.isActive);
        // },
        // 取消按钮
        cancel() {
            this.open = false;
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                id: undefined,
                postCode: undefined,
                postName: undefined,
                isActive: false,
                sort: 0,
                // status: "0",
                remark: undefined,
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
            this.ids = selection.map((item) => item.id);
            this.multipleSelection = selection;
            this.multiple = !selection.length;
        },

        //修改激活状态
        handleStatus(row) {
            changeStatus(row.id).then((response) => {
                if (response.success) {
                    this.msgSuccess("修改成功");
                }
                this.queryParams.pageNum = 1;
                this.getList();
            });
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加岗位";
            this.form.isActive = true;
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id;
            getPost(id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改岗位";
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        updatePost(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        addPost(this.form).then((response) => {
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
        /** 行内删除按钮操作 */
        handleDelete(row) {
            debugger;
            const ids = (row.id || this.ids) + "";
            this.$confirm('是否确认删除岗位编号为"' + ids + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(function () {
                    return delPost(ids);
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
                    : this.postList;
                const data = this.formatJson(filterVal, list);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "岗位数据",
                    autoWidth: this.autoWidth,
                    bookType: this.bookType,
                });
                this.$refs.multipleTable.clearSelection();
            });
        },
    },
};