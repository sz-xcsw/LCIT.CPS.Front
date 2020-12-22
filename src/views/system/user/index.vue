<template>
  <div class="app-container">
    <el-row :gutter="24">
      <!--部门数据-->
      <el-col :span="4" :xs="24" style="padding-left: 0px">
        <div class="head-container">
          <el-row>
            <el-col :span="24">
              <el-input
                v-model="deptName"
                placeholder="请输入部门名称"
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
                :data="deptOptions"
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
          <!--用户数据-->
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
                  placeholder="请输入用户名或手机号码"
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
              v-hasPermi="['system:user:add']"
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
              v-hasPermi="['system:user:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
              >导入</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:user:export']"
              >导出</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              v-hasPermi="['system:user:query']"
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
            height="380"
            border
            :data="userList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              label="用户名"
              sortable
              align="center"
              prop="userName"
              width="120"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="姓名"
              sortable
              align="center"
              prop="name"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="部门"
              sortable
              align="center"
              prop="deptName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="手机号码"
              align="center"
              prop="phoneNumber"
              width="120"
            />
            <el-table-column
              label="电子邮箱"
              align="center"
              prop="emailAddress"
              width="220"
            />
            <el-table-column label="激活状态" prop="isActive" align="center">
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
                      v-hasPermi="['system:user:edit']"
                      >修改</el-dropdown-item
                    >
                    <el-dropdown-item
                      icon="el-icon-delete"
                      @click.native="handleDelete(scope.row)"
                      v-hasPermi="['system:user:remove']"
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
      width="600px"
      append-to-body
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="user">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="用户名称" prop="userName">
                  <el-input
                    :disabled="form.id !== undefined"
                    v-model="form.userName"
                    placeholder="请输入用户名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户密码" prop="password">
                  <el-input
                    v-model="form.password"
                    placeholder="请输入用户密码"
                    type="password"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="用户姓名" prop="name">
                  <el-input v-model="form.name" placeholder="请输入用户姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="归属部门" prop="deptId">
                  <!--树节点禁止选择 :disable-branch-nodes="true" -->
                  <treeselect
                    v-model="form.deptId"
                    :options="deptOptions"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="请选择归属部门"
                    @select="selectDept"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="emailAddress">
                  <el-input
                    v-model="form.emailAddress"
                    placeholder="请输入邮箱"
                    maxlength="50"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phoneNumber">
                  <el-input
                    v-model="form.phoneNumber"
                    placeholder="请输入手机号码"
                    maxlength="11"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="岗位">
                  <el-select
                    v-model="form.postIds"
                    multiple
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in postOptions"
                      :key="item.postId"
                      :label="item.postName"
                      :value="item.postId"
                      :disabled="item.isActive == false"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="isActive">
                  <el-checkbox v-model="form.isActive">是否激活</el-checkbox>
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
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="角色维护" name="role">
          <el-checkbox
            v-for="(item, index) in roleOptions"
            :key="index"
            v-model="item.isChecked"
            >{{ item.displayName }}</el-checkbox
          >
        </el-tab-pane>
        <el-tab-pane label="权限维护" name="permission">
          <el-tree
            :data="menuOptions"
            show-checkbox
            ref="menu"
            default-expand-all
            node-key="id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          ></el-tree>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog
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
