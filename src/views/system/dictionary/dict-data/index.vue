<template>
  <div class="app-container">
    <el-row :gutter="24" class="panel-row">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="字典类型" prop="typeId">
          <el-select
            size="small"
            v-model="queryParams.typeId"
            filterable
            clearable
            style="width: 225px"
            placeholder="请选择"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.id"
              :label="item.typeName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字典数据" prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入数据名称或代码"
            clearable
            style="width: 225px"
            size="small"
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
      </el-form>
    </el-row>

    <el-row :gutter="7" class="mb8 toolBars">
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:dict:add']"
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
          v-hasPermi="['system:dict:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:dict:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >查找</el-button
        >
      </el-col>
      <el-col :span="1.5">
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
        :data="dataList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          sortable
          label="字典类型"
          align="center"
          prop="typeName"
        />
        <el-table-column
          sortable
          label="数据名称"
          align="center"
          prop="dataName"
        />
        <el-table-column
          sortable
          label="数据代码"
          align="center"
          prop="dataCode"
        />
        <el-table-column label="岗位排序" sortable align="center" prop="sort" />
        <el-table-column label="激活状态" align="center" prop="isActive">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isActive"
              @click.native="handleStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          :show-overflow-tooltip="true"
        />
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
          width="80"
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
                  v-hasPermi="['system:dept:edit']"
                  >修改</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-delete"
                  @click.native="handleDelete(scope.row)"
                  v-hasPermi="['system:dept:remove']"
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      v-el-drag-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型" prop="typeName">
          <el-select
            style="width: 380px"
            v-model="form.typeName"
            filterable
            clearable
            placeholder="请选择"
            @change="handleDictTypeChange"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.id"
              :label="item.typeName"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据名称" prop="dataName">
          <el-input v-model="form.dataName" placeholder="请输入数据名称" />
        </el-form-item>
        <el-form-item label="数据代码" prop="dataCode">
          <el-input v-model="form.dataCode" placeholder="请输入数据代码" />
        </el-form-item>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="form.sort"
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
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
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
  listData,
  getData,
  delData,
  addData,
  updateData,
  exportData,
  changeStatus,
} from "@/api/system/dict/data";
import { getDictTypes, getType } from "@/api/system/dict/type";

export default {
  name: "Data",
  data() {
    return {
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
      // 字典表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        typeId: undefined,
        keyword: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        typeName: [
          { required: true, message: "字典类型不能为空", trigger: "blur" },
        ],
        dataName: [
          { required: true, message: "数据名称不能为空", trigger: "blur" },
        ],
        dataCode: [
          { required: true, message: "数据代码不能为空", trigger: "blur" },
        ],
        sort: [
          { required: true, message: "数据排序不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    const typeId = this.$route.params && this.$route.params.typeId;
    if (typeId != undefined) {
      this.queryParams.typeId = parseInt(typeId);
    }
    this.getTypeList();
    this.getList();
  },
  methods: {
    /** 查询字典类型列表 */
    getTypeList() {
      getDictTypes().then((response) => {
        this.typeOptions = response.result.items;
      });
    },
    /** 查询字典数据列表 */
    getList() {
      this.loading = true;
      debugger;
      var ddd = this.queryParams;
      listData(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.dataList = response.result.items;
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
        typeName: "",
        dataCode: undefined,
        dataName: undefined,
        sort: 0,
        isActive: true,
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
      this.queryParams.typeId = undefined;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加字典数据";
      this.getTypeList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getData(row.id).then((response) => {
        this.form = response.result;
        this.open = true;
        this.title = "修改字典数据";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateData(this.form).then((response) => {
              if (response.success) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addData(this.form).then((response) => {
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
      this.$confirm('是否确认删除字典编码为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delData(ids);
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
          : this.dataList;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "字典数据",
          autoWidth: this.autoWidth,
          bookType: this.bookType,
        });
        this.$refs.multipleTable.clearSelection();
      });
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
    handleDictTypeChange(data) {
      this.form.typeId = data.id;
      this.form.typeName = data.typeName;
    },
  },
};
</script>