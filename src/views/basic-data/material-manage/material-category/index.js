import {
    listMaterialCategory,
    getMaterialCategory,
    delMaterialCategory,
    addMaterialCategory,
    updateMaterialCategory,
    listMaterialCategoryExcludeChild,
    changeStatus,
    getMaterialCategorysByWhere,
} from "@/api/basic-data/material-manage/material-category/materialCategory";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    name: "MaterialCategory",
    components: { Treeselect },
    data() {
        return {
            // 遮罩层
            loading: true,
            // 表格树数据
            materialCategoryList: [],
            // 物品分类树选项
            materialCategoryOptions: [],
            // 日期范围
            dateRange: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                sorting: "Sort",
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                categoryCode: [
                    { required: true, message: "物品分类代码不能为空", trigger: "blur" },
                ],
                categoryName: [
                    { required: true, message: "物品分类名称不能为空", trigger: "blur" },
                ],
                sort: [
                    { required: true, message: "部门顺序不能为空", trigger: "blur" },
                ],
            },
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询物品分类列表 */
        getList() {
            this.loading = true;
            listMaterialCategory(this.queryParams).then((response) => {
                this.materialCategoryList = this.handleTree(response.result.items, "id");
                this.loading = false;
            });
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.dateRange = [];
            this.resetForm("queryForm");
            this.handleQuery();
        },
        /** 转换物品分类数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.categoryName,
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
                categoryName: undefined,
                categoryCode: undefined,
                sort: undefined,
                remark: undefined,
                isActive: undefined,
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            getMaterialCategorysByWhere(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
                this.materialCategoryList = this.handleTree(response.result.items, "id");
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
            this.form.isActive = true;
            this.title = "添加物品分类";
            listMaterialCategory(this.queryParams).then((response) => {
                this.materialCategoryOptions = this.handleTree(response.result.items, "id");
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            getMaterialCategory(row.id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改物品分类";
            });
            listMaterialCategoryExcludeChild(row.id).then((response) => {
                this.materialCategoryOptions = this.handleTree(response.result.items, "id");
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        updateMaterialCategory(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        addMaterialCategory(this.form).then((response) => {
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
                '是否确认删除名称为"' + row.categoryName + '"的数据项?',
                "警告",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(function () {
                    return delMaterialCategory(row.id);
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