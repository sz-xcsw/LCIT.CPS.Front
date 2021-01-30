<template>
  <div class="app-container">
    <el-row :gutter="24" class="panel-row">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="关键字" prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入类型名称或代码"
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
          >新增
        </el-button>
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
          >查询</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-col>
      <el-col :span="1.5" class="top-right-btn">
        <el-button
          type="danger"
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
          v-hasPermi="['system:dict:remove']"
          >清理缓存</el-button
        >
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-table
        ref="multipleTable"
        border
        v-loading="loading"
        :data="typeList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          sortable
          label="类型名称"
          align="center"
          prop="typeName"
          :show-overflow-tooltip="true"
        />
        <!-- <el-table-column
          sortable
          label="类型代码"
          align="center"
          prop="typeCode"
          :show-overflow-tooltip="true"
        /> -->
        <el-table-column
          label="字典数据"
          align="center"
          :show-overflow-tooltip="true"
          prop="typeCode"
        >
          <template slot-scope="scope">
            <router-link
              :to="'/dictionary/dict-type/dict-data/' + scope.row.id"
              class="link-type"
            >
              <span>{{ scope.row.typeCode }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="岗位排序" sortable align="center" prop="sort" />
        <!-- <el-table-column
          label="激活状态"
          align="center"
          prop="isActive"
          :formatter="statusFormat"
        /> -->
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
        <!-- <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:dict:edit']"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:dict:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column> -->
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
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="form.typeName" placeholder="请输入字典类型名称" />
        </el-form-item>
        <el-form-item label="类型代码" prop="typeCode">
          <el-input v-model="form.typeCode" placeholder="请输入字典类型代码" />
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
  listType,
  getType,
  delType,
  addType,
  updateType,
  exportType,
  clearCache,
  changeStatus,
} from "@/api/system/dict/type";

export default {
  name: "Dict",
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
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyword: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        typeName: [
          { required: true, message: "类型名称不能为空", trigger: "blur" },
        ],
        typeCode: [
          { required: true, message: "类型代码不能为空", trigger: "blur" },
        ],
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
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      listType(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.typeList = response.result.items;
          this.total = response.result.totalCount;
          this.loading = false;
        }
      );
    },
    // 字典状态字典翻译
    // statusFormat(row, column) {
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
        typeName: undefined,
        dictType: undefined,
        status: "0",
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加字典类型";
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getType(row.id).then((response) => {
        this.form = response.result;
        this.open = true;
        this.title = "修改字典类型";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateType(this.form).then((response) => {
              if (response.success) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addType(this.form).then((response) => {
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
      this.$confirm('是否确认删除字典编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delType(ids);
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
          : this.typeList;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "字典类型",
          autoWidth: this.autoWidth,
          bookType: this.bookType,
        });
        this.$refs.multipleTable.clearSelection();
      });
    },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      clearCache().then((response) => {
        if (response.code === 200) {
          this.msgSuccess("清理成功");
        }
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
  },
};
</script>
<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>