<script setup>
import { ref, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
const t = inject('t')
const cards = ref(null)
const loading = ref(true)
onMounted(async () => {
  try { cards.value = await ApiService.getStudentInfo().then(s => s.expired_cards || []) } catch { cards.value = [] } finally { loading.value = false }
})
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageExpired') }}</div>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div class="card fade-up" v-else-if="cards && cards.length">
      <div class="list-item" v-for="(c, i) in cards" :key="i" style="cursor:default;">
        <div><div class="t">{{ c.type }}</div><div class="s">{{ t('serialNo') }}: {{ c.serial }}</div></div>
        <span class="badge warning">{{ c.expiry }}</span>
      </div>
    </div>
    <div class="empty" v-else-if="cards">{{ t('noExpiredCards') }}</div>
  </div>
</template>
