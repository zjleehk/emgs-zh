<script setup>
// 个人资料：真实数据 + Verified 徽章（对照原 App Profile 页）
import { computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth.js'
import UserAvatar from '../components/UserAvatar.vue'
const t = inject('t')
const router = useRouter()
const profile = computed(() => authService.profile)
const raw = computed(() => profile.value?.raw || {})
const isVerified = computed(() => raw.value.is_kyc_valid === true || raw.value.val_approval_status === '01')
const displayName = computed(() => (profile.value?.fullname || authService.user || '').toUpperCase())
const studentId = computed(() => raw.value.stars_student_id || raw.value.student_id || raw.value.entity_id || '')
onMounted(() => { authService.refresh?.() })
const rows = computed(() => {
  const r = raw.value
  return [
    ['passportNumber', r.passport || r.travel_doc_no],
    ['email', profile.value?.email || r.email],
    ['gender', profile.value?.gender],
    ['dob', (r.dob || '').slice(0, 10)],
    ['nationality', r.nationality || r.cob],
    ['university', r.ihe_name],
    ['course', r.course_name],
    ['programType', r.type],
    ['emgsRefNo', r.referanceNo || r.jim_application_id],
    ['startDate', (r.val_issued_on || '').slice(0, 10)],
    ['expiryDate', (r.expired_on || r.travel_doc_expired_on || '').slice(0, 10)],
    ['malaysiaPhone', r.telephone],
    ['malaysiaAddress', r.address],
  ].filter(([k, v]) => v)
})
function logout() {
  authService.logout()
  router.push('/login')
}
</script>

<template>
  <div class="page-m">
    <!-- 顶部用户区（橙色头图风格对照原 App） -->
    <div class="profile-hero fade-up">
      <UserAvatar :size="84" />
      <div style="min-width:0;">
        <span class="badge success" v-if="isVerified" style="margin-bottom:6px;"><span class="dot"></span>{{ t('verified') }}</span>
        <div style="font-weight:750; font-size:22px; letter-spacing:-.02em; margin-top:4px;">{{ displayName }}</div>
        <div style="font-size:13.5px; opacity:.85; margin-top:2px;" v-if="studentId">学号：{{ studentId }}</div>
      </div>
    </div>

    <div class="card fade-up" v-if="rows.length">
      <div class="card-title">{{ t('summary') }}</div>
      <div class="row" v-for="([k, v]) in rows" :key="k"><span class="k">{{ t(k) }}</span><span class="v">{{ v }}</span></div>
    </div>
    <div class="card" v-else>
      <div class="empty" style="padding:20px 0;">{{ t('loading') }}</div>
    </div>

    <div class="card fade-up">
      <div class="card-title">GENERAL</div>
      <router-link to="/apply-visa" class="list-item"><div class="t">{{ t('myApplications') }}</div><span class="chev">›</span></router-link>
      <router-link to="/emgs-panel-clinic" class="list-item"><div class="t">{{ t('pageClinics') }}</div><span class="chev">›</span></router-link>
      <router-link to="/faq" class="list-item"><div class="t">{{ t('faq') }}</div><span class="chev">›</span></router-link>
      <div class="section-label" style="padding-top:10px;">{{ t('general') }}</div>
      <router-link to="/terms" class="list-item"><div class="t">{{ t('terms') }}</div><span class="chev">›</span></router-link>
      <router-link to="/privacy" class="list-item"><div class="t">{{ t('privacy') }}</div><span class="chev">›</span></router-link>
      <div class="list-item" @click="logout" style="cursor:pointer;"><div class="t">{{ t('logOut') }}</div><span class="chev">›</span></div>
      <div style="font-size:11.5px; color:var(--faint-foreground); padding:14px 2px 2px;">VERSION: 1.10 · BUILD: 69</div>
    </div>
  </div>
</template>

<style scoped>
.profile-hero {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, var(--accent), #5eaaff);
  border-radius: 16px; padding: 22px; margin-bottom: 16px; color: #fff;
}
.profile-hero .badge.success { background: rgba(48,209,88,.25); color: #7ee8a4; }
.chev { color: var(--faint-foreground); font-size: 20px; }
</style>
