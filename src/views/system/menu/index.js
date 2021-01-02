import {
    listMenu,
    getMenu,
    delMenu,
    addMenu,
    updateMenu,
    changeStatus,
} from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
    name: "Menu",
    components: { Treeselect, IconSelect },
    data() {
        return {
            // 遮罩层
            loading: true,
            // 菜单表格树数据
            menuList: [],
            // 菜单树选项
            menuOptions: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 日期范围
            dateRange: [],
            // 显示状态数据字典
            visibleOptions: [],
            // 菜单状态数据字典
            statusOptions: [],
            // 查询参数
            queryParams: {
                keyword: undefined,
                visible: undefined,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                menuName: [
                    { required: true, message: "菜单名称不能为空", trigger: "blur" },
                ],
                menuCode: [
                    { required: true, message: "菜单代码不能为空", trigger: "blur" },
                ],
                orderNum: [
                    { required: true, message: "菜单顺序不能为空", trigger: "blur" },
                ],
                path: [
                    { required: true, message: "路由路径不能为空", trigger: "blur" },
                ],
                component: [
                    { required: true, message: "组件路径不能为空", trigger: "blur" },
                ],
            },
        };
    },
    created() {
        this.getList();
        // this.getDicts("sys_show_hide").then(response => {
        //   this.visibleOptions = response.data;
        // });
        // this.getDicts("sys_normal_disable").then(response => {
        //   this.statusOptions = response.data;
        // });
    },
    filters: {
        formatDate(date) {
            if (!date) {
                return "";
            }
            var dateee = new Date(date).toJSON();
            return new Date(+new Date(dateee) + 8 * 3600 * 1000)
                .toISOString()
                .replace(/T/g, " ")
                .replace(/\.[\d]{3}Z/, "");
        },
    },
    methods: {
        // 选择图标
        selected(name) {
            this.form.icon = name;
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            listMenu(this.addDateRange(this.queryParams, this.dateRange)).then((response) => {
                this.menuList = this.handleTree(response.result, "id");
                this.loading = false;
            });
        },
        /** 转换菜单数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.id,
                label: node.menuName,
                children: node.children,
            };
        },
        /** 查询菜单下拉树结构 */
        getTreeselect() {
            listMenu().then((response) => {
                this.menuOptions = [];
                const menu = { id: 0, menuName: "主类目", children: [] };
                menu.children = this.handleTree(response.result, "id");
                this.menuOptions.push(menu);
            });
        },
        // 显示状态字典翻译
        // visibleFormat(row, column) {
        //   if (row.menuType == "F") {
        //     return "";
        //   }
        //   return this.selectDictLabel(this.visibleOptions, row.visible);
        // },
        // // 菜单状态字典翻译
        // statusFormat(row, column) {
        //   if (row.menuType == "F") {
        //     return "";
        //   }
        //   return this.selectDictLabel(this.statusOptions, row.status);
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
                parentId: 0,
                menuName: undefined,
                menuCode: undefined,
                icon: undefined,
                menuType: "Dir",
                orderNum: undefined,
                isActive: true,
                // visible: true,
                // status: true,
            };
            this.resetForm("form");
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.getList();
        },
        resetQuery() {
            this.dateRange = [];
            this.resetForm("queryForm");
            this.handleQuery();
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.getTreeselect();
            this.form.isActive = true;
            this.open = true;
            this.title = "添加菜单";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.getTreeselect();
            getMenu(row.id).then((response) => {
                this.form = response.result;
                this.open = true;
                this.title = "修改菜单";
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    if (this.form.id != undefined) {
                        updateMenu(this.form).then((response) => {
                            if (response.success) {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            }
                        });
                    } else {
                        addMenu(this.form).then((response) => {
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
                '是否确认删除名称为"' + row.menuName + '"的数据项?',
                "警告",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(function () {
                    return delMenu(row.id);
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
            });
        },
    },
};