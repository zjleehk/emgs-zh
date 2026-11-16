<script setup>
import { ref, watch, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
import { scriptOf } from '../i18n/index.js'
const t = inject('t')
const lang = inject('lang')
const list = ref(null)
const loading = ref(true)
const err = ref('')
const showZh = ref(false)
const translating = ref(false)
const trError = ref('')
const packs = ref({})
function autoOn() { return localStorage.getItem('emgs_auto_translate') !== '0' }
function setAuto(on) { localStorage.setItem('emgs_auto_translate', on ? '1' : '0') }
onMounted(async () => {
  try {
    const r = await ApiService.getNotifications()
    list.value = Array.isArray(r) ? r : []
  } catch (e) { list.value = []; err.value = e?.message || String(e) } finally { loading.value = false }
  if (list.value?.length && autoOn()) {
    translating.value = true
    try { await loadPack(targetOf()); showZh.value = true }
    catch (e) { trError.value = e?.message || t('translateFail') }
    finally { translating.value = false }
  }
})
function plain(s) {
  return String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}
function targetOf() { return scriptOf(lang?.value) }
function tx(s) {
  const p = plain(s)
  if (!p) return ''
  if (!showZh.value) return p
  return packs.value[targetOf()]?.[p] || p
}
function collectTexts() {
  const set = new Set()
  for (const n of list.value || []) {
    const title = plain(n.title)
    const alert = plain(n.alert)
    if (title) set.add(title)
    if (alert) set.add(alert)
  }
  return [...set]
}
async function loadPack(target) {
  const have = packs.value[target] || {}
  const texts = collectTexts().filter(s => !have[s])
  if (!texts.length) return
  const next = { ...have }
  for (let i = 0; i < texts.length; i += 30) {
    const slice = texts.slice(i, i + 30)
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: slice, tl: target }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.texts) throw new Error(data?.error || t('translateFail'))
    slice.forEach((s, j) => { next[s] = data.texts[j] || s })
  }
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
</script>

<template>
  <div class="page-m">
    <div class="title-row">
      <div class="large-title" style="padding-bottom:0;">{{ t('pageNotifications') }}</div>
      <button class="btn ghost small" :disabled="translating || !list?.length" @click="toggleTranslate">{{ translating ? t('translating') : (showZh ? t('showOriginal') : t('translateBtn')) }}</button>
    </div>
    <p v-if="trError" style="color:#b42318; font-size:13px; margin:-6px 0 12px;">{{ trError }}</p>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div v-else-if="list && list.length" class="stagger">
      <div class="card" v-for="n in list" :key="n.notification_id + n.date" style="display:flex; gap:12px; align-items:flex-start;" :style="!n.is_read ? 'border-left:3px solid var(--accent);' : ''">
        <span class="unread-mark" v-if="!n.is_read" style="margin-top:7px;" aria-hidden="true"></span>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="font-weight:600; font-size:15.5px;">{{ tx(n.title) }}</div>
            <span class="badge info" v-if="!n.is_read">{{ t('newBadge') }}</span>
          </div>
          <p class="prose">{{ tx(n.alert) }}</p>
          <div style="font-size:12px; color:var(--faint-foreground); margin-top:7px;">{{ n.from }} · {{ n.date }}</div>
        </div>
      </div>
    </div>
    <div class="empty" v-else>{{ err || t('noNotifications') }}</div>
  </div>
</template>

<style scoped>
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.prose { font-size: 14px; color: var(--muted-foreground); margin-top: 6px; line-height: 1.6; white-space: pre-wrap; }
</style>
