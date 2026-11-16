<script setup>
// App.vue：i18n 全局 + 双 shell + 语言淡入过渡 + 侧栏头像（真实用户）
import { ref, computed, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LANGS, TRAD_FLAGS, dictionaries } from './i18n/index.js'

function initialLang() {
  const saved = localStorage.getItem('emgs_lang') || 'zh-CN'
  const code = saved === 'zh-CN' ? 'zh-CN' : 'zh-TW'
  localStorage.setItem('emgs_lang', code)
  return code
}
import { authService } from './services/auth.js'
import UserAvatar from './components/UserAvatar.vue'
import logoUrl from './assets/emgs-logo-official.png'

const lang = ref(initialLang())
const cnLang = LANGS.find(l => l.code === 'zh-CN')
const showLang = ref(false)
const t = (k) => dictionaries[lang.value][k] ?? k
provide('t', t)
provide('lang', lang)
provide('setLang', setLang)

function setLang(code) {
  // 先关弹层、立即写入目标语言，避免点 A 出现 B 的视觉错位
  showLang.value = false
  if (code === lang.value) return
  lang.value = code
  localStorage.setItem('emgs_lang', code)
}
watch(() => lang.value, v => { document.documentElement.lang = v }, { immediate: true })

const router = useRouter()
const route = useRoute()
watch(() => route.path, () => {
  // 切页时只收起弹层，顶栏保持原位，不再隐藏重显
  showLang.value = false
})
const isLogin = computed(() => route.path === '/login')
const isDesktop = ref(window.innerWidth >= 900)
window.addEventListener('resize', () => { isDesktop.value = window.innerWidth >= 900 })
const loggedIn = computed(() => authService.loggedIn)

const tabs = computed(() => [
  { path: '/home', icon: '🏠', label: t('navHome') },
  { path: '/digital-id', icon: '🪪', label: t('navWallet') },
  { path: '/ikad-qr', icon: '📷', label: t('navScan') },
  { path: '/application-history', icon: '📈', label: t('navHistory') },
  { path: '/profile', icon: '👤', label: t('navProfile') },
])
const sideGroups = computed(() => [
  { title: t('sideOverview'), items: [
    { path: '/home', icon: '🏠', label: t('sideHome') },
    { path: '/application-history', icon: '📈', label: t('sideAppHistory') },
  ]},
  { title: t('sideDocs'), items: [
    { path: '/digital-id', icon: '🪪', label: t('sideDocs') },
    { path: '/ikad-qr', icon: '📷', label: t('pageScan') },
    { path: '/expired-cards', icon: '🗂️', label: t('sideExpired') },
  ]},
  { title: t('sideCheckin'), items: [
    { path: '/post-arrival-checkin', icon: '🏥', label: t('sideCheckin') },
    { path: '/checkin-history', icon: '📋', label: t('sideCheckinHistory') },
    { path: '/emgs-panel-clinic', icon: '📍', label: t('sideClinics') },
  ]},
  { title: t('sideAccount'), items: [
    { path: '/notifications', icon: '🔔', label: t('sideNotifications') },
    { path: '/apply-visa', icon: '📄', label: t('sideApplyVisa') },
    { path: '/feedback', icon: '✉️', label: t('sideFeedback') },
    { path: '/profile', icon: '👤', label: t('sideProfile') },
  ]},
])
const pageTitle = computed(() => {
  const map = {
    '/home': t('pageHome'), '/digital-id': t('pageWallet'), '/ikad-qr': t('pageScan'),
    '/application-history': t('pageAppHistory'), '/profile': t('pageProfile'),
    '/post-arrival-checkin': t('pageCheckin'), '/checkin-history': t('pageCheckinHistory'),
    '/emgs-panel-clinic': t('pageClinics'), '/notifications': t('pageNotifications'),
    '/apply-visa': t('pageApplyVisa'), '/feedback': t('pageFeedback'), '/expired-cards': t('pageExpired'),
    '/faq': t('faq'), '/terms': t('terms'), '/privacy': t('privacy'),
  }
  return map[route.path] || t('appName')
})
</script>

<template>
  <!-- 登录页 -->
  <div v-if="isLogin" class="login-shell">
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.path" />
    </router-view>
    <footer class="footer">
      <div class="cp">{{ t('footerCopyright') }}</div>
      <div>{{ t('footerAuthor') }}</div>
      <div class="disc">{{ t('footerDisclaimer') }}</div>
    </footer>
    <pwa-install manifest-url="/manifest.webmanifest" manual-how-to></pwa-install>
  </div>

  <!-- 竖版 -->
  <div v-else-if="!isDesktop" class="shell-m">
    <div class="m-langbar">
      <a class="gh-top" href="https://github.com/zjleehk" target="_blank" rel="noopener" aria-label="GitHub: zjleehk">
        <svg viewBox="0 0 16 16" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
      </a>
      <div style="position:relative;">
        <button class="lang-btn" type="button" @click="showLang = !showLang">
          <template v-if="lang === 'zh-CN'">
            <img :src="cnLang.flag" alt="" class="flag-ico">简体中文
          </template>
          <template v-else>
            <span class="flag-cluster">
              <img v-for="f in TRAD_FLAGS" :key="f.alt" :src="f.src" :alt="f.alt" class="flag-ico">
            </span>
            繁體中文
          </template>
        </button>
        <div v-if="showLang" class="lang-pop" @click.stop>
          <button type="button" :class="{ active: lang === 'zh-CN' }" @click="setLang('zh-CN')">
            <img :src="cnLang.flag" alt="" class="flag-ico">简体中文
          </button>
          <button type="button" :class="{ active: lang !== 'zh-CN' }" @click="setLang('zh-TW')">
            <span class="flag-cluster">
              <img v-for="f in TRAD_FLAGS" :key="f.alt" :src="f.src" :alt="f.alt" class="flag-ico">
            </span>
            繁體中文
          </button>
        </div>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.path" />
    </router-view>
    <footer class="footer">
      <div class="cp">{{ t('footerCopyright') }}</div>
      <div>{{ t('footerAuthor') }}</div>
      <div class="disc">{{ t('footerDisclaimer') }}</div>
    </footer>
    <nav class="tabbar-m" aria-label="主导航">
      <router-link v-for="tb in tabs" :key="tb.path" :to="tb.path">
        <span class="ico" aria-hidden="true">{{ tb.icon }}</span>{{ tb.label }}
      </router-link>
    </nav>
  </div>

  <!-- 横版 -->
  <div v-else class="shell-d">
    <aside class="sidebar">
      <div class="brand-block">
        <img :src="logoUrl" alt="EMGS中文" style="border-radius:12px; width:72px; height:72px; object-fit:cover;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:13px; color:var(--muted-foreground); font-weight:550;">{{ t('appName') }}</span>
        </div>
      </div>
      <!-- 侧栏用户卡（真实头像+姓名） -->
      <div v-if="loggedIn" class="side-user" @click="router.push('/profile')" style="cursor:pointer;">
        <UserAvatar :size="40" />
        <div style="min-width:0;">
          <div style="font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ authService.profile?.fullname || authService.user }}</div>
          <div style="font-size:11px; color:var(--muted-foreground); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ authService.profile?.university || '' }}</div>
        </div>
      </div>
      <template v-for="g in sideGroups" :key="g.title">
        <div class="side-group">{{ g.title }}</div>
        <router-link v-for="it in g.items" :key="it.path" :to="it.path" class="side-item">
          <span class="ico" aria-hidden="true">{{ it.icon }}</span>{{ it.label }}
        </router-link>
      </template>
      <div class="side-spacer"></div>
      <div style="position:relative; padding: 6px 10px 0;">
        <button class="lang-btn" style="width:100%;" @click="showLang = !showLang">
          <template v-if="lang === 'zh-CN'">
            <img :src="cnLang.flag" alt="" class="flag-ico">简体中文
          </template>
          <template v-else>
            <span class="flag-cluster">
              <img v-for="f in TRAD_FLAGS" :key="f.alt" :src="f.src" :alt="f.alt" class="flag-ico">
            </span>
            繁體中文
          </template>
        </button>
        <div v-if="showLang" class="lang-pop" style="top:auto; bottom:48px;" @click.stop>
          <button :class="{ active: lang === 'zh-CN' }" @click="setLang('zh-CN')">
            <img :src="cnLang.flag" alt="" class="flag-ico">简体中文
          </button>
          <button :class="{ active: lang !== 'zh-CN' }" @click="setLang('zh-TW')">
            <span class="flag-cluster">
              <img v-for="f in TRAD_FLAGS" :key="f.alt" :src="f.src" :alt="f.alt" class="flag-ico">
            </span>
            繁體中文
          </button>
        </div>
      </div>
      <div class="side-foot">{{ t('footerCopyright') }}<br>{{ t('footerAuthor') }}</div>
    </aside>
    <div class="content-d">
      <div class="toolbar-d">
        <h1>{{ pageTitle }}</h1>
        <div class="spacer"></div>
        <a class="gh-top" href="https://github.com/zjleehk" target="_blank" rel="noopener" aria-label="GitHub: zjleehk">
          <svg viewBox="0 0 16 16" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
        </a>
      </div>
      <div class="page-d">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="route.path" />
        </router-view>
        <div class="footer" style="border:none; text-align:left; padding:34px 0 0;">
          <div class="disc" style="margin:0 0 8px;">{{ t('footerDisclaimer') }}</div>
          <div class="cp">{{ t('footerCopyright') }} · {{ t('footerAuthor') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.gh-top {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50%;
  color: var(--muted-foreground); text-decoration: none; flex-shrink: 0;
}
.gh-top:hover { color: var(--foreground); background: var(--card-2); }
/* 国旗图标 */
.flag-ico { width: 20px; height: 14px; object-fit: cover; border-radius: 2px; display: inline-block; vertical-align: middle; margin-right: 8px; box-shadow: 0 0 0 .5px rgba(0,0,0,.15); }
.lang-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0; }
.lang-pop button { display: flex; align-items: center; }
/* 侧栏用户卡 */
.side-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
/* 登录页语言切换浮层位置 */
.login-shell { position: relative; }
.login-shell .lang-pop { top: auto; }
</style>
