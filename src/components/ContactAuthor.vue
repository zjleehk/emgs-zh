<script setup>
import { ref, inject } from 'vue'
import { authService } from '../services/auth.js'

const t = inject('t')
const open = ref(false)
const text = ref('')
const busy = ref(false)
const err = ref('')
const sent = ref(false)

function anonId() {
  let id = localStorage.getItem('emgs_anon')
  if (!id || !/^[A-Za-z0-9-]{8,80}$/.test(id)) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
    localStorage.setItem('emgs_anon', id)
  }
  return id
}

async function send() {
  err.value = ''
  sent.value = false
  const message = text.value.trim()
  if (message.length < 2) { err.value = t('contactNeedText'); return }
  busy.value = true
  try {
    const tok = localStorage.getItem('emgs_token') || ''
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tok ? { Authorization: 'Bearer ' + tok } : {}),
      },
      body: JSON.stringify({ message, anon: anonId(), user: authService.user || '' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) throw new Error(data?.error || t('contactFail'))
    text.value = ''
    sent.value = true
    open.value = false
  } catch (e) {
    err.value = e?.message || t('contactFail')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card contact-card">
    <div class="card-title">{{ t('contactAuthor') }}</div>
    <p class="hint">{{ t('contactAuthorHint') }}</p>
    <p v-if="sent" class="ok">{{ t('contactSent') }}</p>
    <button v-if="!open" type="button" class="btn ghost" @click="open = true">{{ t('contactWrite') }}</button>
    <template v-else>
      <textarea v-model="text" class="box" rows="4" maxlength="2000" :placeholder="t('contactPlaceholder')"></textarea>
      <p v-if="err" class="bad">{{ err }}</p>
      <div class="row">
        <button type="button" class="btn ghost" @click="open = false">{{ t('cancel') }}</button>
        <button type="button" class="btn" :disabled="busy" @click="send">{{ busy ? t('loading') : t('contactSend') }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.contact-card { margin-top: 14px; }
.hint { margin: 0 0 12px; color: var(--muted-foreground); font-size: 13px; line-height: 1.55; }
.box {
  width: 100%; box-sizing: border-box; resize: vertical;
  border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;
  background: var(--background); color: inherit; font: inherit;
}
.row { display: flex; gap: 10px; margin-top: 10px; }
.row .btn { flex: 1; }
.ok { margin: 0 0 10px; color: #0b7a3b; font-size: 13px; }
.bad { margin: 8px 0 0; color: #b42318; font-size: 13px; }
</style>
