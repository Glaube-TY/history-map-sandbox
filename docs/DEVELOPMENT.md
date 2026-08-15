# 开发说明

## Node 环境

推荐使用 Node.js 22.18+ 和 npm 10+。低版本 Node 可能在安装依赖时出现 `EBADENGINE` warning，建议升级 Node 后再执行安装和构建。

项目使用 npm 作为包管理器，并提交 `package-lock.json` 以保证依赖安装可复现。

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

访问：

```text
http://localhost:5173/history-map-sandbox/#/
```

局域网访问：

```bash
npm run dev:lan
```

## 数据校验

新增或修改专题数据后，建议先运行数据校验：

```bash
npm run validate:data
```

新增专题尤其建议先本地运行 `npm run validate:data`，确认 `metadata.json`、`events.json`、各 GeoJSON 和 `sources.json` 都符合当前校验规则后再提交。

校验失败时会输出具体错误并退出非零状态码。GitHub Actions 部署流程会在 `npm run build` 之前自动执行 `npm run validate:data`，因此提交到 `main` 分支的数据如果校验失败会阻止部署。

当前校验已包含：专题列表与 metadata 一致性、`subjects`/`factions` 兼容与一致性、GeoJSON `properties.id` 唯一性、Polygon ring 闭合、坐标与高度有限性检查等。脚本结束时会输出已校验专题数、事件数和 GeoJSON 要素数的摘要。

## 构建

```bash
npm run build
```

## 生产预览

```bash
npm run preview
```

访问：

```text
http://localhost:4173/history-map-sandbox/#/
```

## 端口说明

- 开发服务：`5173`
- 生产预览：`4173`

如果端口被占用，可临时修改 npm 脚本或手动指定 Vite 端口。

## Git 分支建议

- `main`：稳定分支，用于 GitHub Pages 部署。
- `feature/*`：功能开发分支。
- `docs/*`：文档调整分支。

## Commit Message 规范

建议使用简洁的英文类型前缀：

- `feat:` 新功能。
- `fix:` 修复问题。
- `docs:` 文档。
- `chore:` 工程配置。
- `refactor:` 重构。

## 依赖管理规范

- 使用 npm，不混用 yarn 或 pnpm。
- 提交 `package-lock.json`。
- 不提交 `node_modules`、`dist`、`.env.local`。

## .env 说明

复制 `.env.example` 为 `.env.local` 后可填写：

```text
VITE_CESIUM_ION_TOKEN=
VITE_TDT_TOKEN=
VITE_BASEMAP_MODE=demo
VITE_TERRAIN_MODE=flat
```

### 地形模式

- `VITE_TERRAIN_MODE=flat`（默认）：基础平面地形，使用默认椭球，不依赖外部地形服务。
- `VITE_TERRAIN_MODE=cesium-ion`：Cesium Ion 三维地形，需要配置 `VITE_CESIUM_ION_TOKEN`；未配置 token 时自动回退到基础平面地形，不会导致页面崩溃。

### 运行时地形切换

场景页地图右上方提供轻量地形切换按钮：平面 / 地形。切换后立即生效并保存到 `localStorage`（key：`history-map-sandbox:terrain-mode`）。初始化优先级为：

1. `localStorage` 中的有效值
2. `VITE_TERRAIN_MODE`
3. 默认 `flat`

注意：前端环境变量会暴露在浏览器中，因此 `VITE_CESIUM_ION_TOKEN` 只能作为公开 key 使用，建议在 Cesium Ion 后台限制可用域名。

### 视角预设

场景页地图工具栏提供视角预设按钮：

- **俯视**：回到当前专题数据范围上空的近似垂直俯视视角，优先根据 places / routes / zones 数据范围定位，无数据时回退到 `center + defaultCameraHeight`。
- **三维视角**：切换到带倾斜角度的斜视视角（pitch 约 -42°），让地形起伏更明显，适合在启用三维地形后观察“沙盘感”。

视角切换只改变相机，不改变底图模式、地形模式、专题数据图层和时间轴。

### 底图模式

- `VITE_BASEMAP_MODE=demo`（默认）：公开演示底图，基于 OpenStreetMap，用于开发和普通预览。
- `VITE_BASEMAP_MODE=grid`：纯网格兜底模式，不依赖外部图源。
- `VITE_BASEMAP_MODE=tdt`：天地图矢量底图模式，加载天地图矢量底图层和中文注记层，需要配置 `VITE_TDT_TOKEN`；未配置 token 时自动回退到公开演示底图，加载失败时自动回退到基础网格兜底模式，不会导致页面崩溃。

### 运行时底图切换

场景页地图右上方提供轻量底图切换按钮：公开 / 天地图 / 网格。切换后立即生效并保存到 `localStorage`（key：`history-map-sandbox:basemap-mode`）。初始化优先级为：

1. `localStorage` 中的有效值
2. `VITE_BASEMAP_MODE`
3. 默认 `demo`

注意：前端环境变量会暴露在浏览器中，因此 `VITE_TDT_TOKEN` 只能作为公开 key 使用，建议在天地图后台限制可用域名。

第一版不强制使用真实地形。未配置 Cesium Ion token 时，页面使用公开演示底图或网格兜底。
