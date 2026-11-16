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
    <div class="card-title-row">
      <div class="card-title">{{ t('contactAuthor') }}</div>
      <a class="gh-mini" href="https://github.com/zjleehk" target="_blank" rel="noopener" aria-label="GitHub: zjleehk">
        <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
      </a>
    </div>
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
.card-title-row { display: flex; align-items: center; justify-content: space-between; }
.gh-mini {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%;
  color: var(--muted-foreground); text-decoration: none;
}
.gh-mini:hover { color: var(--foreground); background: var(--card-2); }
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
