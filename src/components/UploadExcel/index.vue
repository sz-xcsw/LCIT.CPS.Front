<template>
  <div>
    <input
      ref="excel-upload-input"
      class="excel-upload-input"
      type="file"
      accept=".xlsx, .xls"
      @change="handleClick"
    />
    <div
      id="dropArea"
      class="drop"
      @drop="handleDrop"
      @dragover="handleDragover"
      @dragenter="handleDragover"
    >
      拖拽Excel文件到此处
      <el-button
        :loading="loading"
        style="margin-left: 16px"
        size="mini"
        type="primary"
        @click="handleUpload"
      >
        浏览
      </el-button>
    </div>
    <div class="el-upload__tip" slot="tip">
      <el-checkbox v-model="isUpdate" />
      是否更新已经存在的数据
      <el-link
        type="info"
        style="font-size: 12px; margin-top: 3px; float: right"
        @click="downloadTemplate"
        >下载模板</el-link
      >
    </div>
    <div class="el-upload__tip" style="color: red" slot="tip">
      提示：仅允许导入“xls”或“xlsx”或“.csv”的格式文件！
    </div>
    <ul v-if="fileName.length" class="el-upload-list el-upload-list--text">
      <li tabindex="0" class="el-upload-list__item is-ready">
        <a class="el-upload-list__item-name"
          ><i class="el-icon-document"></i>{{ fileName }}
        </a>
        <i class="el-icon-close" @click="removeFile"></i>
      </li>
    </ul>
  </div>
</template>

<script>
import XLSX from "xlsx";

export default {
  props: {
    beforeUpload: Function, // eslint-disable-line
    onSuccess: Function, // eslint-disable-line
    downloadTemplate: Function,
  },
  data() {
    return {
      fileName: "",
      isUpdate: false,
      loading: false,
      excelData: {
        headers: null,
        results: null,
        isUpdate: null,
      },
    };
  },
  methods: {
    generateData({ headers, results }) {
      this.excelData.isUpdate = this.isUpdate;
      this.excelData.headers = headers;
      results.forEach((r, i) => {
        headers.forEach((h, i) => {
          if (r[h] == undefined) {
            r[h] = "";
          }
        });
      });
      this.excelData.results = results;
      this.onSuccess && this.onSuccess(this.excelData);
    },
    handleDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      if (this.loading) return;
      const files = e.dataTransfer.files;
      if (files.length !== 1) {
        this.$message.error("最多只能上传一个文件");
        return;
      }
      const rawFile = files[0]; // only use files[0]
      if (!rawFile) return;
      if (!this.isExcel(rawFile)) {
        this.$message.error("仅支持上传后缀名为 .xlsx, .xls, .csv 的文件");
        return false;
      }
      //文件名
      this.fileName = rawFile.name;
      this.upload(rawFile);
      e.stopPropagation();
      e.preventDefault();
    },
    handleDragover(e) {
      e.stopPropagation();
      e.preventDefault();
      // 文件拖进来改变样式 拖出去恢复样式--待完善 lc
      // var dropArea = document.getElementById("dropArea");
      // dropArea.style.borderColor = "#F15A24";
      e.dataTransfer.dropEffect = "copy";
    },
    handleUpload() {
      this.$refs["excel-upload-input"].click();
    },
    handleClick(e) {
      const files = e.target.files;
      const rawFile = files[0]; // only use files[0]
      if (!rawFile) return;
      //文件名
      this.fileName = rawFile.name;
      this.upload(rawFile);
    },
    upload(rawFile) {
      this.$refs["excel-upload-input"].value = null; // fix can't select the same excel

      if (!this.beforeUpload) {
        this.readerData(rawFile);
        return;
      }
      const before = this.beforeUpload(rawFile);
      if (before) {
        this.readerData(rawFile);
      }
    },
    readerData(rawFile) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const headers = this.getHeaderRow(worksheet);
          const results = XLSX.utils.sheet_to_json(worksheet);
          this.generateData({ headers, results });
          this.loading = false;
          resolve();
        };
        reader.readAsArrayBuffer(rawFile);
      });
    },
    getHeaderRow(sheet) {
      const headers = [];
      const range = XLSX.utils.decode_range(sheet["!ref"]);
      let C;
      const R = range.s.r;
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        let hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        headers.push(hdr);
      }
      return headers;
    },
    isExcel(file) {
      return /\.(xlsx|xls|csv)$/.test(file.name);
    },
    removeFile(e) {
      this.fileName = "";
      this.isUpdate = false;
    },
  },
};
</script>

<style scoped>
.excel-upload-input {
  display: none;
  z-index: -9999;
}
.drop {
  border: 1px dashed #bbb;
  width: 360px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
  font-size: 24px;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
}
.drop:hover {
  border: 2px dashed #00a8ff;
}
</style>
