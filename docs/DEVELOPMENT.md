# 开发说明

## Node 环境

建议使用 Node 22+。项目使用 npm 作为包管理器，并提交 `package-lock.json` 以保证依赖安装可复现。

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
```

第一版不强制使用真实地形。未配置 Cesium Ion token 时，页面使用基础地图模式。
