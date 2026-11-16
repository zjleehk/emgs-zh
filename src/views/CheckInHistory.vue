<script setup>
// 官方历史字段是 loc / ihe、date、time、type，不是 location / created_at
import { ref, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
const t = inject('t')
const items = ref(null)
const loading = ref(true)
const err = ref('')
onMounted(async () => {
  try { items.value = await ApiService.getCheckinHistory() }
  catch (e) { items.value = []; err.value = e?.message || String(e) }
  finally { loading.value = false }
})
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageCheckinHistory') }}</div>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div class="card fade-up" v-else-if="items && items.length">
      <div class="list-item" v-for="(it, i) in items" :key="i" style="cursor:default;">
        <div style="min-width:0;">
          <div class="t">{{ it.place || it.kind || t('pageCheckin') }}</div>
          <div class="s" v-if="it.kind || it.when">{{ [it.kind, it.when].filter(Boolean).join(' · ') }}</div>
        </div>
        <span class="badge success">✓ {{ t('checkinSuccess') }}</span>
      </div>
    </div>
    <div class="empty" v-else-if="items">{{ err || t('noCheckinHistory') }}</div>
  </div>
</template>
