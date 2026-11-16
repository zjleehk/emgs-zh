// 对照常见 EMGS 进度节点图。百分比对上当前节点，15% / 35% 单独提醒。
const STAGES = [
  { p: 5, id: 'create', cn: '开始创建学生档案', tw: '開始建立學生檔案' },
  { p: 5, id: 'school', cn: '学校审批通过', tw: '學校審批通過' },
  { p: 7, id: 'fee', cn: 'EMGS 费用已经通过审核', tw: 'EMGS 費用已經通過審核' },
  { p: 15, id: 'enter', warn: true, cn: '院校认证通过，正式进入 EMGS 审核阶段', tw: '院校認證通過，正式進入 EMGS 審核階段' },
  { p: 32, id: 'letter', cn: '学历资料审核通过，可以下载 EMGS 的批准信和 approval letter 了', tw: '學歷資料審核通過，可以下載 EMGS 的批准信和 approval letter 了' },
  { p: 35, id: 'jim', warn: true, cn: '资料已经被 EMGS 转交到移民局进行审核', tw: '資料已經被 EMGS 轉交到移民局進行審核' },
  { p: 70, id: 'eval', cn: '移民局已经完成审核，获得入境的批准，可以下载 EVAL（电子批准信）了', tw: '移民局已經完成審核，獲得入境的批准，可以下載 EVAL（電子批准信）了' },
  { p: 80, id: 'medical', cn: '入境体检无误，已上传护照到国际处', tw: '入境體檢無誤，已上傳護照到國際處' },
  { p: 85, id: 'handed', cn: 'EMGS 已经递交护照给移民局', tw: 'EMGS 已經遞交護照給移民局' },
  { p: 95, id: 'pickup', cn: '等待学校前往移民局取护照', tw: '等待學校前往移民局取護照' },
  { p: 100, id: 'done', cn: '签证工作正式完成，可以领取护照了', tw: '簽證工作正式完成，可以領取護照了' },
]

export function stageAt(percent, lang) {
  const n = Math.max(0, Math.min(100, Number(percent) || 0))
  const tw = lang !== 'zh-CN'
  const text = s => (tw ? s.tw : s.cn)
  const hit = [...STAGES].reverse().find(s => n >= s.p) || null
  const next = STAGES.find(s => s.p > n) || null
  return {
    percent: n,
    title: hit ? text(hit) : (tw ? '還沒進入第一個節點' : '还没进入第一个节点'),
    mark: hit ? hit.p : 0,
    warn: !!(hit && hit.warn),
    done: n >= 100,
    nextLabel: tw ? '下一節點' : '下一节点',
    next: next ? `${next.p}% · ${text(next)}` : '',
    note: n >= 100
      ? (tw ? '具體的領取護照時間根據學校來定，可以先跟學校確認。' : '具体的领取护照时间根据学校来定，可以先跟学校确认。')
      : '',
    warnText: tw
      ? '進度停在 15% 或 35% 時，審核很容易變黃。這通常是材料有問題，或學歷背景、學歷資料有歧義。請按 EMGS 的反饋盡快補材料、澄清。'
      : '进度停在 15% 或 35% 时，审核很容易变黄。这通常是材料有问题，或学历背景、学历资料有歧义。请按 EMGS 的反馈尽快补材料、澄清。',
  }
}
