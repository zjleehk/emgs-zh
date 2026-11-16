// API：经本站代理 /api/* 访问 EMGS。字段对齐 EMGS Hub 1.0.10 前端
// （current_status / status_history），并兼容旧样例 status_historys。
const EMGS_ORIGIN = 'https://mycas.educationmalaysia.gov.my'

function resolvePhoto(photo) {
  if (!photo) return ''
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo
  return EMGS_ORIGIN + (photo.startsWith('/') ? photo : '/' + photo)
}

function tokenHeader() {
  const tok = localStorage.getItem('emgs_token') || sessionStorage.getItem('emgs_token')
  if (!tok) return {}
  return { Authorization: 'Bearer ' + tok, Accept: 'application/json' }
}

async function apiGet(path) {
  const res = await fetch(path, { headers: tokenHeader() })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = null }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || (text || '').replace(/\s+/g, ' ').slice(0, 180) || `HTTP ${res.status}`
    throw new Error(msg)
  }
  if (data == null) {
    const snippet = (text || '').replace(/\s+/g, ' ').slice(0, 160)
    throw new Error(snippet || '空响应')
  }
  return data
}

function asList(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== 'object') return []
  for (const key of ['data', 'items', 'clinic', 'clinics', 'history', 'notifications', 'records']) {
    if (Array.isArray(raw[key])) return raw[key]
  }
  const vals = Object.values(raw)
  if (vals.length && vals.every(v => v && typeof v === 'object' && !Array.isArray(v))) return vals
  return []
}

function historyList(raw) {
  const src = raw.status_history ?? raw.status_historys
  if (Array.isArray(src)) return src
  if (src && typeof src === 'object') {
    return Object.entries(src).map(([status, v]) => (
      v && typeof v === 'object' ? { status, ...v } : { status, remark: String(v ?? '') }
    ))
  }
  return []
}

export function normalizeApplication(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw
  const cur = raw.current_status && typeof raw.current_status === 'object' ? raw.current_status : null
  const history = historyList(raw).map(h => ({
    ...h,
    status_title: h.status_title || h.label || h.status || '',
    remark: h.remark || '',
    complete: h.complete ?? '',
    created_at: h.created_at || '',
  }))
  return {
    ...raw,
    type: raw.type || raw.application_type || '',
    percent_desc: raw.percent_desc || cur?.percent_desc || '',
    current_status: cur,
    status_historys: history,
  }
}

export function progressOf(app) {
  const cur = app?.current_status
  if (cur) {
    if (cur.code === 'medical_appeal') return 100
    const n = parseInt(cur.complete, 10)
    if (!Number.isNaN(n)) return n
  }
  const h = app?.status_historys
  if (h?.length) return parseInt(h[0].complete, 10) || 0
  return 0
}

export function progressColor(app) {
  const c = app?.current_status?.progress_color || app?.status_historys?.[0]?.progress_color
  if (!c) return ''
  const s = String(c).replace('#', '')
  return /^[0-9a-fA-F]{3,8}$/.test(s) ? '#' + s : ''
}

function normalizeNotifications(raw) {
  return asList(raw).map(n => ({
    ...n,
    title: n.title || n.data?.title || '',
    alert: n.alert || n.data?.alert || '',
    from: n.from || n.data?.from || '',
    date: n.date || n.sent_at || '',
    picture: n.picture || n.data?.picture || '',
  }))
}

function normalizeClinics(raw) {
  const list = Array.isArray(raw) ? raw : (raw?.clinic || raw?.clinics || raw?.data || asList(raw))
  return (Array.isArray(list) ? list : []).map(c => ({
    ...c,
    name: c.name || c.clinic_name || '',
    address: c.full_address || c.address || c.clinic_add || '',
    phone: c.phone || c.telephone || c.clinic_phone || '',
    lat: c.lat ?? c.clinic_latitude ?? c.latitude ?? '',
    lng: c.lng ?? c.clinic_longitude ?? c.longitude ?? '',
  }))
}

const CHECKIN_KIND = {
  clinic_undertaking: '诊所前台',
  clinic_room: '诊室',
  xray_room: 'X 光室',
  iso: '国际学生办公室',
  isac: '入境抵达中心',
  airport_liaison: '院校代表',
}

function normalizeCheckins(raw) {
  return asList(raw).map(it => ({
    ...it,
    place: it.loc || it.ihe || it.location || it.clinic_name || '',
    when: [it.date, it.time].filter(Boolean).join(' ') || it.created_at || '',
    kind: CHECKIN_KIND[it.type] || '',
  }))
}

function pickActiveIkad(wallet) {
  const tokens = wallet?.balance?.tokens || []
  for (const group of tokens) {
    for (const nft of group?.nfts || []) {
      const status = String(nft?.credential?.internal_status || '')
      const issuer = String(nft?.credential?.issuer || '')
      if ((status === 'Active' || status === 'active') && (issuer === 'ikad' || issuer === 'iKAD')) {
        let props = nft?.metadata?.properties
        if (typeof props === 'string') {
          try { props = JSON.parse(props) } catch { props = null }
        }
        if (props && typeof props === 'object') return props
      }
    }
  }
  return null
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { ...tokenHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = null }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

async function loadElectronicIkad() {
  const [toggle, legacy] = await Promise.allSettled([
    apiGet('/api/cms/blocks/ma-ikad-toggle/store/mycas'),
    apiGet('/api/student/ikad'),
  ])
  let useTunnel = true
  if (toggle.status === 'fulfilled') {
    try {
      const raw = toggle.value?.['ma-ikad-toggle']?.content
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (parsed && parsed['smart-tunnel-ikad'] === false) useTunnel = false
    } catch { /* 开关读不到时仍走电子卡接口 */ }
  }
  let card = null
  if (useTunnel) {
    try {
      card = pickActiveIkad(await apiPost('/api/student/smartAppTunnel', { resource: 'wallets/{userId}' }))
    } catch { card = null }
  }
  const raw = legacy.status === 'fulfilled' ? legacy.value : null
  const row = Array.isArray(raw) ? raw[0] : (raw && typeof raw === 'object' ? raw : null)
  const images = row?.front_url && row?.back_url ? { front: row.front_url, back: row.back_url } : null
  if (!card && row && (row.fullname || row.ikad_serial || row.serial_id)) card = row
  return { card, images }
}

export const ApiService = {
  resolvePhoto,
  progressOf,
  progressColor,
  async getStudentInfo() { return apiGet('/api/student/info/0') },
  async getApplicationStatus() { return normalizeApplication(await apiGet('/api/student/applicationStatus')) },
  async getCheckinHistory() { return normalizeCheckins(await apiGet('/api/student/checkInHistory')) },
  async getClinics() { return normalizeClinics(await apiGet('/api/emgs/clinics')) },
  async getNotifications() { return normalizeNotifications(await apiGet('/api/student/notification')) },
  async getIkad() { return apiGet('/api/student/ikad') },
  async getElectronicIkad() { return loadElectronicIkad() },
  async getBase64Photo() { return apiGet('/api/student/info/base64photo') },
  async canCheckIn() { return apiGet('/api/student/canCheckIn') },
  async getSmartAppTunnel() { return apiGet('/api/student/smartAppTunnel') },
  async getPreEntryUrl() { return apiGet('/api/preEntryUrl') },
}
