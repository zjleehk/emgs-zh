<script setup>
// 进度按官方 App：checkInHistory 里出现对应 type 才算完成，不再写死。
import { ref, computed, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
const t = inject('t')
const loading = ref(true)
const err = ref('')
const items = ref([])
const STEPS = [
  { type: 'isac', title: 'isacFull' },
  { type: 'airport_liaison', title: 'irFull' },
  { type: 'iso', title: 'isoFull' },
]
onMounted(async () => {
  try { items.value = await ApiService.getCheckinHistory() }
  catch (e) { items.value = []; err.value = e?.message || String(e) }
  finally { loading.value = false }
})
const doneTypes = computed(() => new Set(items.value.map(it => it.type).filter(Boolean)))
const steps = computed(() => STEPS.map(s => ({ ...s, done: doneTypes.value.has(s.type) })))
const doneCount = computed(() => steps.value.filter(s => s.done).length)
const clinicCount = computed(() => {
  const list = items.value
  let n = 0
  if (list.some(it => it.type === 'clinic_room')) n++
  if (list.some(it => it.type === 'xray_room')) n++
  const clinic = list.filter(it => it.type === 'clinic').length
  const face = list.filter(it => it.type === 'clinic_undertaking' && (it.face_match === 1 || it.face_match === '1' || it.face_match === true)).length
  if (clinic >= 1 && face >= 1) n++
  return Math.min(3, n)
})
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageCheckin') }}</div>
    <p class="subtitle">{{ t('completeCheckins') }}</p>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <template v-else>
      <p v-if="err" class="card" style="color:#b42318; font-size:13.5px;">{{ err }}</p>
      <div class="card fade-up">
        <div class="card-title">{{ t('checkinProcess') }} · {{ doneCount }}/3</div>
        <div class="timeline">
          <div v-for="(s, i) in steps" :key="s.type" class="tl-item" :class="{ done: s.done, current: !s.done && steps.slice(0, i).every(x => x.done) }">
            <div class="tl-dot"></div>
            <div class="tl-title">{{ t(s.title) }}</div>
            <div class="tl-date"><span class="badge" :class="s.done ? 'success' : 'warning'">{{ s.done ? t('checkinSuccess') : t('pending') }}</span></div>
          </div>
        </div>
      </div>
      <div class="card fade-up">
        <div class="card-title">{{ t('pageClinics') }} · {{ clinicCount }}/3</div>
        <p style="font-size:14px; color:var(--muted-foreground); line-height:1.6;">{{ t('completeCheckins') }}</p>
      </div>
      <router-link to="/checkin-history"><button class="btn secondary">{{ t('pageCheckinHistory') }}</button></router-link>
    </template>
  </div>
</template>
