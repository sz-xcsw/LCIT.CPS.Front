import {
    listDept,
    getDept,
    delDept,
    addDept,
    updateDept,
    listDeptExcludeChild,
    changeStatus,
    getDeptsByWhere,
} from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    name: "Dept",
    components: { Treeselect },
    data() {
        return {
            // 遮罩层
            loading: true,
            // 表格树数据
            deptList: [],
            // 部门树选项
            deptOptions: [],
            // 日期范围
            dateRange: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                sorting: "Sort",
                deptName: undefined,
                deptCode: undefined,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                // parentId: [
                //   { required: true, message: "上级部门不能为空", trigger: "blur" },
                // ],
                deptCode: [
                    { required: true, message: "部门代码不能为空", trigger: "blur" },
                ],
                deptName: [
                    { required: true, message: "部门名称不能为空", trigger: "blur" },
                ],
                sort: [
                    { required: true, message: "部门顺序不能为空", trigger: "blur" },
                ],
                phone: [
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: "请输入正确的手机号码",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询部门列表 */
        getList() {
            this.loading = true;
            listDept(this.queryParams).then((response) => {
                this.deptList = this.handleTree(response.result.items, "id");
                this.loading = false;
            });
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.dateRange = [];
            this.resetForm("queryForm");
            this.handleQuery();
        },
        /** 转换部门数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children,
            };
        },
        // 取消按钮
        cancel() {
            this.open = false;
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                id: undefined,
                parentId: undefined,
                deptName: undefined,
                deptCode: undefined,
                sort: undefined,
                leader: undefined,
                phone: undefined,
                isActive: undefined,
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            getDeptsByWhere(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
                this.deptList = this.handleTree(response.result.items, "id");
                this.loading = false;
            });
        },
        /** 新增按钮操作 */
        handleAdd(row) {
            this.reset();
            if (row != undefined) {
                this.form.parentId = row.id;
            }
            this.open = true;
            this.title = "添加部门";
            listDept(this.queryParams).then((response) => {
                this.deptOptions = this.handleTree(response.result.items, "id");
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            getDept(row.id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改部门";
            });
            listDeptExcludeChild(row.id).then((response) => {
                this.deptOptions = this.handleTree(response.result.items, "id");
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        updateDept(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        addDept(this.form).then((response) => {
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
            this.$confirm(
                '是否确认删除名称为"' + row.deptName + '"的数据项?',
                "警告",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(function () {
                    return delDept(row.id);
                })
                .then(() => {
                    this.getList();
                    this.msgSuccess("删除成功");
                })
                .catch(function () { });
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
    },
};