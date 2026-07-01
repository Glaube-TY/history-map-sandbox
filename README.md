# History Map Sandbox

History Map Sandbox 是一个历史地图沙盘前端项目，用地图、地形视角和时间轴展示历史事件的空间演变。当前阶段以中国历史战争/战役案例作为演示数据，但架构保留为通用历史空间叙事工具，后续可扩展到历史事件、疆域变迁、迁徙路线、贸易路线、人物行迹和城市历史等主题。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- CesiumJS
- dayjs
- @turf/turf
- GitHub Actions + GitHub Pages

## 环境要求

推荐使用 Node.js 22.18+ 和 npm 10+。低版本 Node 可能在安装依赖时出现 `EBADENGINE` warning，建议升级 Node 后再执行安装和构建。

## 快速开始

```bash
npm install
npm run dev
```

本地开发地址：

```text
http://localhost:5173/history-map-sandbox/#/
```

## 本地开发

```bash
npm run dev
npm run dev:lan
```

`dev` 绑定 `127.0.0.1:5173`，`dev:lan` 绑定 `0.0.0.0:5173`，便于局域网设备访问。

## 构建预览

```bash
npm run build
npm run preview
```

生产预览地址：

```text
http://localhost:4173/history-map-sandbox/#/
```

## GitHub Pages 部署

项目使用 GitHub Actions 部署到 GitHub Pages。推送到 `main` 或手动触发工作流后，会执行 `npm ci`、`npm run build`，并上传 `dist` 目录。

仓库 Pages 设置：

```text
Settings -> Pages -> Source -> GitHub Actions
```

## 数据目录说明

第一版不使用后端，所有专题数据放在 `public/data`：

- `public/data/scenarios.json`：专题列表。
- `public/data/scenarios/{id}/metadata.json`：专题元数据。
- `public/data/scenarios/{id}/events.json`：时间轴事件。
- `public/data/scenarios/{id}/places.geojson`：地点点位。
- `public/data/scenarios/{id}/routes.geojson`：路线。
- `public/data/scenarios/{id}/zones.geojson`：区域。
- `public/data/scenarios/{id}/sources.json`：来源与校订说明。

## 许可证占位

项目代码许可证待定。公开发布前需要补充明确的开源许可证。

## 免责声明

当前示例数据仅用于历史学习、可视化展示和开源研究，不构成正式史料、地图边界或军事研究结论。正式专题发布前必须补充史料来源、地图来源、坐标校订和许可说明。
