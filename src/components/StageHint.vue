<script setup>
import { computed, inject } from 'vue'
import { stageAt } from '../services/stages.js'
import { scriptOf } from '../i18n/index.js'
const props = defineProps({ percent: { type: Number, default: 0 } })
const lang = inject('lang')
const stage = computed(() => stageAt(props.percent, scriptOf(lang?.value)))
</script>

<template>
  <div class="stage" v-if="stage.percent > 0 || stage.title">
    <div class="stage-k">{{ stage.mark ? stage.mark + '%' : '' }} {{ stage.title }}</div>
    <p class="stage-next" v-if="stage.next && !stage.done">{{ stage.nextLabel }}：{{ stage.next }}</p>
    <p class="stage-note" v-if="stage.done">{{ stage.note }}</p>
    <p class="stage-warn" v-if="stage.warn">{{ stage.warnText }}</p>
  </div>
</template>

<style scoped>
.stage { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); min-width: 0; }
.stage-k { font-size: 14.5px; font-weight: 650; line-height: 1.45; }
.stage-next, .stage-note { margin-top: 6px; font-size: 13px; color: var(--muted-foreground); line-height: 1.55; }
.stage-warn { margin-top: 8px; font-size: 13px; line-height: 1.55; color: var(--warning); }
</style>
