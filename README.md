# History Map Sandbox

History Map Sandbox 是一个历史地图沙盘前端项目，用地图、地形视角和时间轴展示历史事件的空间演变。当前阶段以中国历史专题作为演示数据，已包含战争战役与历史线路两个示例。架构保留为通用历史空间叙事工具，后续可扩展到历史事件、疆域变迁、迁徙路线、贸易路线、人物行迹和城市历史等主题。

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

## 专题分类筛选

首页支持按 `category` 对专题进行轻量分类筛选。专题卡片上方会显示自动生成的分类标签（如“全部”“战争战役”“历史线路”等），点击即可切换，并实时显示当前筛选下的专题数量。

## 数据目录说明

第一版不使用后端，所有专题数据放在 `public/data`：

- `public/data/scenarios.json`：专题列表。
- `public/data/scenarios/{id}/metadata.json`：专题元数据，支持 `displayPeriod` 和通用 `subjects` 字段，以适配战争参与方、历史线路、城市节点、机构、人物等多种历史对象。`subjects` 是推荐字段，`factions` 是第一版兼容字段。点、线、面颜色优先由 `properties.subject` 匹配 `metadata.subjects`，缺失时回退到 `properties.faction` 匹配 `metadata.factions`。
- `public/data/scenarios/{id}/events.json`：时间轴事件，支持 `displayTime` 和 `sortOrder` 字段。
- `public/data/scenarios/{id}/places.geojson`：地点点位。
- `public/data/scenarios/{id}/routes.geojson`：路线。
- `public/data/scenarios/{id}/zones.geojson`：区域。
- `public/data/scenarios/{id}/sources.json`：来源与校订说明。

当前示例项目包含两个专题：

- **平型关大捷**：战争战役类示例。
- **大运河历史线路**：非战争历史线路示例，用于验证模型对交通、城市节点、区域范围等广义历史主题的表达能力。

## 许可证占位

项目代码许可证待定。公开发布前需要补充明确的开源许可证。

## 免责声明

当前示例数据仅用于历史学习、可视化展示和开源研究，不构成正式史料、地图边界或军事研究结论。正式专题发布前必须补充史料来源、地图来源、坐标校订和许可说明。
