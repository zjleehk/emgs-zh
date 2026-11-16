<script setup>
// 环形进度：百分比变化后弧线必须跟着变（不能在 setup 里把 dash 算死）
import { computed } from 'vue'
const props = defineProps({
  percent: { type: Number, default: 0 },
  size: { type: Number, default: 150 },
  strokeWidth: { type: Number, default: 9 },
  color: { type: String, default: '' },
})
const C = 2 * Math.PI * 42
const p = computed(() => {
  const n = Number(props.percent)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
})
const dash = computed(() => p.value / 100 * C)
const stroke = computed(() => props.color || (p.value >= 100 ? 'var(--success)' : p.value >= 50 ? 'var(--warning)' : 'var(--accent)'))
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" :aria-label="`进度 ${p}%`">
    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--fill)" :stroke-width="strokeWidth" />
    <circle cx="50" cy="50" r="42" fill="none" :stroke="stroke" :stroke-width="strokeWidth"
      stroke-linecap="round" :stroke-dasharray="`${dash} ${C}`" transform="rotate(-90 50 50)"
      style="transition: stroke-dasharray .8s cubic-bezier(.22,1,.36,1);" />
    <text x="50" y="57" text-anchor="middle" font-size="19" font-weight="750"
      fill="currentColor" style="letter-spacing:-.02em;">{{ p }}%</text>
  </svg>
</template>
