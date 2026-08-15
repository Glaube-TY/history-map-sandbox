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

## 底图模式

复制 `.env.example` 为 `.env.local` 后，可通过 `VITE_BASEMAP_MODE` 切换底图：

- `VITE_BASEMAP_MODE=demo`（默认）：公开演示底图，基于 OpenStreetMap，用于开发和普通预览。
- `VITE_BASEMAP_MODE=grid`：纯网格兜底模式，不依赖外部图源。
- `VITE_BASEMAP_MODE=tdt`：天地图矢量底图模式，加载天地图矢量底图层和中文注记层，需要配置 `VITE_TDT_TOKEN`；未配置 token 时自动回退到公开演示底图，加载失败时自动回退到基础网格兜底模式，不会导致页面崩溃。

### 运行时底图切换

场景页地图右上方提供轻量底图切换按钮：公开 / 天地图 / 网格。切换后立即生效，不需要刷新页面。用户的选择会保存到 `localStorage`（key：`history-map-sandbox:basemap-mode`），下次进入场景页时优先使用保存值；若保存值不合法则忽略，并回退到 `VITE_BASEMAP_MODE` 或默认 `demo`。

### 地形模式

复制 `.env.example` 为 `.env.local` 后，可通过 `VITE_TERRAIN_MODE` 切换地形：

- `VITE_TERRAIN_MODE=flat`（默认）：基础平面地形，使用默认椭球，不依赖外部地形服务。
- `VITE_TERRAIN_MODE=cesium-ion`：Cesium Ion 三维地形，需要配置 `VITE_CESIUM_ION_TOKEN`；未配置 token 时自动回退到基础平面地形，不会导致页面崩溃。

场景页地图右上方同时提供轻量地形切换按钮：平面 / 地形。切换后立即生效并保存到 `localStorage`（key：`history-map-sandbox:terrain-mode`），初始化优先级为：localStorage 有效值 > `VITE_TERRAIN_MODE` > 默认 `flat`。前端 token 会暴露在浏览器中，只能作为公开 key 使用，建议限制域名。

### 视角预设

场景页地图工具栏提供轻量视角预设按钮：

- **俯视**：回到当前专题数据范围上空的近似垂直俯视视角；优先根据 places / routes / zones 数据范围定位，没有数据时回退到专题 center + defaultCameraHeight。
- **三维视角**：切换到带倾斜角度的斜视视角（pitch 约 -42°），让地形起伏更明显，增强“沙盘感”。

视角切换只改变相机，不改变底图模式、地形模式、专题数据图层和时间轴。

### 环境变量安全

- `.env.example` 可以提交到仓库，作为配置模板。
- `.env`、`.env.local`、`.env.production` 等包含真实 token 的文件**不要提交**。
- `VITE_TDT_TOKEN`、`VITE_CESIUM_ION_TOKEN` 等以 `VITE_` 开头的变量会被打包到前端，**不能视为真正密钥**，只能作为公开 key 使用。
- 建议在天地图、Cesium Ion 等服务后台限制可用域名，降低 token 被滥用的风险。

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

## 数据校验

新增或修改专题数据后，建议运行数据校验脚本：

```bash
npm run validate:data
```

校验范围包括：

- `scenarios.json`：专题摘要字段、id 格式与唯一性、category 非空；title/category 与 `metadata.json` 不一致时输出 warning。
- `metadata.json`：字段完整性、id 与目录一致性、center 经纬度范围、defaultCameraHeight 有限正数、subjects/factions 格式与颜色。
  - `subjects` 与 `factions` 同时存在且内容完全一致时不输出 warning。
  - `subjects` 与 `factions` 同时存在但 id/name/color 不一致时输出 warning，建议统一使用 `subjects`。
- `events.json`：字段完整性、id 唯一性、focus.center 经纬度、focus.height 有限正数、visibleLayers 合法性、sortOrder 有限数字。
- `places.geojson` / `routes.geojson` / `zones.geojson`：必须是 `FeatureCollection`，几何类型正确，坐标合法，properties 包含必要字段；同一 GeoJSON 文件内 `properties.id` 必须唯一；`zones.geojson` 的 Polygon ring 必须闭合（首尾坐标相同）且至少 4 个点。空 `features` 数组被视为合法空图层。
- `sources.json`：必要字段存在，`historicalSources` / `mapSources` 为数组。

如果 GeoJSON 中的 `subject` / `faction` 引用在 metadata 中找不到，脚本会输出 warning 但不会阻断校验。演示数据允许 `historicalSources` / `mapSources` 为空数组或简短说明，但字段必须存在。

校验结束时脚本会输出摘要：已校验专题数量、事件数量、GeoJSON 要素数量、错误数、警告数。

## 许可证占位

项目代码许可证待定。公开发布前需要补充明确的开源许可证。

## 免责声明

当前示例数据仅用于历史学习、可视化展示和开源研究，不构成正式史料、地图边界或军事研究结论。正式专题发布前必须补充史料来源、地图来源、坐标校订和许可说明。
