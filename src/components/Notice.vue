<script setup>
import { ref, inject, onMounted } from 'vue'
const t = inject('t')
const KEY = 'emgs_notice_v2'
const mode = ref(localStorage.getItem(KEY) || '')
const open = ref(false)
onMounted(() => {
  if (!mode.value) open.value = true
})
function close() {
  mode.value = 'closed'
  localStorage.setItem(KEY, 'closed')
  open.value = false
}
function hideForever() {
  mode.value = 'hidden'
  localStorage.setItem(KEY, 'hidden')
  open.value = false
}
</script>

<template>
  <button v-if="mode === 'closed' && !open" type="button" class="notice-btn" @click="open = true">{{ t('noticeOpen') }}</button>
  <div v-if="open" class="notice-mask" role="dialog" aria-modal="true">
    <div class="notice-sheet">
      <div class="notice-scroll">
        <strong>{{ t('noticeTitle') }}</strong>
        <p>{{ t('noticeBody') }}</p>
        <div class="notice-actions">
          <button type="button" class="btn ghost" @click="hideForever">{{ t('noticeHide') }}</button>
          <button type="button" class="btn" @click="close">{{ t('noticeClose') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: auto; max-width: 100%; margin: 2px 0 18px; padding: 0 14px;
  background: #ffbf00; color: #3a2500; border: none; border-radius: 999px;
  min-height: 32px; font-weight: 750; font-size: 13px; letter-spacing: .02em;
  font-family: inherit; cursor: pointer;
  box-shadow: 0 0 0 2px #3a2500;
}
.notice-mask {
  position: fixed; inset: 0; z-index: 70;
  background: rgba(13,13,18,.45);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 16px;
}
.notice-sheet {
  width: min(480px, 100%); max-height: min(78vh, 640px);
  background: var(--card); border-radius: 18px; overflow: hidden;
}
.notice-scroll { max-height: min(78vh, 640px); overflow: auto; padding: 18px 16px 16px; }
.notice-scroll strong { font-size: 18px; }
.notice-scroll p { margin-top: 12px; white-space: pre-wrap; font-size: 14.5px; line-height: 1.65; }
.notice-actions { display: flex; gap: 10px; margin-top: 18px; }
.notice-actions .btn { flex: 1; margin-top: 0; }
</style>
