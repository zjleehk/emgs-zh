// 官方状态原文保留在接口里。界面只翻译已经对过的句子，对不上就仍显示英文，不编。
const STATUS_CN = {
  'Supporting Letter Provided to Institution': '支持信已发给院校',
  'Application Received by EMGS': 'EMGS 已收到申请',
  'Application completed': '申请已完成',
  'Student Pass Issued by immigration': '移民局已签发学生准证',
  'In Progress with EMGS': 'EMGS 处理中',
  'Document checking in progress': '文件审核中',
  'Student Record Created': '学生档案已建立',
  'Pending additional document from institution': '等待院校补交材料',
  'Medical Screening Not Attended': '尚未完成体检',
  'New insurance created': '新保险已生成',
}

const STATUS_TW = {
  'Supporting Letter Provided to Institution': '支持信已發給院校',
  'Application Received by EMGS': 'EMGS 已收到申請',
  'Application completed': '申請已完成',
  'Student Pass Issued by immigration': '移民局已簽發學生准證',
  'In Progress with EMGS': 'EMGS 處理中',
  'Document checking in progress': '文件審核中',
  'Student Record Created': '學生檔案已建立',
  'Pending additional document from institution': '等待院校補交材料',
  'Medical Screening Not Attended': '尚未完成體檢',
  'New insurance created': '新保險已生成',
}

export function zhStatus(text, lang) {
  if (!text) return ''
  const table = lang === 'zh-CN' ? STATUS_CN : STATUS_TW
  return table[text] || text
}
