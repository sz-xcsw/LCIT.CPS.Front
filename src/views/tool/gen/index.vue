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
                  icon="el-icon-postcard"
                  @click.native="openCodingPreview(scope.row)"
                  v-hasPermi="['tool:gen:edit']"
                  >生成代码</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- 生成代码表单构建 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="codingForm.title"
      :visible.sync="codingForm.open"
      width="900px"
      top="5vh"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="表名称" prop="tableName">
              <el-input
                style="width: 200px"
                disabled
                v-model="form.tableName"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="栅格布局" prop="layoutName">
              <el-select
                v-model="form.layoutName"
                filterable
                clearable
                placeholder="请选择"
                @change="handleLayoutChange"
              >
                <el-option
                  v-for="item in layoutOptions"
                  :key="item.id"
                  :label="item.layoutName"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="模块名称" prop="moduleName">
              <el-select v-model="form.moduleName" placeholder="请选择">
                <el-option
                  v-for="item in moduleNameOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="关键字段" prop="keywordColumns">
              <el-select
                v-model="form.keywordColumns"
                multiple
                placeholder="请选择"
                @change="selectChanged"
              >
                <el-option
                  v-for="item in keywordColsOptions"
                  :key="item.columnId"
                  :label="item.columnName"
                  :value="item.columnName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="表格字段" prop="tableColumns">
              <el-select
                v-model="form.tableColumns"
                multiple
                placeholder="请选择"
                @change="selectChanged"
              >
                <el-option
                  v-for="item in tableColsOptions"
                  :key="item.columnId"
                  :label="item.columnName"
                  :value="item.columnName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="表单字段" prop="formColumns">
              <el-select
                v-model="form.formColumns"
                multiple
                placeholder="请选择"
                @change="selectChanged"
              >
                <el-option
                  v-for="item in formColsOptions"
                  :key="item.columnId"
                  :label="item.columnName"
                  :value="item.columnName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="API路径" prop="apiPath">
              <el-input
                v-model="form.apiPath"
                placeholder="请输入API文件所在路径 如：@/api/system/post.js"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="字段注释" prop="summary">
              <el-input
                v-model="form.summary"
                type="textarea"
                placeholder='完成【关键字段】【表格字段】【表单字段】操作后,请在此完善中文注释。如：MaterialName:"物料名称"'
                :rows="8"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button type="info" :loading="downloadLoading" @click="exportCode"
          >导出 Zip</el-button
        > -->
        <el-button type="info" @click="previewCode">代码预览</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--生成代码展示-->
    <el-dialog
      :close-on-click-modal="false"
      :title="codingPreview.title"
      :visible.sync="codingPreview.open"
      width="80%"
      top="5vh"
      append-to-body
    >
      <el-tabs v-model="codingPreview.activeTab">
        <el-tab-pane
          v-for="(item, index) in codingPreview.data"
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
  </div>
</template>

<script>
import {
  listTable,
  generateCodes,
  delTable,
  getTableColumns,
  getModuleNames,
} from "@/api/tool/gen";
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
      // 表数据
      tableList: [],
      // 日期范围
      dateRange: "",
      // 查询参数
      queryParams: {
        tableName: undefined,
      },
      form: {
        keywordColumns: [],
        tableColumns: [],
        formColumns: [],
        moduleName: "",
        summary: "",
        apiPath: "",
      },
      // 表单校验
      rules: {
        tableName: [
          { required: true, message: "表名不能为空", trigger: "blur" },
        ],
        layoutName: [
          { required: true, message: "栅格布局不能为空", trigger: "blur" },
        ],
        keywordColumns: [
          { required: true, message: "关键字段不能为空", trigger: "blur" },
        ],
        tableColumns: [
          { required: true, message: "表格字段不能为空", trigger: "blur" },
        ],
        formColumns: [
          { required: true, message: "表格字段不能为空", trigger: "blur" },
        ],
        apiPath: [
          { required: true, message: "API路径不能为空", trigger: "blur" },
        ],
        moduleName: [
          { required: true, message: "模块名称不能为空", trigger: "blur" },
        ],
        summary: [
          {
            required: true,
            message: "请填写表字段中文注释",
            trigger: "blur",
          },
        ],
      },
      // 生成代码参数
      codingForm: {
        open: false,
        title: "生成代码参数设置",
      },
      // 生成代码
      codingPreview: {
        open: false,
        title: "生成代码",
        data: {},
        activeTab: "",
      },
      layoutOptions: [
        {
          id: 1,
          layoutName: "一行一列",
          layoutValue: "columns1",
        },
        {
          id: 2,
          layoutName: "一行两列",
          layoutValue: "columns2",
        },
        {
          id: 3,
          layoutName: "一行三列",
          layoutValue: "columns3",
        },
        {
          id: 4,
          layoutName: "一行四列",
          layoutValue: "columns4",
        },
      ],
      keywordColsOptions: [],
      tableColsOptions: [],
      formColsOptions: [],
      moduleNameOptions: [],
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
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    //生成代码参数设置
    openCodingPreview(row) {
      this.reset();
      this.codingForm.open = true;
      this.form.tableName = row.tableName;
      this.form.layoutName = "一行两列";
      this.form.layoutValue = "columns2";
      this.getTableColumns();
      this.getModuleNames();
    },
    // 取消按钮
    cancel() {
      if (this.codingPreview.open) {
        this.codingPreview.open = false;
      }
      if (this.codingForm.open) {
        this.codingForm.open = false;
      }
    },
    // 表单重置
    reset() {
      this.form = {
        keywordColumns: [],
        tableColumns: [],
        tableName: "",
        layoutName: "",
        summary: "",
      };
      this.resetForm("form");
    },
    // 导出代码
    exportCode() {
      this.downloadLoading = true;
      import("@/vendor/Export2Zip").then((zip) => {
        zip.export_code_to_zip(this.codingPreview.data);
        this.downloadLoading = false;
      });
    },
    handleLayoutChange(data) {
      this.form.layoutName = data.layoutName;
      this.form.layoutValue = data.layoutValue;
    },
    // 获取表字段
    getTableColumns() {
      getTableColumns(this.form.tableName).then((response) => {
        this.keywordColsOptions = response.result;
        this.tableColsOptions = response.result;
        this.formColsOptions = response.result;
      });
    },
    //获取模块名称
    getModuleNames() {
      getModuleNames(this.form.tableName).then((response) => {
        this.moduleNameOptions = response.result;
      });
    },
    previewCode: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.summary.indexOf('""') >= 0) {
            this.msgError("请填写字段注释!");
            return;
          }
          generateCodes(this.form).then((response) => {
            if (response.success) {
              this.codingPreview.data = response.result.items;
              this.codingPreview.open = true;
              this.codingPreview.activeTab = response.result.items[0].title;
              this.codingForm.open = false;
            }
          });
        }
      });
    },
    selectChanged(value) {
      let selectedVals = this.form.keywordColumns
        .concat(this.form.tableColumns)
        .concat(this.form.formColumns);
      let set = new Set(selectedVals);
      let arr = Array.from(set);
      let str = "";
      arr.forEach(function (v, i) {
        str += `"${v}":"",\r\n`;
      });
      this.form.summary = str;
    },
  },
};
</script>