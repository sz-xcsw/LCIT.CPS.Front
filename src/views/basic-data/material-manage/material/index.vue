<template>
  <div class="app-container">
    <el-row :gutter="24">
      <!--分类数据-->
      <el-col :span="4" :xs="24" style="padding-left: 0px">
        <div class="head-container">
          <el-row>
            <el-col :span="24">
              <el-input
                v-model="categoryName"
                placeholder="请输入分类名称"
                clearable
                size="mini"
                prefix-icon="el-icon-search"
                style="margin-bottom: 20px"
              />
            </el-col>
          </el-row>
        </div>
        <div class="head-container">
          <el-row>
            <el-col :span="24">
              <el-tree
                :data="categoryOptions"
                :props="defaultProps"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                ref="tree"
                default-expand-all
                @node-click="handleNodeClick"
              />
            </el-col>
          </el-row>
        </div>
      </el-col>

      <el-col :span="20" :xs="24">
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
                  placeholder="请输入物料名称或物料代码"
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
              v-hasPermi="['system:material:add']"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="!multiple"
              @click="handleDelete"
              v-hasPermi="['system:material:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['system:material:import']"
              >导入</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:material:export']"
              >导出</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              v-hasPermi="['system:material:query']"
              >查询</el-button
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
            v-loading="loading"
            border
            :data="materialList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              label="物料名称"
              sortable
              align="center"
              prop="materialName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="物料代码"
              sortable
              align="center"
              prop="materialCode"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="物品分类"
              sortable
              align="center"
              prop="categoryName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="单位"
              sortable
              align="center"
              prop="unit"
              width="80"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="激活状态"
              prop="isActive"
              width="100"
              align="center"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.isActive"
                  @change="handleStatusChange(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="creationTime"
              width="160"
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
                      v-hasPermi="['system:material:edit']"
                      >修改</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-delete"
                      @click.native="handleDelete(scope.row)"
                      v-hasPermi="['system:material:remove']"
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
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      v-el-drag-dialog
      :title="title"
      :visible.sync="open"
      width="900px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="物料代码" prop="materialCode">
              <el-input
                :disabled="form.id !== undefined"
                v-model="form.materialCode"
                placeholder="请输入物料代码"
                maxlength="40"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料名称" prop="materialName">
              <el-input
                v-model="form.materialName"
                placeholder="请输入物料名称"
                maxlength="40"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料分类" prop="categoryId">
              <!--树节点禁止选择 :disable-branch-nodes="true" -->
              <treeselect
                v-model="form.categoryId"
                :options="categoryOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="请选择物料分类"
                @select="selectMaterialCategory"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="物料规格" prop="standard">
              <el-input v-model="form.standard" placeholder="请输入物料规格" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计量单位" prop="unit">
              <el-input
                v-model="form.unit"
                placeholder="请输入单位"
                maxlength="40"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="海关编码" prop="hSCode">
              <el-input
                v-model="form.hSCode"
                placeholder="请输入海关编码"
                maxlength="40"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="单价" prop="cost">
              <el-input-number
                v-model="form.cost"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="毛重" prop="grossWeight">
              <el-input-number
                v-model="form.grossWeight"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="净重" prop="netWeight">
              <el-input-number
                v-model="form.netWeight"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="长度" prop="length">
              <el-input-number
                v-model="form.length"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item> </el-col
          ><el-col :span="8">
            <el-form-item label="宽度" prop="width">
              <el-input-number
                v-model="form.width"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度" prop="hign">
              <el-input-number
                v-model="form.hign"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="保质期(天)" prop="qualityPeriod">
              <el-input-number
                v-model="form.qualityPeriod"
                controls-position="right"
                :min="0"
                style="width: 207px"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="isActive">
              <el-checkbox v-model="form.isActive">是否激活</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="isExemption">
              <el-checkbox v-model="form.isExemption">是否免检</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="isFIFO">
              <el-checkbox v-model="form.isFIFO">先进先出</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item> </el-col
        ></el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      v-el-drag-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <upload-excel-component
        :on-success="handleFileSuccess"
        :before-upload="beforeUpload"
        :download-template="downloadTemplate"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script src="./index.js"/>
