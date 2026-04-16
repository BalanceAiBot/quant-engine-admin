# Quant Engine Admin — 视觉设计方向文档

## 一、现状诊断

当前仪表盘采用基础 Slate 暗色主题，存在以下视觉叙事缺口：
- **色彩单一**：几乎只有 slate + emerald/rose/amber 的 flat 色块，缺乏层次与情绪。
- **无实时感**：5 秒轮询的数据更新在视觉上没有任何“脉搏”提示。
- **风险弱表达**：Risk 页面仅靠文字 badge 区分状态，没有“压力”或“警戒”氛围。
- **信息密度高但无节奏**：大量表单、表格、JSON 块堆叠，缺少视觉呼吸区和焦点引导。
- **品牌记忆点缺失**：没有专属的光效、图形语言或动效签名。

---

## 二、视觉主题 / 情绪板

### 主题名称：「深空交易终端」（Deep Space Trading Terminal）

**核心意象**：
- 将界面想象为飞船驾驶舱中的交易终端——黑暗宇宙背景中，数据如星图般流动。
- 强调“精密”“实时”“可控的危险”三种情绪。

**关键词**：
> 深空黑 · 极光青 · 熔岩橙 · 全息蓝 · 玻璃舱壁 · 激光扫描线 · 粒子脉冲

**参考风格**：
- 科幻 HUD（Head-Up Display）的极简数据呈现
- 瑞士国际主义（Swiss Style）的网格与数字排版
- 金融科技机构感（Institutional Fintech）的信任与稳重

---

## 三、色彩系统扩展

### 3.1 基础暗色层（Background Stack）

| 名称 | 色值 | 用途 |
|------|------|------|
| `void-950` | `#03040a` | 主背景（比 slate-950 更纯的黑，带极微蓝紫偏色） |
| `void-900` | `#0a0c15` | 卡片/面板背景 |
| `void-800` | `#131626` | 悬浮层、弹窗、抽屉 |
| `void-700` | `#1c1f3a` | 边框、分割线、表头底 |

> 使用极微的蓝紫偏色（非纯灰），让暗部在 OLED 屏幕上呈现“深空”质感，同时避免发灰。

### 3.2 功能色（Functional Accents）

| 名称 | 色值 | 用途 |
|------|------|------|
| `neon-emerald` | `#00f0a0` | 盈利/买入/正常运行（高饱和霓虹感） |
| `neon-rose` | `#ff4d6d` | 亏损/卖出/风险警报 |
| `neon-amber` | `#ffb84d` | 警告/暂停/待处理 |
| `neon-cyan` | `#00e1ff` | 实时数据流、连接状态、选中高亮 |
| `neon-indigo` | `#7b61ff` | 策略/算法、治理流程、品牌主色 |

### 3.3 渐变与光效（Atmosphere）

- **实时脉冲渐变**：`radial-gradient(circle at 50% 0%, rgba(0,225,255,0.08), transparent 60%)` 用于顶部导航栏下方，营造“全息投影”光晕。
- **风险警戒氛围**：当存在 open alert 或 exchange health 异常时，在页面顶部边缘叠加 `box-shadow: 0 0 40px rgba(255,77,109,0.15)`。
- **卡片微光边框**：`border: 1px solid rgba(255,255,255,0.06)` 配合 `box-shadow: 0 4px 24px rgba(0,0,0,0.4)`，让卡片像悬浮的玻璃面板。

### 3.4 数据可视化色板

用于 Recharts 图表：
```
series-1: #00e1ff (cyan)      — 价格/主指标
series-2: #7b61ff (indigo)    — 策略信号
series-3: #00f0a0 (emerald)   — 正向收益
series-4: #ff4d6d (rose)      — 回撤/负向
series-5: #ffb84d (amber)     — 成交量/辅助
grid:    rgba(255,255,255,0.05)
tooltip: rgba(10,12,21,0.95)  backdrop-blur
```

---

## 四、字体与排版层级

### 4.1 字体栈

```css
/* 数字与数据：等宽，确保表格对齐 */
--font-mono: "SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, monospace;

/* 标题与界面文本：清晰无衬线 */
--font-sans: "Inter", "SF Pro Display", "Segoe UI", ui-sans-serif, system-ui;
```

> 建议安装 `JetBrains Mono`（Google Fonts 免费）作为等宽字体，提升数字表格的可读性。

### 4.2 字号层级

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| Display | `1.75rem` (28px) | 700 | 页面大标题（Dashboard / Trading） |
| Heading | `1rem` (16px) | 600 | 卡片标题、区块标签 |
| Body | `0.875rem` (14px) | 400 | 正文、描述 |
| Data | `0.875rem` (14px) | 500 | 表格内容、KPI 数值 |
| Micro | `0.75rem` (12px) | 500 | Badge、时间戳、辅助说明 |
| Nano | `0.6875rem` (11px) | 600 | 状态标签、缩写单位 |

### 4.3 排版规则

- **所有金额、数量、价格使用等宽字体**，确保右对齐表格在数据刷新时不“抖动”。
- **正数前缀可加 `+`**：如 `+12.45%`、`+$1,240.00`，强化盈亏方向感。
- **时间戳统一格式**：`HH:mm:ss` 或 `YYYY-MM-DD HH:mm:ss`，使用等宽字体。

---

## 五、数据可视化策略

### 5.1 图表引入原则

当前页面以表格和 JSON 为主，建议按优先级逐步引入可视化：

1. **Dashboard**：新增“账户权益曲线”迷你面积图（Sparkline）+ “最近 24h 执行量”柱状图。
2. **Markets**：Basis/Funding 用横向条形图或迷你折线图替代纯数字表格，一眼识别异常。
3. **Risk**：Exchange Health 用“仪表盘/半圆环图”展示失败率或健康评分。
4. **Strategies**：Backtest/Optimize 结果用收益曲线图 + 回撤阴影图呈现。
5. **Alerts**：时间轴（Timeline）展示 alert 发生频率与 severity 分布。

### 5.2 表格视觉升级

- **表头**：背景 `void-900`，文字 `slate-400`，字号 `micro`，字母全大写 + `tracking-wider`。
- **行高**：增加到 `44px`，避免信息拥挤。
- **行状态**：
  - hover 时背景 `void-800/60` + 左侧 `2px` 竖线高亮（与行数据类型同色）。
  - 新数据插入时，行背景闪烁一次 `neon-cyan/5`（见动效章节）。
- **右对齐列**：所有数字列统一右对齐，表头也右对齐。

### 5.3 KPI 卡片升级

当前 `KpiCard` 过于朴素，建议升级为「玻璃面板」风格：
- 背景：`void-900` + `backdrop-blur(8px)`
- 顶部 1px 渐变边框：`linear-gradient(90deg, transparent, rgba(0,225,255,0.3), transparent)`
- 数值使用 `font-mono`，大字号 `1.5rem`
- 状态 badge 放在数值右侧，而非替代数值

---

## 六、微交互与动效设计

### 6.1 实时感表达（The "Live" Pulse）

**连接状态指示灯**：
- 在 Layout 顶部或页面标题旁放置一个 `8px` 圆点。
- 正常时：`neon-cyan` + `animation: pulse-cyan 2s infinite`
- 断连时：`neon-rose` + 停止脉冲

```css
@keyframes pulse-cyan {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0, 225, 255, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(0, 225, 255, 0); }
}
```

**数据刷新提示**：
- 每次轮询更新后，在页面右上角显示一个极小的 `flash` 条：`1px` 高，`neon-cyan`，从左到右 `300ms` 滑过，表示“刚刚同步”。

**数值变化动画**：
- 当 KPI 数值或表格中的价格发生变化时：
  - 增加：文字颜色瞬间变为 `neon-emerald`，`200ms` 后渐变回原色。
  - 减少：文字颜色瞬间变为 `neon-rose`，`200ms` 后渐变回原色。

### 6.2 风险视觉表达（Risk = Tension）

**全局风险氛围**：
- 当 `RiskPage` 中存在 `state !== 'healthy'` 的 exchange health 时：
  - 页面顶部出现一条细红线（`1px`，`neon-rose`），并带有微弱 glow。
  - 对应卡片边框颜色从 `void-700` 过渡到 `neon-rose/20`。

**Alert  severity 视觉编码**：
- `critical`：文字 `neon-rose` + 左侧竖条 `neon-rose` + 行背景 `neon-rose/5`
- `warning`：文字 `neon-amber` + 左侧竖条 `neon-amber`
- `info`：文字 `neon-cyan` + 左侧竖条 `neon-cyan`

**按钮危险操作强化**：
- Stop / Delete / Remove 等破坏性按钮：
  - 默认状态：`void-800` 背景 + `neon-rose` 文字
  - Hover 状态：背景填充 `neon-rose` + 白色文字
  - 增加 `100ms` 的 scale(0.98) 按压反馈

### 6.3 通用过渡动效

- **页面切换**：`fade-in` `200ms` + `translateY(4px)` → `0`，营造“层叠浮现”感。
- **卡片加载**：stagger 延迟 `50ms`，每张卡片从 `opacity: 0, translateY(8px)` 渐入。
- **Modal 弹窗**：背景遮罩 `fade-in` `150ms`，内容 `scale(0.96)` → `scale(1)` + `opacity`。
- **Toast 通知**：从右侧滑入，`300ms`，停留 `3s` 后滑出。

### 6.4 交互动效细节

- **NavLink 激活态**：
  - 背景 `void-800` + 左侧 `2px` `neon-cyan` 竖线
  - 图标颜色变为 `neon-cyan`
  - 过渡 `150ms ease-out`

- **表格行 Hover**：
  - 背景色过渡 `100ms`
  - 若该行有操作按钮，按钮从 `opacity: 0` 渐显为 `opacity: 1`

- **Input Focus**：
  - 边框从 `void-700` 变为 `neon-cyan/40`
  - 增加 `0 0 0 2px rgba(0,225,255,0.1)` 外发光

---

## 七、组件级改造建议

### 7.1 Layout（导航框架）

- 左侧 sidebar 背景改为 `void-950`，与主内容区 `void-900` 形成深浅对比。
- Logo 区增加一个「量子环」图标（可用 SVG 绘制：一个旋转的缺口圆环，颜色 `neon-cyan`）。
- 底部用户区改为更紧凑的「身份徽章」设计：头像缩写 + 角色 tag。

### 7.2 DashboardPage

- 顶部 KPI 区改为 4 列「玻璃卡片」，每张卡片顶部有不同颜色的细线（Mode=indigo, Runtime=cyan, Pairs=emerald, Orders=amber）。
- Recent Executions 表格增加「Side」列的箭头图标（Lucide `ArrowUp`/`ArrowDown`），buy= emerald 上箭头，sell=rose 下箭头。
- System Summary 的 JSON 块改为「可折叠树形视图」或「键值对网格」，避免大段灰色文字。

### 7.3 MarketsPage

- Market Runtime 卡片顶部增加「扫描线」动画（一条 `neon-cyan` 透明线自上而下扫描），象征实时数据接入。
- Features 表格中的 `basisBps` 和 `fundingRate` 增加「迷你趋势条」：在单元格内用一条细横条表示数值相对历史区间的位置。

### 7.4 TradingPage

- New Order 表单区改为「订单面板」风格：
  - 左侧为参数输入区，右侧为实时预览/确认区。
  - Buy/Sell 切换使用大号的左右分栏按钮，buy 侧 hover 泛 emerald glow，sell 侧 hover 泛 rose glow。
- Positions 表格中，Unrealized PnL 增加「盈亏条」背景：正值时单元格背景从左到右有极淡的 emerald 渐变条，长度与盈亏幅度成正比。

### 7.5 RiskPage

- 整体氛围应最“紧张”。
- Protections 表格中，Enabled=Yes 时显示一个「锁定」图标（Lucide `Lock`），颜色 `neon-emerald`；No 时显示「解锁」图标 `neon-rose`。
- Exchange Health 表格中，Failures 列用「热度条」：0=无色，1-2=amber，3+=rose 且条带闪烁。

### 7.6 StrategiesPage

- Runtime Status 的 Actions 列按钮过于密集，建议改为「操作菜单」或图标按钮组（Play / Pause / Stop），hover 显示 tooltip。
- Backtest / Optimize / Walk-Forward 表单区使用「步骤条」或 Tab 切换，减少一屏内的表单数量。
- Result JSON 块改为「结果卡片」：提取关键指标（Net PnL、Sharpe、Max Drawdown）作为顶部 KPI，下方再折叠显示完整 JSON。

### 7.7 AlertsPage

- 顶部 summary 卡片改为「计数器」风格：数字使用 `font-mono` `1.5rem`，Open 数字若大于 0 则带有 subtle 的 `pulse-rose` 动画。
- Alert 表格中，Message 列截断并 hover 显示完整内容 tooltip，避免行高不统一。

---

## 八、Tailwind 配置草案

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#03040a',
          900: '#0a0c15',
          800: '#131626',
          700: '#1c1f3a',
        },
        neon: {
          emerald: '#00f0a0',
          rose: '#ff4d6d',
          amber: '#ffb84d',
          cyan: '#00e1ff',
          indigo: '#7b61ff',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s infinite',
        'flash-bar': 'flash-bar 300ms ease-out',
        'fade-in-up': 'fade-in-up 200ms ease-out',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0,225,255,0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 0 6px rgba(0,225,255,0)' },
        },
        'flash-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,225,255,0.15)',
        'glow-rose': '0 0 20px rgba(255,77,109,0.15)',
        'glow-emerald': '0 0 20px rgba(0,240,160,0.15)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
```

---

## 九、实施优先级建议

### Phase 1：基础氛围（1-2 天）
1. 更新 `tailwind.config.js` 色彩与字体
2. 替换全局背景色为 `void` 系列
3. 升级 `KpiCard` 与 `DataTable` 样式
4. 增加实时脉冲指示灯与 flash-bar 动效

### Phase 2：页面差异化（2-3 天）
1. Dashboard：增加 sparkline 图表（可用 Recharts）
2. Trading：订单面板视觉重构
3. Risk：风险氛围（顶部红线、热度条、锁定图标）
4. Alerts：计数器动画与 severity 行高亮

### Phase 3：动效与打磨（1-2 天）
1. 数值变化颜色闪烁
2. 页面切换 fade-in-up
3. Modal / Toast 动效
4. 表格行新数据插入高亮

---

## 十、设计原则总结

| 原则 | 说明 |
|------|------|
| **黑暗即画布** | 用深空黑作为背景，让数据像星光一样被点亮。 |
| **颜色即语言** | 每种霓虹色都有明确语义：cyan=实时、emerald=正向、rose=风险、indigo=策略。 |
| **动效即状态** | 没有装饰性动画，每一个动效都在传达“连接中”“已更新”“请注意”。 |
| **数字即主角** | 等宽字体、右对齐、前缀符号，让 financial data 成为视觉焦点。 |
| **风险可视化** | 风险不是文字，而是颜色、光效、闪烁、热度条的综合感官体验。 |

---

*文档路径：`/Users/mac/Desktop/code/quant-engine-admin/docs/visual-design-direction.md`*
