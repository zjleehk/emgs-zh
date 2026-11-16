<script setup>
// 这里以前写死了样例号 100906323 / 55%。真实进度以 applicationStatus 为准。
import { ref, computed, onMounted, inject } from 'vue'
import { ApiService, progressOf } from '../services/api.js'
import { zhStatus } from '../services/labels.js'
const t = inject('t')
const lang = inject('lang')
const app = ref(null)
const loading = ref(true)
const err = ref('')
onMounted(async () => {
  try { app.value = await ApiService.getApplicationStatus() }
  catch (e) { err.value = e?.message || String(e) }
  finally { loading.value = false }
})
const percent = computed(() => progressOf(app.value))
const title = computed(() => zhStatus(app.value?.current_status?.label, lang?.value) || t('myApplications'))
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageApplyVisa') }}</div>
    <p class="subtitle">{{ t('applyVisaDesc') }}</p>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div v-else-if="err" class="card" style="color:#b42318; font-size:13.5px;">{{ err }}</div>
    <div class="card fade-up" v-else-if="app">
      <div class="card-title">{{ t('myApplications') }}</div>
      <div class="list-item" style="cursor:default;">
        <div style="min-width:0;">
          <div class="t">{{ title }}</div>
          <div class="s">{{ app.increment_id }}<template v-if="app.type"> · {{ app.type }}</template></div>
        </div>
        <span class="badge" :class="percent >= 100 ? 'success' : 'warning'">{{ percent }}%</span>
      </div>
    </div>
    <div class="card">
      <button class="btn" disabled>{{ t('comingSoon') }}</button>
    </div>
  </div>
</template>
