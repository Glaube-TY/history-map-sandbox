# 部署说明

## GitHub Pages 部署流程

项目通过 GitHub Actions 部署到 GitHub Pages：

1. 推送到 `main` 分支，或在 Actions 页面手动触发。
2. 安装 Node 22。
3. 执行 `npm ci`。
4. 执行 `npm run build`。
5. 上传 `dist` 目录。
6. 发布到 GitHub Pages。

## GitHub Actions 工作流

工作流文件位于 `.github/workflows/deploy.yml`，包含：

- `actions/checkout`
- `actions/setup-node`
- `npm ci`
- `npm run build`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

## 仓库设置

在 GitHub 仓库中打开：

```text
Settings -> Pages -> Source -> GitHub Actions
```

## base path 为什么是 /history-map-sandbox/

GitHub Pages 项目页部署在仓库名路径下，资源地址需要带上 `/history-map-sandbox/` 前缀。Vite 的 `base` 已设置为该路径。

## 常见问题

### 空白页

检查浏览器控制台是否有资源 404。确认 `vite.config.ts` 的 `base` 为 `/history-map-sandbox/`。

### 资源 404

确认 Cesium 静态资源被复制到 `dist/cesiumStatic`，并且 `CESIUM_BASE_URL` 指向 `/history-map-sandbox/cesiumStatic/`。

### 路由刷新问题

项目使用 hash router，访问路径形如：

```text
https://{owner}.github.io/history-map-sandbox/#/scenario/pingxingguan
```

hash 后的路由不会触发 GitHub Pages 的静态文件匹配，可避免子路由刷新 404。
