<template>
  <div class="app-container">
    <el-row :gutter="24" class="panel-row">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-row>
          <el-form-item label="关键字" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入角色名称或代码"
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
          v-hasPermi="['system:role:add']"
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
          v-hasPermi="['system:role:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
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
    </el-row>

    <el-row :gutter="24">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="roleList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          label="角色代码"
          prop="name"
          align="center"
          sortable
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="角色名称"
          prop="displayName"
          align="center"
          sortable
          :show-overflow-tooltip="true"
        />
        <el-table-column label="显示顺序" prop="sort" align="center" />
        <el-table-column label="激活状态" prop="isActive" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isActive"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="creationTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creationTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="60"
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
                  v-hasPermi="['system:role:edit']"
                  >修改</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-delete"
                  @click.native="handleDelete(scope.row)"
                  v-hasPermi="['system:role:remove']"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      v-el-drag-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色管理" name="role">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="角色代码" prop="name">
                  <el-input v-model="form.name" placeholder="请输入角色代码" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="角色名称" prop="displayName">
                  <el-input
                    v-model="form.displayName"
                    placeholder="请输入角色名称"
                  />
                </el-form-item>
              </el-col>
              <!-- <el-col :span="24">
                <el-form-item label="权限字符" prop="roleKey">
                  <el-input
                    v-model="form.roleKey"
                    placeholder="请输入权限字符"
                  />
                </el-form-item>
              </el-col> -->
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
              <el-col :span="24">
                <el-form-item label="描述" prop="description">
                  <el-input
                    v-model="form.description"
                    type="textarea"
                    placeholder="请输入内容"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
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

    <!-- 分配角色数据权限对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="openDataScope"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.displayName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="form.dataScope == 2">
          <el-tree
            :data="deptOptions"
            show-checkbox
            ref="dept"
            node-key="id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="cancelDataScope">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./index.js"/>