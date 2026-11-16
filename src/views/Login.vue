<script setup>
// 登录页：真实登录 + 邮箱 OTP + i18n 全量
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth.js'
import { LANGS, TRAD_FLAGS } from '../i18n/index.js'
const t = inject('t')
const lang = inject('lang')
const setLang = inject('setLang')
const cnFlag = LANGS.find(l => l.code === 'zh-CN').flag
const router = useRouter()
const form = ref({ username: '', password: '' })
const err = ref('')
const okMsg = ref('')
const busy = ref(false)
const otpStage = ref(false)
const otpToken = ref('')
const otpCode = ref('')

async function doLogin() {
  err.value = ''; okMsg.value = ''
  if (!form.value.username.trim() || !form.value.password) {
    err.value = t('loginFillBoth'); return
  }
  busy.value = true
  const r = await authService.login(form.value.username, form.value.password)
  busy.value = false
  if (r.ok) { okMsg.value = t('loginOkMsg'); setTimeout(() => router.push('/home'), 400) }
  else if (r.needOtp) { otpStage.value = true; otpToken.value = r.otpToken }
  else err.value = r.error
}

async function submitOtp() {
  err.value = ''
  if (!otpCode.value.trim() || otpCode.value.trim().length < 4) { err.value = t('loginFillRequired'); return }
  busy.value = true
  const r = await authService.verifyOtp(otpToken.value, otpCode.value.trim())
  busy.value = false
  if (r.ok) { okMsg.value = t('otpOkMsg'); setTimeout(() => router.push('/home'), 400) }
  else err.value = r.error
}

function backToLogin() { otpStage.value = false; otpCode.value = ''; err.value = ''; okMsg.value = '' }
</script>

<template>
  <div class="page-m">
    <div style="text-align:center; padding: 34px 0 6px;" class="fade-up">
      <div class="logo-row">
        <a class="gh-badge" href="https://github.com/zjleehk" target="_blank" rel="noopener" aria-label="GitHub: zjleehk">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
        </a>
        <img src="../assets/emgs-logo-official.png" alt="EMGS中文" class="logo-img">
      </div>
      <h2 style="font-size:25px; margin-top:16px; letter-spacing:-.024em;">{{ otpStage ? t('otpTitle') : t('loginWelcome') }}</h2>
      <p style="color:var(--muted-foreground); font-size:14.5px; margin-top:6px; line-height:1.6;">
        {{ otpStage ? (okMsg || t('otpSentMsg')) : t('loginSubtitle') }}
      </p>
      <div class="login-langs">
        <button type="button" class="lang-btn" :class="{ on: lang === 'zh-CN' }" @click="setLang('zh-CN'); $event.currentTarget.blur()">
          <img :src="cnFlag" alt="" class="flag-ico">简体中文
        </button>
        <button type="button" class="lang-btn" :class="{ on: lang !== 'zh-CN' }" @click="setLang('zh-TW'); $event.currentTarget.blur()">
          <span class="flag-cluster">
            <img v-for="f in TRAD_FLAGS" :key="f.alt" :src="f.src" :alt="f.alt" class="flag-ico">
          </span>
          繁體中文
        </button>
      </div>
    </div>

    <div class="card stagger" style="margin-top:20px;" v-if="otpStage">
      <label style="font-size:14px; font-weight:650; display:block; margin-bottom:7px;" for="otp">{{ t('otpLabel') }}</label>
      <input id="otp" class="input" v-model="otpCode" inputmode="numeric" maxlength="8" :placeholder="t('otpPlaceholder')" style="text-align:center; font-size:22px; letter-spacing:.3em; font-weight:650;">
      <p style="font-size:13px; color:var(--danger); margin-top:12px; min-height:18px; line-height:1.5;" role="alert" v-if="err">{{ err }}</p>
      <button class="btn" :disabled="busy" @click="submitOtp">{{ busy ? t('loading') : t('otpVerifyBtn') }}</button>
      <button class="btn ghost" @click="backToLogin" style="margin-top:10px;">{{ t('otpBack') }}</button>
    </div>

    <div class="card stagger" style="margin-top:20px;" v-else>
      <label style="font-size:14px; font-weight:650; display:block; margin-bottom:7px;" for="username">{{ t('loginEmail') }}</label>
      <input id="username" class="input" v-model="form.username" autocomplete="username" inputmode="email">
      <label style="font-size:14px; font-weight:650; display:block; margin:16px 0 7px;" for="password">{{ t('loginPassword') }}</label>
      <input id="password" class="input" type="password" v-model="form.password" autocomplete="current-password">
      <p style="font-size:13px; color:var(--danger); margin-top:12px; min-height:18px; line-height:1.5;" role="alert" v-if="err">{{ err }}</p>
      <p style="font-size:13px; color:var(--success); margin-top:12px; min-height:18px;" role="status" v-if="okMsg">{{ okMsg }}</p>
      <button class="btn" :disabled="busy" @click="doLogin">{{ busy ? t('loading') : t('logIn') }}</button>
      <a class="gh-link" href="https://github.com/zjleehk" target="_blank" rel="noopener">
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
        GitHub
      </a>
    </div>

  </div>
</template>

<style scoped>
.logo-row { position: relative; display: inline-block; }
.logo-img { height: 148px; width: auto; border-radius: 22px; box-shadow: var(--shadow-lg); }
.gh-badge {
  position: absolute; right: -14px; top: -10px; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--card); color: var(--foreground);
  border: 1px solid var(--border); box-shadow: var(--shadow-lg);
  text-decoration: none;
}
.gh-badge:active { transform: scale(.94); }
.login-langs { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; align-items: stretch; }
.login-langs .lang-btn { width: 100%; justify-content: center; }
.login-langs .lang-btn.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.gh-link {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 12px; padding: 11px 0;
  border-radius: 12px; border: 1px solid var(--border);
  background: var(--card); color: var(--foreground);
  font-size: 14px; font-weight: 600; text-decoration: none;
}
.gh-link:active { opacity: .7; }
</style>
