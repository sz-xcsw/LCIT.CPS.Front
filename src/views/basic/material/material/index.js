import {
    listMaterial,
    getMaterial,
    delMaterial,
    addMaterial,
    updateMaterial,
    changeStatus,
    importMaterial,
} from "@/api/basic-data/material-manage/material/material.js";
import { treeselect } from "@/api/basic-data/material-manage/material-category/materialCategory.js";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import UploadExcelComponent from "@/components/UploadExcel/index.vue";
export default {
    name: "Material",
    components: { Treeselect, UploadExcelComponent },
    data() {
        return {
            activeTab: "material",
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
            // 物料表格数据
            materialList: null,
            // 物品分类
            categoryName: undefined,
            // 弹出层标题
            title: "",
            // 物料分类树选项
            categoryOptions: undefined,
            // 是否显示弹出层
            open: false,
            // 默认密码
            initPassword: undefined,
            // 日期范围
            dateRange: [],
            // 表单参数
            form: {},
            defaultProps: {
                children: "children",
                label: "label",
            },
            // 物料导入参数
            upload: {
                // 是否显示弹出层（物料导入）
                open: false,
                // 弹出层标题（物料导入）
                title: "",
                //导入的数据
                importData: {},
            },
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                keyword: undefined,
                categoryId: undefined,
            },
            // 表单校验
            rules: {
                materialName: [
                    { required: true, message: "物料名称不能为空", trigger: "blur" },
                ],
                materialCode: [
                    { required: true, message: "物料代码不能为空", trigger: "blur" },
                ],
                categoryId: [
                    { required: true, message: "物料分类不能为空", trigger: "blur" },
                ],
                unit: [
                    { required: true, message: "计量单位不能为空", trigger: "blur" },
                ],
            },
        };
    },
    watch: {
        // 根据名称筛选物料分类树
        categoryName(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.getList();
        this.getMaterialCategoryTreeselect();
    },
    methods: {
        /** 查询物料列表 */
        getList() {
            this.loading = true;
            listMaterial(this.addDateRange(this.queryParams, this.dateRange)).then(
                (response) => {
                    this.materialList = response.result.items;
                    this.total = response.result.totalCount;
                    this.loading = false;
                }
            );
        },
        selectMaterialCategory(val) {
            this.form.categoryName = val.label;
        },
        /** 查询物料分类下拉树结构 */
        getMaterialCategoryTreeselect() {
            treeselect().then((response) => {
                this.categoryOptions = response.result.items;
            });
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.queryParams.categoryId = data.id;
            this.getList();
        },
        //状态修改
        handleStatusChange(row) {
            let text = row.isActive ? "启用" : "停用";
            this.$confirm(
                '确认要' + text + row.materialName + '物料吗?',
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
            this.form = {
                id: undefined,
                categoryId: undefined,
                materialName: undefined,
                materialCode: undefined,
                isActive: undefined,
                remark: undefined,
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.page = 1;
            this.getList();
        },
        /** 转换物料分类数据结构 */
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
            this.getMaterialCategoryTreeselect();
            this.open = true;
            this.title = "添加物料";
            this.form.isActive = true;
            this.form.isExemption = true;
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.getMaterialCategoryTreeselect();
            const id = row.id || this.ids;
            this.$nextTick(() => {

            });
            getMaterial(id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改物料";
                this.form.password = "";
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        updateMaterial(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        addMaterial(this.form).then((response) => {
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
            this.$confirm('是否确认删除物料编号为"' + ids + '"的数据项?', "警告", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(function () {
                    return delMaterial(ids);
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
                    : this.materialList;
                const data = this.formatJson(filterVal, list);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "物料数据",
                    autoWidth: this.autoWidth,
                    bookType: this.bookType,
                });
                this.$refs.multipleTable.clearSelection();
            });
        },
        /** 导入按钮操作 */
        handleImport() {
            this.upload.title = "物料导入";
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
                    filename: "物料数据模板",
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
                    if (h === "物料名称") {
                        r.materialName = r[h];
                    }
                    if (h === "物料代码") {
                        r.materialCode = r[h];
                    }
                    if (h === "物品分类") {
                        r.categoryName = r[h];
                    }
                    if (h === "单位") {
                        r.unit = r[h];
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
            importMaterial(this.upload.importData).then((response) => {
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