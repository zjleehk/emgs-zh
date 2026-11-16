<script setup>
// 申请历史：三标签（摘要/申请历史/待办操作）——结构对照原 App
// Summary：环形进度 + e-VAL/批准信下载 + 概要字段
// Application History：状态时间轴（绿色勾）
// Required Action：问题列表
import { ref, watch, onMounted, inject, computed } from 'vue'
import { ApiService, progressOf, progressColor } from '../services/api.js'
import { scriptOf } from '../i18n/index.js'
import RingProgress from '../components/RingProgress.vue'
import StageHint from '../components/StageHint.vue'
const t = inject('t')
const lang = inject('lang')
const tab = ref('summary')
const app = ref(null)
const loading = ref(true)
const loadError = ref('')
const showZh = ref(false)
const translating = ref(false)
const trError = ref('')
const packs = ref({})
function autoOn() { return localStorage.getItem('emgs_auto_translate') !== '0' }
function setAuto(on) { localStorage.setItem('emgs_auto_translate', on ? '1' : '0') }
onMounted(async () => {
  try { app.value = await ApiService.getApplicationStatus() }
  catch (e) { app.value = null; loadError.value = e?.message || String(e) }
  finally { loading.value = false }
  if (app.value && autoOn()) {
    translating.value = true
    try { await loadPack(targetOf()); showZh.value = true }
    catch (e) { trError.value = e?.message || t('translateFail') }
    finally { translating.value = false }
  }
})
const percent = computed(() => progressOf(app.value))
const ringColor = computed(() => progressColor(app.value))
function plain(s) {
  return String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}
function targetOf() {
  return scriptOf(lang?.value)
}
function tx(s) {
  const p = plain(s)
  if (!p) return ''
  if (!showZh.value) return p
  return packs.value[targetOf()]?.[p] || p
}
function collectTexts() {
  const a = app.value
  if (!a) return []
  const set = new Set()
  const add = s => { const p = plain(s); if (p) set.add(p) }
  add(a.current_status?.label)
  add(a.status_historys?.[0]?.status_title)
  add(a.medical_status)
  add(a.insurance_card_status)
  add(a.percent_desc || a.current_status?.percent_desc)
  for (const h of a.status_historys || []) { add(h.status_title); add(h.remark) }
  for (const issue of a.application_issues || []) { add(issue.label); add(issue.status); add(issue.comment) }
  return [...set]
}
async function loadPack(target) {
  const have = packs.value[target] || {}
  const texts = collectTexts().filter(s => !have[s])
  if (!texts.length) return
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, tl: target }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.texts) throw new Error(data?.error || t('translateFail'))
  const next = { ...have }
  texts.forEach((s, i) => { next[s] = data.texts[i] || s })
  packs.value = { ...packs.value, [target]: next }
}
async function toggleTranslate() {
  if (showZh.value) { showZh.value = false; setAuto(false); trError.value = ''; return }
  setAuto(true)
  translating.value = true
  trError.value = ''
  try {
    await loadPack(targetOf())
    showZh.value = true
  } catch (e) {
    trError.value = e?.message || t('translateFail')
  } finally { translating.value = false }
}
watch(() => lang?.value, async () => {
  if (!showZh.value) return
  translating.value = true
  trError.value = ''
  try { await loadPack(targetOf()) }
  catch (e) { trError.value = e?.message || t('translateFail') }
  finally { translating.value = false }
})
const currentStatus = computed(() => tx(app.value?.current_status?.label || app.value?.status_historys?.[0]?.status_title || ''))
const downloads = computed(() => app.value?.downloads || {})
const requiredActions = computed(() => app.value?.application_issues || [])
</script>

<template>
  <div class="page-m">
    <div class="title-row">
      <div class="large-title" style="padding-bottom:0;">{{ t('pageAppHistory') }}</div>
      <button class="btn ghost small" :disabled="translating || !app" @click="toggleTranslate">{{ translating ? t('translating') : (showZh ? t('showOriginal') : t('translateBtn')) }}</button>
    </div>
    <p v-if="trError" style="color:#b42318; font-size:13px; margin:-6px 0 12px;">{{ trError }}</p>
    <!-- 三标签 -->
    <div class="tabs" role="tablist">
      <button class="tab" :class="{active: tab==='summary'}" @click="tab='summary'">{{ t('summary') }}</button>
      <button class="tab" :class="{active: tab==='history'}" @click="tab='history'">{{ t('pageAppHistory') }}</button>
      <button class="tab" :class="{active: tab==='action'}" @click="tab='action'">待办操作 ({{ requiredActions.length }})</button>
    </div>

    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div v-else-if="loadError" class="card" style="color:#b42318; font-size:13.5px; line-height:1.55;">{{ loadError }}</div>
    <div v-else-if="!app" class="empty">暂无申请数据</div>

    <!-- Summary -->
    <template v-else-if="tab==='summary' && app">
      <div class="card fade-up" style="text-align:center;">
        <RingProgress :percent="percent" :size="150" :color="ringColor" />
        <StageHint :percent="percent" />
        <div v-if="downloads.eVAL || downloads['EMGS Approval Letter'] || downloads['Supporting Letter']" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px;">
          <a v-if="downloads.eVAL" class="btn ghost small" :href="downloads.eVAL" target="_blank" rel="noopener">⬇ {{ t('eval') }}</a>
          <a v-if="downloads['EMGS Approval Letter']" class="btn ghost small" :href="downloads['EMGS Approval Letter']" target="_blank" rel="noopener">⬇ {{ t('approvalLetter') }}</a>
          <a v-if="downloads['Supporting Letter']" class="btn ghost small" :href="downloads['Supporting Letter']" target="_blank" rel="noopener">⬇ {{ t('supportingLetter') }}</a>
        </div>
      </div>
      <div class="card fade-up">
        <div class="row"><span class="k">{{ t('fullName') }}</span><span class="v">{{ app.applicant_fullname }}</span></div>
        <div class="row" v-if="app.applicant_traveldocno"><span class="k">护照号码</span><span class="v">{{ app.applicant_traveldocno }}</span></div>
        <div class="row"><span class="k">{{ t('applicationNumber') }}</span><span class="v">{{ app.increment_id }}</span></div>
        <div class="row"><span class="k">{{ t('applicationType') }}</span><span class="v">{{ app.type }}</span></div>
        <div class="row"><span class="k">{{ t('applicationStatus') }}</span><span class="v"><span class="badge" :class="percent>=100?'success':'warning'"><span class="dot"></span>{{ currentStatus }}</span></span></div>
        <div class="row" v-if="app.medical_status"><span class="k">体检状态</span><span class="v">{{ tx(app.medical_status) }}</span></div>
        <div class="row" v-if="app.insurance_card_status"><span class="k">{{ t('insuranceTab') }}</span><span class="v">{{ tx(app.insurance_card_status) }}</span></div>
      </div>
      <div class="card fade-up" v-if="app.percent_desc">
        <div class="card-title">进度说明</div>
        <p class="prose">{{ tx(app.percent_desc) }}</p>
      </div>
    </template>

    <!-- Application History 时间轴 -->
    <template v-else-if="tab==='history' && app">
      <div class="card fade-up">
        <div class="timeline">
          <div v-for="(h, i) in app.status_historys" :key="i" class="tl-item" :class="{ done: h.complete === '100', current: h.complete !== '100' && i === 0 }">
            <div class="tl-dot"></div>
            <div class="tl-title">{{ tx(h.status_title) }}</div>
            <div class="tl-remark">{{ tx(h.remark) }}</div>
            <div class="tl-date">{{ h.created_at }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- Required Action -->
    <template v-else-if="tab==='action'">
      <div class="card fade-up" v-if="requiredActions.length">
        <div v-for="(issue, i) in requiredActions" :key="i" style="padding:12px 0; border-bottom:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:650; font-size:15px;">{{ tx(issue.label) }}</div>
            <span class="badge warning">{{ tx(issue.status) }}</span>
          </div>
          <p class="prose">{{ tx(issue.comment) }}</p>
          <div style="font-size:12px; color:var(--faint-foreground); margin-top:4px;">{{ issue.updated_at }}</div>
        </div>
      </div>
      <div class="empty" v-else>没有待处理事项 🎉</div>
    </template>
  </div>
</template>

<style scoped>
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.prose { font-size: 14px; color: var(--muted-foreground); line-height: 1.7; white-space: pre-wrap; margin-top: 6px; }
</style>
