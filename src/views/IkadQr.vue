<script setup>
import { ref, onMounted, inject, watchEffect } from 'vue'
import { ApiService } from '../services/api.js'
import QRCode from 'qrcode'
const t = inject('t')
const payload = ref('')
const qrDataUrl = ref('')
const loading = ref(true)
const empty = ref(false)

function genderCode(v) {
  if (v === '1' || v === 1 || v === '男') return 'Male'
  if (v === '2' || v === 2 || v === '女') return 'Female'
  return v || ''
}

onMounted(async () => {
  try {
    const pack = await ApiService.getElectronicIkad()
    const c = pack?.card
    if (!c) { empty.value = true; return }
    const address = [c.ihe_addr1, c.ihe_addr2, c.ihe_addr3].filter(Boolean).join(', ')
    const body = {
      name: c.fullname || '',
      passport: c.travel_doc_no || c.passport || '',
      nationality: c.nationality || '',
      university: c.ihe_name || '',
      gender: genderCode(c.gender),
      dob: String(c.dob || '').slice(0, 10),
      address,
    }
    Object.keys(body).forEach(k => { if (!body[k]) delete body[k] })
    if (!Object.keys(body).length) { empty.value = true; return }
    payload.value = JSON.stringify(body)
  } catch {
    empty.value = true
  } finally { loading.value = false }
})
watchEffect(async () => {
  if (payload.value) qrDataUrl.value = await QRCode.toDataURL(payload.value, { width: 240, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })
})
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageScan') }}</div>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <div class="empty" v-else-if="empty"><div style="font-size:44px; margin-bottom:14px; opacity:.5;">❗</div>{{ t('noIkad') }}</div>
    <div class="card fade-up" v-else>
      <div class="card-title">{{ t('ikadCard') }}</div>
      <p style="font-size:13.5px; color:var(--muted-foreground); margin-bottom:10px;">{{ t('pleaseShowScreen') }}</p>
      <div class="qr-box"><img :src="qrDataUrl" alt="iKAD QR" v-if="qrDataUrl"></div>
    </div>
  </div>
</template>
