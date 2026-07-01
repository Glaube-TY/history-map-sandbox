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
```

### 底图模式

- `VITE_BASEMAP_MODE=demo`（默认）：公开演示底图，基于 OpenStreetMap，用于开发和普通预览。
- `VITE_BASEMAP_MODE=grid`：纯网格兜底模式，不依赖外部图源。
- `VITE_BASEMAP_MODE=tdt`：天地图矢量底图模式，加载天地图矢量底图层和中文注记层，需要配置 `VITE_TDT_TOKEN`；未配置 token 时自动回退到公开演示底图，加载失败时自动回退到基础网格兜底模式，不会导致页面崩溃。

注意：前端环境变量会暴露在浏览器中，因此 `VITE_TDT_TOKEN` 只能作为公开 key 使用，建议在天地图后台限制可用域名。

第一版不强制使用真实地形。未配置 Cesium Ion token 时，页面使用公开演示底图或网格兜底。
