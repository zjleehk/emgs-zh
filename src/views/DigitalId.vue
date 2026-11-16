<script setup>
// 证件包。电子 iKAD 走官方两条路：smart tunnel 的证件字段，或正反面图片。
import { ref, computed, onMounted, inject } from 'vue'
import { ApiService } from '../services/api.js'
const t = inject('t')
const tab = ref('ikad')
const card = ref(null)
const images = ref(null)
const flipped = ref(false)
const insurance = ref(null)
const certs = ref(null)
const loading = ref(true)

function photoOf(c) {
  const p = c?.photo || ''
  if (!p) return ''
  if (p.startsWith('data:') || p.startsWith('http')) return p
  return `data:image/jpeg;base64,${p}`
}
function genderOf(v) {
  if (v === '1' || v === 1 || v === 'Male') return '男'
  if (v === '2' || v === 2 || v === 'Female') return '女'
  return v || ''
}
function dayOf(v) {
  return String(v || '').slice(0, 10)
}
function addressOf(c) {
  return [c?.ihe_addr1, c?.ihe_addr2, c?.ihe_addr3, c?.ihe_postcode, c?.ihe_city, c?.ihe_state].filter(Boolean).join(', ')
}

const photo = computed(() => photoOf(card.value))
const rows = computed(() => {
  const c = card.value
  if (!c) return []
  return [
    ['fullName', c.fullname],
    ['passportNumber', c.travel_doc_no || c.passport],
    ['nationality', c.nationality],
    ['dob', dayOf(c.dob)],
    ['gender', genderOf(c.gender)],
    ['ikadRef', c.student_pass_number || c.referanceNo],
    ['university', c.ihe_name],
    ['ikadAddress', addressOf(c)],
    ['serialNo', c.serial_id || c.ikad_serial || c.serial],
    ['expiryDate', dayOf(c.ikad_expired_on || c.expiry || c.expired_on)],
  ].filter(([, v]) => v)
})
const hasCard = computed(() => rows.value.length > 0)
const hasImages = computed(() => !!(images.value?.front && images.value?.back))

onMounted(async () => {
  try {
    const [ikad, student] = await Promise.allSettled([
      ApiService.getElectronicIkad(),
      ApiService.getStudentInfo(),
    ])
    if (ikad.status === 'fulfilled') {
      card.value = ikad.value?.card || null
      images.value = ikad.value?.images || null
    }
    if (student.status === 'fulfilled') {
      const r = student.value?.raw || student.value || {}
      insurance.value = r.insurance ? { policy_number: r.insurance, start: r.insurance_started_on, expiry: r.expired_on } : null
      certs.value = []
    }
  } finally { loading.value = false }
})
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageWallet') }}</div>
    <div v-if="loading" class="empty"><div class="spinner"></div>{{ t('loading') }}</div>
    <template v-else>
      <div class="tabs" role="tablist">
        <button class="tab" :class="{active: tab==='ikad'}" @click="tab='ikad'">i-kad</button>
        <button class="tab" :class="{active: tab==='insurance'}" @click="tab='insurance'">{{ t('insuranceTab') }}</button>
        <button class="tab" :class="{active: tab==='certs'}" @click="tab='certs'">{{ t('certsTab') }}</button>
      </div>

      <template v-if="tab==='ikad'">
        <div v-if="hasCard" class="ikad-wrap fade-up">
          <button type="button" class="flip-hit" @click="flipped = !flipped" :aria-label="t('ikadFlip')">
            <div class="flip" :class="{ flipped }">
              <div class="face front">
                <div class="ikad-top">
                  <span>{{ t('ikadDigital') }}</span>
                  <span class="badge light">{{ t('ikadFront') }}</span>
                </div>
                <div class="ikad-body">
                  <img v-if="photo" class="portrait" :src="photo" alt="">
                  <div class="ikad-fields">
                    <div v-for="[k, v] in rows" :key="k"><span>{{ t(k) }}</span>{{ v }}</div>
                  </div>
                </div>
              </div>
              <div class="face back">
                <div class="ikad-top">
                  <span>{{ t('ikadIssuer') }}</span>
                  <span class="badge light">{{ t('ikadBack') }}</span>
                </div>
                <div class="issuer">Education Malaysia Global Services</div>
                <div v-if="card.serial_id || card.ikad_serial" class="docid">{{ t('ikadDocId') }}：{{ card.serial_id || card.ikad_serial }}</div>
                <div class="hint">{{ t('ikadTapFlip') }}</div>
              </div>
            </div>
          </button>
          <router-link to="/ikad-qr"><button class="btn" style="width:100%; margin-top:12px;">{{ t('shareForVerification') }}</button></router-link>
        </div>
        <div v-else-if="hasImages" class="ikad-wrap fade-up">
          <button type="button" class="flip-hit" @click="flipped = !flipped" :aria-label="t('ikadFlip')">
            <div class="flip" :class="{ flipped }">
              <div class="face front pic"><img :src="images.front" alt="iKAD front"></div>
              <div class="face back pic"><img :src="images.back" alt="iKAD back"></div>
            </div>
          </button>
          <p class="hint center">{{ t('ikadTapFlip') }}</p>
        </div>
        <div class="empty" v-else><div style="font-size:44px; margin-bottom:14px; opacity:.5;">❗</div>{{ t('noIkad') }}</div>
      </template>

      <template v-if="tab==='insurance'">
        <div class="card fade-up" v-if="insurance">
          <div class="card-title">{{ t('medicalInsurance') }}</div>
          <div class="row"><span class="k">{{ t('policyNumber') }}</span><span class="v">{{ insurance.policy_number }}</span></div>
          <div class="row"><span class="k">{{ t('startDate') }}</span><span class="v">{{ insurance.start || '' }}</span></div>
          <div class="row"><span class="k">{{ t('expiryDate') }}</span><span class="v">{{ insurance.expiry || '' }}</span></div>
        </div>
        <div class="empty" v-else><div style="font-size:44px; margin-bottom:14px; opacity:.5;">❗</div>{{ t('noInsurance') }}</div>
      </template>

      <template v-if="tab==='certs'">
        <div class="empty" v-if="!certs || !certs.length"><div style="font-size:44px; margin-bottom:14px; opacity:.5;">❗</div>{{ t('noCerts') }}</div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.ikad-wrap { margin-top: 4px; }
.flip-hit { display: block; width: 100%; padding: 0; border: 0; background: transparent; text-align: left; cursor: pointer; }
.flip { position: relative; transform-style: preserve-3d; transition: transform .45s ease; }
.flip.flipped { transform: rotateY(180deg); }
.face {
  position: relative; backface-visibility: hidden;
  border-radius: 16px; overflow: hidden; background: var(--blue-grad); color: #fff; padding: 18px;
}
.face.back { position: absolute; inset: 0; transform: rotateY(180deg); }
.face.pic { padding: 0; background: transparent; }
.face.pic img { width: 100%; height: 100%; object-fit: contain; background: #fff; border-radius: 16px; }
.ikad-top { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
.badge.light { background: rgba(255,255,255,.22); color: #fff; }
.ikad-body { display: flex; gap: 12px; margin-top: 14px; }
.portrait { width: 72px; height: 92px; object-fit: cover; border-radius: 8px; background: rgba(255,255,255,.2); }
.ikad-fields { font-size: 13px; line-height: 1.55; min-width: 0; }
.ikad-fields span { display: block; opacity: .75; font-size: 11px; }
.ikad-fields div { margin-bottom: 6px; word-break: break-word; }
.issuer { margin-top: 28px; font-size: 18px; font-weight: 700; line-height: 1.4; }
.docid { margin-top: 16px; font-size: 14px; }
.hint { margin-top: 18px; font-size: 12.5px; opacity: .8; }
.hint.center { text-align: center; color: var(--muted-foreground); }
</style>
