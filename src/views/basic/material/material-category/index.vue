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
              placeholder="请输入分类代码或名称"
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
          class="filter-item"
          type="success"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:material-category:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
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
        default-expand-all
        border
        v-loading="loading"
        :data="materialCategoryList"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="categoryName"
          label="分类名称"
          sortable
        ></el-table-column>
        <el-table-column
          prop="categoryCode"
          label="分类代码"
          align="center"
          sortable
        ></el-table-column>
        <el-table-column
          prop="sort"
          label="排序"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          align="center"
        ></el-table-column>
        <el-table-column label="激活状态" align="center" prop="isActive">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isActive"
              @click.native="handleStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
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
                  icon="el-icon-edit"
                  @click.native="handleUpdate(scope.row)"
                  v-hasPermi="['system:material-category:edit']"
                  >修改</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-delete"
                  @click.native="handleDelete(scope.row)"
                  v-hasPermi="['system:material-category:remove']"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- 添加或修改物品分类对话框 -->
    <el-dialog
      v-el-drag-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col
            :span="24"
            v-if="form.parentId !== 0 && form.parentId !== null"
          >
            <el-form-item label="上级分类" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="materialCategoryOptions"
                :normalizer="normalizer"
                placeholder="选择上级分类"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分类代码" prop="categoryCode">
              <el-input
                v-model="form.categoryCode"
                placeholder="请输入分类代码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分类名称" prop="categoryName">
              <el-input
                v-model="form.categoryName"
                placeholder="请输入分类名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
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
<script src="./index.js"/>