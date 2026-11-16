// 认证服务：真实登录（/api/login）+ 邮箱 OTP + 真实用户数据/头像
// 登录记在 localStorage。手机浏览器回收标签页时 sessionStorage 会丢，看起来像自己退出。
import { ref } from 'vue'

function kept(key) {
  const v = localStorage.getItem(key)
  if (v != null) return v
  const old = sessionStorage.getItem(key)
  if (old != null) localStorage.setItem(key, old)
  return old
}

const state = ref({
  loggedIn: kept('emgs_auth') === '1',
  user: kept('emgs_user') || '',
  profile: JSON.parse(kept('emgs_profile') || 'null'),
})

function persist() {
  localStorage.setItem('emgs_auth', state.value.loggedIn ? '1' : '0')
  localStorage.setItem('emgs_user', state.value.user || '')
  localStorage.setItem('emgs_profile', JSON.stringify(state.value.profile || null))
  sessionStorage.removeItem('emgs_mode')
}

function applyAuth(data) {
  state.value.loggedIn = true
  state.value.user = data.user || data.username || ''
  state.value.profile = data.profile || null
  if (data.tokens) localStorage.setItem('emgs_token', JSON.stringify(data.tokens))
  persist()
}

async function fetchProfile(tokens) {
  // 用 access token 拉真实学生信息（/api/student/info/0 由代理签名转发）
  try {
    const res = await fetch('/api/student/info/0', {
      headers: { Authorization: 'Bearer ' + JSON.stringify(tokens) },
    })
    if (!res.ok) return null
    const s = await res.json()
    let photo = s.photo || ''
    try {
      const photoRes = await fetch('/api/student/info/base64photo', { headers: { Authorization: 'Bearer ' + JSON.stringify(tokens) } })
      if (photoRes.ok) {
        const pj = await photoRes.json()
        if (pj?.photo) photo = pj.photo.startsWith('data:') ? pj.photo : `data:image/jpeg;base64,${pj.photo}`
      }
    } catch { /* 头像接口失败时用 info 里的路径 */ }
    return {
      fullname: s.fullname || s.firstname || s.email || '',
      email: s.email || '',
      university: s.ihe_name || s.university || '',
      course: s.course_name || s.course || '',
      photo,
      qr: s.qr || '',
      passport: s.passport || s.travel_doc_no || s.td_no || '',
      nationality: s.nationality || '',
      dob: s.dob || '',
      gender: s.gender === '1' || s.gender === 1 ? '男' : (s.gender === '2' || s.gender === 2 ? '女' : (s.gender || '')),
      raw: s,
    }
  } catch { return null }
}

export const authService = {
  state,
  get loggedIn() { return state.value.loggedIn },
  get user() { return state.value.user },
  get profile() { return state.value.profile },

  async refresh() {
    const raw = kept('emgs_token')
    if (!raw) return null
    let tokens
    try { tokens = JSON.parse(raw) } catch { return null }
    const profile = await fetchProfile(tokens)
    if (profile) { state.value.profile = profile; persist() }
    return profile
  },

  async login(username, password) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json().catch(() => null)
      if (data?.needOtp) return { ok: false, needOtp: true, otpToken: data.otpToken, message: data.message }
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || `登录失败：服务器返回 ${res.status}` }
      }
      applyAuth(data)
      // 登录成功后立即拉取真实头像与资料
      const profile = await fetchProfile(data.tokens)
      if (profile) { state.value.profile = profile; persist() }
      return { ok: true }
    } catch {
      return { ok: false, error: '登录服务无法连接，请稍后重试。' }
    }
  },

  async verifyOtp(otpToken, code) {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpToken, code }),
      })
      const data = await res.json().catch(() => null)
      if (data?.ok) {
        applyAuth(data)
        const profile = await fetchProfile(data.tokens)
        if (profile) { state.value.profile = profile; persist() }
        return { ok: true }
      }
      return { ok: false, error: data?.error || '验证码不正确' }
    } catch {
      return { ok: false, error: '验证服务无法连接，请稍后重试' }
    }
  },

  logout() {
    state.value = { loggedIn: false, user: '', profile: null }
    for (const key of ['emgs_auth', 'emgs_user', 'emgs_mode', 'emgs_token', 'emgs_profile']) {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    }
  },
}
