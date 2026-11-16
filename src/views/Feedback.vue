<script setup>
// 官方 App 的反馈表单校验完就回首页，没有提交接口。这里同样不能送到 EMGS。
import { ref, inject, onMounted } from 'vue'
import { authService } from '../services/auth.js'
const t = inject('t')
const sent = ref(false)
const err = ref('')
const form = ref({ name: '', email: '', subject: '', desc: '' })
onMounted(() => {
  const p = authService.profile
  form.value.name = p?.fullname || ''
  form.value.email = p?.email || ''
  try {
    const saved = JSON.parse(localStorage.getItem('emgs_feedback') || 'null')
    if (saved?.subject) form.value = { ...form.value, ...saved }
  } catch { /* 忽略坏掉的本地记录 */ }
})
function submit() {
  err.value = ''
  if (!form.value.name.trim()) { err.value = '请填写姓名'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) { err.value = '请填写有效的邮箱'; return }
  if (!form.value.subject.trim()) { err.value = '请填写主题'; return }
  if (!form.value.desc.trim()) { err.value = '请填写描述'; return }
  localStorage.setItem('emgs_feedback', JSON.stringify({
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    subject: form.value.subject.trim(),
    desc: form.value.desc.trim(),
    at: new Date().toISOString(),
  }))
  sent.value = true
}
</script>

<template>
  <div class="page-m">
    <div class="large-title">{{ t('pageFeedback') }}</div>
    <div class="card fade-up" v-if="!sent">
      <p style="font-size:13.5px; color:var(--muted-foreground); line-height:1.6; margin-bottom:14px;">{{ t('feedbackThanks') }}</p>
      <label class="lab" for="f-name">{{ t('fullName') }}</label>
      <input id="f-name" class="input" v-model="form.name" autocomplete="name">
      <label class="lab" for="f-email">{{ t('email') }}</label>
      <input id="f-email" class="input" v-model="form.email" autocomplete="email" inputmode="email">
      <label class="lab" for="f-subject">{{ t('subject') }}</label>
      <input id="f-subject" class="input" v-model="form.subject" :placeholder="t('subjectPlaceholder')">
      <label class="lab" for="f-desc">{{ t('description') }}</label>
      <textarea id="f-desc" class="input" rows="5" v-model="form.desc" :placeholder="t('descPlaceholder')"></textarea>
      <p v-if="err" style="color:#b42318; font-size:13.5px; margin-top:10px;">{{ err }}</p>
      <button class="btn" @click="submit">{{ t('submit') }}</button>
    </div>
    <div class="card fade-up" v-else style="text-align:center; padding:40px 16px;">
      <div style="font-size:40px;">✅</div>
      <p style="margin-top:12px; font-size:16px; font-weight:600;">{{ t('thankYou') }}</p>
      <p style="font-size:13.5px; color:var(--muted-foreground); margin-top:6px; line-height:1.6;">已保存在这台设备上。EMGS 官方没有接收接口，所以到不了 EMGS。</p>
    </div>
  </div>
</template>

<style scoped>
.lab { font-size: 14px; font-weight: 650; display: block; margin: 14px 0 7px; }
.lab:first-of-type { margin-top: 0; }
</style>
