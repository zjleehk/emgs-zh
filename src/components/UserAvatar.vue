<script setup>
// 圆形头像组件：真实头像 → 加载占位 → 兜底默认头像（首字母）
import { ref, computed, watch } from 'vue'
import { authService } from '../services/auth.js'
const props = defineProps({
  size: { type: Number, default: 56 },
})
const profile = computed(() => authService.profile)
const userName = computed(() => profile.value?.fullname || authService.user || '')
const initial = computed(() => userName.value.trim().slice(0, 1) || '·')
const photoUrl = computed(() => {
  const p = profile.value?.photo
  if (!p) return ''
  if (p.startsWith('data:') || p.startsWith('http')) return p
  return 'https://mycas.educationmalaysia.gov.my' + (p.startsWith('/') ? p : '/' + p)
})
const loaded = ref(false)
const failed = ref(false)
watch(photoUrl, () => { loaded.value = false; failed.value = false })
function onLoad() { loaded.value = true }
function onError() { failed.value = true; loaded.value = true }
</script>

<template>
  <div class="avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="photoUrl && !failed" :src="photoUrl" alt="头像" @load="onLoad" @error="onError"
      :class="{ visible: loaded }">
    <div v-if="!photoUrl || failed" class="fallback">{{ initial }}</div>
    <div v-if="photoUrl && !failed && !loaded" class="loading"></div>
  </div>
</template>

<style scoped>
.avatar { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: var(--accent-soft); }
.avatar img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .3s ease; }
.avatar img.visible { opacity: 1; }
.fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent), #5eaaff); color: #fff; font-weight: 700; font-size: 42%; }
.loading { position: absolute; inset: 0; background: var(--fill); }
@media (prefers-reduced-motion: no-preference) { .loading { animation: pulse 1.2s ease-in-out infinite; } }
</style>
