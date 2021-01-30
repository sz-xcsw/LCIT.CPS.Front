<template>
  <div class="app-container">
    <el-row :gutter="24" class="panel-row">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        label-width="68px"
      >
        <el-row>
          <el-form-item label="关键字" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入物料名称或代码"
              clearable
              size="small"
              style="width: 225px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 225px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-row>
      </el-form>
    </el-row>

    <el-row :gutter="7" class="mb8 toolBars">
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >查询</el-button
        >
      </el-col>
      <el-col :span="1.5" class="top-right-btn">
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-table
        ref="multipleTable"
        border
        v-loading="loading"
        :data="stockInList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          label="单据编号"
          sortable
          align="center"
          prop="billNo"
        />
        <el-table-column
          label="物料名称"
          sortable
          align="center"
          prop="materialName"
        />
        <el-table-column
          label="供应商名称"
          sortable
          align="center"
          prop="supplierName"
        />
        <el-table-column
          label="库存位置"
          sortable
          align="center"
          prop="locationName"
        />
        <el-table-column label="入库数量" sortable align="center" prop="qty" />
        <el-table-column label="激活状态" align="center" prop="isActive">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isActive"
              @click.native="handleStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="creationTime"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creationTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="60"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-dropdown trigger="click">
              <span
                class="el-dropdown-link"
                style="color: #409eff; cursor: pointer"
                >操作<i class="el-icon-arrow-down el-icon--right"></i
              ></span>
              <el-dropdown-menu slot="dropdown" style="width: 150px">
                <el-dropdown-item
                  icon="el-icon-edit"
                  @click.native="handleUpdate(scope.row)"
                  >修改</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-delete"
                  @click.native="handleDelete(scope.row)"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>

    <!-- 添加或修改来料入库对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      v-el-drag-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="单据编号" prop="billNo">
              <el-input v-model="form.billNo" placeholder="请输入单据编号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="物料名称" prop="materialName">
              <el-input
                v-model="form.materialName"
                placeholder="请输入物料名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="供应商名称" prop="supplierName">
              <el-input
                v-model="form.supplierName"
                placeholder="请输入供应商名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="库存位置" prop="locationName">
              <el-input
                v-model="form.locationName"
                placeholder="请输入库存位置"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库数量" prop="qty">
              <el-input-number
                v-model="form.qty"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="isActive">
              <el-checkbox v-model="form.isActive">是否激活</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listStockIn,
  getStockIn,
  delStockIn,
  addStockIn,
  updateStockIn,
  exportStockIn,
  changeStatus,
} from "@/api/warehouse/stock-in/stockIn.js";

export default {
  name: "StockIn",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 来料入库表格数据
      stockInList: [],
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
        billNo: [
          { required: true, message: "单据编号不能为空", trigger: "blur" },
        ],
        materialName: [
          { required: true, message: "物料名称不能为空", trigger: "blur" },
        ],
        supplierName: [
          { required: true, message: "供应商名称不能为空", trigger: "blur" },
        ],
        locationName: [
          { required: true, message: "库存位置不能为空", trigger: "blur" },
        ],
        qty: [{ required: true, message: "入库数量不能为空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询来料入库列表 */
    getList() {
      this.loading = true;
      listStockIn(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.stockInList = response.result.items;
          this.total = response.result.totalCount;
          this.loading = false;
        }
      );
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
        stockInCode: undefined,
        stockInName: undefined,
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
      this.title = "添加来料入库";
      this.form.isActive = true;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      getStockIn(id).then((response) => {
        this.form = response.result;
        this.open = true;
        this.title = "修改来料入库";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateStockIn(this.form).then((response) => {
              if (response.success) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addStockIn(this.form).then((response) => {
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
      this.$confirm(
        '是否确认删除来料入库编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delStockIn(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function () {});
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
          : this.stockInList;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "来料入库数据",
          autoWidth: this.autoWidth,
          bookType: this.bookType,
        });
        this.$refs.multipleTable.clearSelection();
      });
    },
  },
};
</script>;
