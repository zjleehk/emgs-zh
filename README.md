# EMGS 中文助手

[**简体中文**](#user-content-zh-cn) · [**繁體中文**](#user-content-zh-tw)

演示站点：https://zhemgs.hker.dpdns.org

作者主页：https://github.com/zjleehk

---

<a id="zh-cn"></a>
<details open>
<summary><strong>简体中文</strong></summary>

<br>

一个面向中国内地、香港、澳门、台湾留学生的 EMGS 查询界面。用中文查看 EMGS Hub 上已有的申请进度、电子证件、指定诊所、通知与入境体检记录。

> 本项目是独立的第三方界面，非 EMGS 官方网站。EMGS 及相关标志归其权利人所有。

**作者没有对官方的代码做任何二次更改。** 本仓库全部是独立编写的中文查询界面，没有修改、复制或分发 EMGS 官方应用或官方网站的任何代码。页面数据均通过 EMGS 官方接口获取。

### 功能

- EMGS 账号登录（支持邮箱验证码两段登录），登录状态保存在本地
- 申请进度、申请历史、个人资料
- 电子 iKAD：证件字段、正反面翻卡、扫码查验
- 入境后签到进度与签到历史
- 合作诊所列表
- 通知中心（英文可自动翻译为简体 / 繁体）
- 简体 / 繁体切换
- 联系作者（一个账号一天一次）
- 可添加到主屏幕（PWA）
- 常见问题、条款与支持、隐私与政策

### 技术栈

Vue 3 + Vite。后端不在本仓库：登录与查询需要一个实现 EMGS OAuth 1.0a HMAC-SHA1 签名的转发服务。密码只在登录那一次转交，不在服务器保存。

### 开发

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm exec vite build
```

构建产物在 `dist/`。`public/sw.js` 的 `BUILD` 常量在每次发布时替换为时间戳，已安装的主屏幕应用才能收到更新。

### 目录

```
src/views/        页面
src/components/   组件
src/services/     API 与登录
src/i18n/         简体 / 繁体文案
public/           PWA 与静态资源
```

### 许可

MIT，见 [LICENSE](LICENSE)。

</details>

---

<a id="zh-tw"></a>
<details>
<summary><strong>繁體中文</strong></summary>

<br>

一個面向中國內地、香港、澳門、台灣留學生的 EMGS 查詢介面。用中文查看 EMGS Hub 上已有的申請進度、電子證件、指定診所、通知與入境體檢記錄。

> 本專案是獨立的第三方介面，非 EMGS 官方網站。EMGS 及相關標誌歸其權利人所有。

**作者沒有對官方的代碼做任何二次更改。** 本倉庫全部是獨立編寫的中文查詢介面，沒有修改、複製或分發 EMGS 官方應用或官方網站的任何代碼。頁面資料均透過 EMGS 官方介面取得。

### 功能

- EMGS 帳號登入（支援電子郵件驗證碼兩段登入），登入狀態保存在本地
- 申請進度、申請歷史、個人資料
- 電子 iKAD：證件欄位、正反面翻卡、掃碼查驗
- 入境後簽到進度與簽到歷史
- 合作診所列表
- 通知中心（英文可自動翻譯為簡體 / 繁體）
- 簡體 / 繁體切換
- 聯絡作者（一個帳號一天一次）
- 可加到主畫面（PWA）
- 常見問題、條款與支援、隱私與政策

### 技術棧

Vue 3 + Vite。後端不在本倉庫：登入與查詢需要一個實作 EMGS OAuth 1.0a HMAC-SHA1 簽名的轉發服務。密碼只在登入那一次轉交，不在伺服器保存。

### 開發

```bash
pnpm install
pnpm dev
```

生產構建：

```bash
pnpm exec vite build
```

構建產物在 `dist/`。`public/sw.js` 的 `BUILD` 常數在每次發佈時替換為時間戳，已安裝的主畫面應用才能收到更新。

### 目錄

```
src/views/        頁面
src/components/   組件
src/services/     API 與登入
src/i18n/         簡體 / 繁體文案
public/           PWA 與靜態資源
```

### 授權

MIT，見 [LICENSE](LICENSE)。

</details>
