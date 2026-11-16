<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
const t = inject('t')
const clinics = ref([])
const loading = ref(true)
const err = ref('')
const q = ref('')
const here = ref(null)
const locating = ref(false)
const locMsg = ref('')
onMounted(async () => {
  try { clinics.value = await ApiService.getClinics() }
  catch (e) { clinics.value = []; err.value = e?.message || String(e) }
  finally { loading.value = false }
})
function kmBetween(a, b) {
  const r = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)))
}
function coordsOf(c) {
  const lat = Number(c.lat)
  const lng = Number(c.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) return null
  return { lat, lng }
}
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  let list = clinics.value
  if (s) list = list.filter(c => `${c.name} ${c.address}`.toLowerCase().includes(s))
  if (!here.value) return list.map(c => ({ ...c, km: null, nearest: false }))
  const ranked = list.map(c => {
    const p = coordsOf(c)
    return { ...c, km: p ? kmBetween(here.value, p) : null, nearest: false }
  }).sort((a, b) => {
    if (a.km == null && b.km == null) return 0
    if (a.km == null) return 1
    if (b.km == null) return -1
    return a.km - b.km
  })
  if (ranked[0]?.km != null) ranked[0].nearest = true
  return ranked
})
function findNearest() {
  locMsg.value = ''
  if (!navigator.geolocation) { locMsg.value = t('locFail'); return }
  if (!clinics.value.some(c => coordsOf(c))) { locMsg.value = t('noCoords'); return }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    pos => {
      here.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      locating.value = false
    },
    e => {
      locating.value = false
      locMsg.value = e.code === 1 ? t('locDenied') : t('locFail')
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
  )
}
function formatKm(km) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
function mapUrl(c, kind) {
  const lat = Number(c.lat)
  const lng = Number(c.lng)
  const has = Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng)
  const qtext = encodeURIComponent([c.name, c.address].filter(Boolean).join(' '))
  if (kind === 'amap') {
    if (has) return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(c.name || '')}`
    return `https://uri.amap.com/search?keyword=${qtext}`
  }
  if (has) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${qtext}`
}
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageClinics') }}</div>
    <p class="subtitle">{{ t('panelClinicDesc') }}</p>
    <input class="input" v-model="q" :placeholder="t('clinicSearch')">
    <button class="btn near-btn" type="button" :disabled="locating || loading" @click="findNearest">{{ locating ? t('locating') : t('findNearest') }}</button>
    <p v-if="locMsg" class="loc-msg">{{ locMsg }}</p>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div v-else-if="shown.length" class="stagger">
      <div class="card clinic" v-for="(c, i) in shown" :key="c.clinic_id || c.id || i" :class="{ nearest: c.nearest }">
        <div class="clinic-head">
          <div class="clinic-name">{{ c.name }}</div>
          <span v-if="c.nearest" class="badge success">{{ t('nearest') }}</span>
          <span v-else-if="c.km != null" class="km">{{ formatKm(c.km) }}</span>
        </div>
        <div class="clinic-addr" v-if="c.address">{{ c.address }}</div>
        <div class="clinic-addr" v-if="c.nearest && c.km != null">{{ formatKm(c.km) }}</div>
        <div class="clinic-maps">
          <a class="btn ghost small" :href="mapUrl(c, 'amap')" target="_blank" rel="noopener">{{ t('mapAmap') }}</a>
          <a class="btn ghost small" :href="mapUrl(c, 'google')" target="_blank" rel="noopener">{{ t('mapGoogle') }}</a>
        </div>
      </div>
    </div>
    <div class="empty" v-else>{{ err || (q ? t('noClinicMatch') : '暂无诊所数据') }}</div>
  </div>
</template>

<style scoped>
.near-btn.btn { width: 100%; margin: 14px 0 26px; border-radius: 14px; }
.clinic.nearest { border-color: var(--success); }
.clinic-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.clinic-name { font-weight: 650; font-size: 15.5px; line-height: 1.35; min-width: 0; }
.km { flex-shrink: 0; font-size: 13px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.loc-msg { font-size: 13px; color: var(--danger); margin: -4px 0 12px; line-height: 1.45; }
.clinic-addr { font-size: 13px; color: var(--muted-foreground); margin-top: 6px; line-height: 1.45; }
.clinic-maps { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.clinic-maps .btn { text-decoration: none; }
</style>
