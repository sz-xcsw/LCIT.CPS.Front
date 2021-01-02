/* eslint-disable */
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export function export_code_to_zip(exportCode) {
  const zip = new JSZip();
  exportCode.forEach((item) => {
    zip.file(item.title, item.content)
  })

  zip.generateAsync({
    type: "blob"
  }).then((blob) => {
    saveAs(blob, 'ExportCode.zip')
  }, (err) => {
    alert(`导出失败! ${err}`);
  })
}
