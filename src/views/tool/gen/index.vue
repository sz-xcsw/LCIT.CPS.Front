<template>
  <div class="app-container">
    <el-row :gutter="24" class="panel-row">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="表名称" prop="tableName">
          <el-input
            v-model="queryParams.tableName"
            placeholder="请输入表名称"
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
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-download"
          size="mini"
          @click="handleGenTable"
          v-hasPermi="['tool:gen:code']"
          >生成</el-button
        >
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          icon="el-icon-upload"
          size="mini"
          @click="openImportTable"
          v-hasPermi="['tool:gen:import']"
          >导入</el-button
        >
      </el-col> -->
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
        ></el-col
      >
    </el-row>

    <el-row :gutter="24">
      <el-table border :data="tableList">
        <el-table-column
          fixed="right"
          label="操作"
          width="60"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-dropdown trigger="click">
              <!-- <el-button type="info" size="small">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button> -->
              <span
                class="el-dropdown-link"
                style="color: #409eff; cursor: pointer"
                >操作<i class="el-icon-arrow-down el-icon--right"></i
              ></span>
              <el-dropdown-menu slot="dropdown" style="width: 150px">
                <!-- <el-dropdown-item
                  icon="el-icon-edit"
                  @click.native="generateFrontCode(scope.row)"
                  v-hasPermi="['tool:gen:edit']"
                  >前端代码</el-dropdown-item
                > -->
                <el-dropdown-item
                  icon="el-icon-edit"
                  @click.native="generateCSharpCode(scope.row)"
                  v-hasPermi="['tool:gen:edit']"
                  >生成代码</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index" width="50" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="表名称"
          prop="tableName"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="创建时间" prop="creationTime" align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creationTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="generateCSharpCode(scope.row)"
              v-hasPermi="['tool:gen:preview']"
              >预览</el-button
            >
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEditTable(scope.row)"
              v-hasPermi="['tool:gen:edit']"
              >编辑</el-button
            >
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['tool:gen:remove']"
              >删除</el-button
            >
            <el-button
              type="text"
              size="small"
              icon="el-icon-download"
              @click="handleGenTable(scope.row)"
              v-hasPermi="['tool:gen:code']"
              >生成代码</el-button
            >
          </template>
        </el-table-column> -->
      </el-table>
    </el-row>

    <!-- 预览界面 -->
    <el-dialog
      :title="preview.title"
      :visible.sync="preview.open"
      width="80%"
      top="5vh"
      append-to-body
    >
      <el-tabs v-model="preview.activeTab">
        <el-tab-pane
          v-for="(item, index) in preview.data"
          :label="item.title"
          :name="item.title"
          :key="index"
        >
          <pre>{{ item.content }}</pre>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" :loading="downloadLoading" @click="exportCode"
          >导出 Zip</el-button
        >
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- <import-table ref="import" @ok="handleQuery" /> -->
  </div>
</template>

<script>
import { listTable, previewTable, delTable } from "@/api/tool/gen";
import importTable from "./importTable";
import { downLoadZip } from "@/utils/zipdownload";
export default {
  name: "Gen",
  components: { importTable },
  data() {
    return {
      // 遮罩层
      loading: true,
      downloadLoading: false,
      // 唯一标识符
      uniqueId: "",
      // 选中数组
      ids: [],
      // 选中表数组
      tableNames: [],
      // 表数据
      tableList: [],
      // 日期范围
      dateRange: "",
      // 查询参数
      queryParams: {
        tableName: undefined,
      },
      // 预览参数
      preview: {
        open: false,
        title: "生成后端代码",
        data: {},
        activeTab: "",
      },
    };
  },
  created() {
    this.getList();
  },
  activated() {
    const time = this.$route.query.t;
    if (time != null && time != this.uniqueId) {
      this.uniqueId = time;
      this.resetQuery();
    }
  },
  methods: {
    /** 查询表集合 */
    getList() {
      this.loading = true;
      listTable(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.tableList = response.result.items;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 生成代码操作 */
    handleGenTable(row) {
      const tableNames = row.tableName || this.tableNames;
      if (tableNames == "") {
        this.msgError("请选择要生成的数据");
        return;
      }
      downLoadZip("/tool/gen/batchGenCode?tables=" + tableNames, "ruoyi");
    },
    /** 打开导入表弹窗 */
    openImportTable() {
      this.$refs.import.show();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 生成后端代码 */
    generateCSharpCode(row) {
      previewTable(row.tableName).then((response) => {
        this.preview.data = response.result.items;
        this.preview.open = true;
        this.preview.activeTab = response.result.items[0].title;
      });
    },
    generateFrontCode(row) {},
    /** 修改按钮操作 */
    handleEditTable(row) {
      const tableId = row.tableId || this.ids[0];
      this.$router.push("/gen/edit/" + tableId);
    },
    // 取消按钮
    cancel() {
      this.preview.open = false;
    },
    // 导出代码
    exportCode() {
      this.downloadLoading = true;
      import("@/vendor/Export2Zip").then((zip) => {
        zip.export_code_to_zip(this.preview.data);
        this.downloadLoading = false;
      });
    },
  },
};
</script>