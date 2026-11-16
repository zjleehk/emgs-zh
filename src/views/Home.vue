<script setup>
// 首页：全部真实数据（来自 EMGS API），结构对照原 App Dashboard
// - 顶部问候 + 头像（右上角，同原 App）
// - Application Status 卡：状态文字 + 环形进度 + Summary/History 按钮
// - Submit Travel Details / Post Arrival Check In 快捷卡
// - ESSENTIALS 网格（4 个快捷入口）
import { ref, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService, progressOf, progressColor } from '../services/api.js'
import { zhStatus } from '../services/labels.js'
import { authService } from '../services/auth.js'
import UserAvatar from '../components/UserAvatar.vue'
import RingProgress from '../components/RingProgress.vue'
import StageHint from '../components/StageHint.vue'
import Notice from '../components/Notice.vue'
import ContactAuthor from '../components/ContactAuthor.vue'
const t = inject('t')
const lang = inject('lang')
const router = useRouter()
const app = ref(null)
const student = ref(null)
const loading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    const [a, s] = await Promise.allSettled([
      ApiService.getApplicationStatus(),
      ApiService.getStudentInfo(),
    ])
    const errs = []
    if (a.status === 'fulfilled') app.value = a.value
    else errs.push('进度：' + (a.reason?.message || a.reason))
    if (s.status === 'fulfilled') student.value = s.value
    else errs.push('资料：' + (s.reason?.message || s.reason))
    loadError.value = errs.join('；')
  } finally { loading.value = false }
})

const displayName = computed(() => {
  const fn = student.value?.fullname || authService.profile?.fullname
  // 原 App 显示 "Hello LI, "（取名字首词大写）
  return fn ? fn.split(' ')[0].toUpperCase() : authService.user
})
// 原 App 用 current_status.complete，不是历史里的最大值（旧申请也会是 100）
const percent = computed(() => progressOf(app.value))
const ringColor = computed(() => progressColor(app.value))
const currentStatus = computed(() => {
  const raw = app.value?.current_status?.label || app.value?.status_historys?.[0]?.status_title || ''
  return zhStatus(raw, lang?.value)
})
const downloads = computed(() => app.value?.downloads || {})
const university = computed(() => student.value?.ihe_name || authService.profile?.university || '')
const isVerified = computed(() => student.value?.is_kyc_valid === true || student.value?.val_approval_status === '01' || percent.value >= 100)
</script>

<template>
  <!-- 竖版 -->
  <div class="page-m shell-m-only">
    <!-- 顶栏：Dashboard + 头像（同原 App） -->
    <div class="dash-top">
      <div class="large-title" style="padding:0;">{{ t('pageHome') }}</div>
      <UserAvatar :size="44" />
    </div>
    <Notice />
    <div class="hello-line">{{ t('hello') }} {{ displayName }} 👋</div>

    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <template v-else>
      <div v-if="loadError" class="card" style="color:var(--danger, #b42318); font-size:13px; line-height:1.5;">{{ loadError }}</div>
      <!-- Application Status 卡 -->
      <div class="card fade-up app-status-card">
        <div class="card-title">{{ t('applicationStatus') }}</div>
        <div class="app-status-row">
          <div style="flex:1; min-width:0;">
            <div style="font-size:15px; font-weight:600; line-height:1.5;">{{ currentStatus || t('statusInProgress') }}</div>
            <div style="display:flex; gap:10px; margin-top:14px;">
              <router-link to="/application-history" style="flex:1;"><button class="btn ghost small" style="width:100%;">{{ t('summary') }}</button></router-link>
              <router-link to="/application-history" style="flex:1;"><button class="btn small" style="width:100%;">{{ t('navHistory') }}</button></router-link>
            </div>
          </div>
          <RingProgress :percent="percent" :size="110" :color="ringColor" />
        </div>
        <StageHint :percent="percent" />
      </div>

      <!-- 两大快捷卡 -->
      <router-link to="/apply-visa" class="big-action">
        <span style="font-size:24px;" aria-hidden="true">🛂</span>
        <span class="big-action-label">{{ t('submitTravelDetails') }}</span>
        <span class="chev">›</span>
      </router-link>
      <router-link to="/post-arrival-checkin" class="big-action">
        <span style="font-size:24px;" aria-hidden="true">🛡️</span>
        <span class="big-action-label">{{ t('pageCheckin') }}</span>
        <span class="chev">›</span>
      </router-link>

      <!-- ESSENTIALS -->
      <div class="section-label">{{ t('essentials') }}</div>
      <div class="ess-grid stagger">
        <router-link to="/emgs-panel-clinic" class="ess-item"><div class="pressable"><div style="font-size:22px;">📍</div><div class="qlabel">{{ t('pageClinics') }}</div></div></router-link>
        <router-link to="/notifications" class="ess-item"><div class="pressable"><div style="font-size:22px;">🔔</div><div class="qlabel">{{ t('pageNotifications') }}</div></div></router-link>
        <router-link to="/digital-id" class="ess-item"><div class="pressable"><div style="font-size:22px;">🪪</div><div class="qlabel">{{ t('pageWallet') }}</div></div></router-link>
      </div>
      <ContactAuthor />
    </template>
  </div>

  <!-- 横版 -->
  <div class="page-d shell-d-only" v-if="!loading">
    <div v-if="loadError" class="card" style="color:#b42318; font-size:13px; margin-bottom:12px;">{{ loadError }}</div>
    <div class="card fade-up app-status-card" style="margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <UserAvatar :size="48" />
        <div style="flex:1; min-width:0;">
          <div style="font-weight:650; font-size:15px;">{{ t('hello') }} {{ displayName }} 👋</div>
          <div style="font-size:13px; color:var(--muted-foreground);">{{ university }}</div>
        </div>
        <span v-if="isVerified" class="badge success"><span class="dot"></span>{{ t('verified') }}</span>
      </div>
      <Notice />
    </div>

    <div class="grid-2">
      <div class="card fade-up app-status-card">
        <div class="card-title">{{ t('applicationStatus') }}</div>
        <div class="app-status-row">
          <div style="flex:1; min-width:0;">
            <div style="font-size:15.5px; font-weight:600; line-height:1.55;">{{ currentStatus }}</div>
            <div style="font-size:13px; color:var(--muted-foreground); margin-top:6px;">{{ t('applicationNumber') }}：{{ app?.increment_id || '' }} · {{ app?.type || '' }}</div>
            <div style="display:flex; gap:10px; margin-top:16px;">
              <router-link to="/application-history" style="flex:1;"><button class="btn ghost small" style="width:100%;">{{ t('summary') }}</button></router-link>
              <router-link to="/application-history" style="flex:1;"><button class="btn small" style="width:100%;">{{ t('navHistory') }}</button></router-link>
            </div>
            <div v-if="downloads.eVAL || downloads['EMGS Approval Letter']" class="doc-row">
              <a v-if="downloads.eVAL" class="btn ghost small" :href="downloads.eVAL" target="_blank" rel="noopener">⬇ {{ t('eval') }}</a>
              <a v-if="downloads['EMGS Approval Letter']" class="btn ghost small" :href="downloads['EMGS Approval Letter']" target="_blank" rel="noopener">⬇ {{ t('approvalLetter') }}</a>
            </div>
          </div>
          <RingProgress :percent="percent" :size="130" :color="ringColor" />
        </div>
        <StageHint :percent="percent" />
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        <router-link to="/apply-visa" class="big-action"><span style="font-size:24px;">🛂</span><span class="big-action-label">{{ t('submitTravelDetails') }}</span><span class="chev">›</span></router-link>
        <router-link to="/post-arrival-checkin" class="big-action"><span style="font-size:24px;">🛡️</span><span class="big-action-label">{{ t('pageCheckin') }}</span><span class="chev">›</span></router-link>
        <div class="section-label" style="padding-top:6px;">{{ t('essentials') }}</div>
        <div class="ess-grid stagger">
          <router-link to="/emgs-panel-clinic" class="ess-item"><div class="pressable"><div style="font-size:22px;">📍</div><div class="qlabel">{{ t('pageClinics') }}</div></div></router-link>
          <router-link to="/notifications" class="ess-item"><div class="pressable"><div style="font-size:22px;">🔔</div><div class="qlabel">{{ t('pageNotifications') }}</div></div></router-link>
          <router-link to="/digital-id" class="ess-item"><div class="pressable"><div style="font-size:22px;">🪪</div><div class="qlabel">{{ t('pageWallet') }}</div></div></router-link>
        </div>
        <ContactAuthor />
      </div>
    </div>
  </div>
  <div class="page-d shell-d-only" v-if="loading">
    <div class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
  </div>
</template>

<style scoped>
.dash-top { display: flex; align-items: center; justify-content: space-between; }
.hello-line { font-size: 19px; font-weight: 650; padding: 2px 0 14px; }
.app-status-card { background: var(--card); }
.app-status-row { display: flex; align-items: center; gap: 14px; }
.big-action {
  display: flex; align-items: center; gap: 14px;
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 16px 18px; margin-bottom: 12px; text-decoration: none; color: var(--foreground);
}
.big-action-label { flex: 1; font-size: 16px; font-weight: 650; }
.chev { color: var(--faint-foreground); font-size: 22px; }
.ess-item { text-decoration: none; }
.ess-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ess-item { min-width: 0; }
.ess-item .pressable { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 12px 4px; text-align: center; min-width: 0; }
.ess-item .qlabel { display: block; font-size: 11px; line-height: 1.25; margin-top: 6px; white-space: normal; }
.doc-row { display: flex; gap: 8px; margin-top: 10px; }
.doc-row .btn { text-decoration: none; white-space: nowrap; }
</style>
