# 架构说明

## 前端静态架构

第一版是纯前端静态应用，不包含后端服务。Vite 负责构建，Vue Router 使用 hash router 适配 GitHub Pages，Pinia 预留全局状态管理能力，CesiumJS 负责地图场景渲染。

## 数据流

1. 首页读取 `public/data/scenarios.json`。
2. 场景页根据路由参数 `scenario/:id` 读取专题目录。
3. `scenarioLoader.ts` 加载 metadata、events、places、routes、zones 和 sources。
4. `useScenarioData.ts` 持有加载状态。
5. `useTimeline.ts` 根据 events 推导当前事件。
6. `useLayerControl.ts` 管理 places、routes、zones、events 图层开关。
7. `CesiumViewer.vue` 接收数据和图层状态并渲染地图实体。

## 页面结构

- `/`：首页，展示专题卡片。
- `#/scenario/:id`：场景页，展示地图沙盘、图层和时间轴。
- `#/about`：关于页，说明项目用途、数据来源和合规要求。

## 组件结构

- `AppHeader.vue`：顶部导航。
- `CesiumViewer.vue`：Cesium 初始化和地图容器。
- `ScenarioPanel.vue`：专题元数据与当前事件摘要。
- `LayerPanel.vue`：图层开关。
- `LegendPanel.vue`：通用图例。
- `TimelinePlayer.vue`：事件节点播放、暂停、重置和进度拖动。
- `EventPanel.vue`：当前事件详情。

## 为什么第一版不做后端

当前阶段重点是验证前端交互、数据结构和部署路径。静态 JSON/GeoJSON 更容易审查、版本化和托管，也能直接部署到 GitHub Pages，降低维护成本。

## 后续底图模式规划

为适配不同部署环境和合规要求，地图底图计划支持以下几种模式：

- `demo`：公开演示底图，基于 OpenStreetMap 等公开图源，用于开发、普通预览和 GitHub Pages 演示。
- `tdt`：天地图模式，用于后续中国地图正式展示，需要配置天地图 token。
- `grid`：基础网格兜底模式，当在线底图加载失败或没有 token 时展示，保证场景始终可用。

当前版本仍使用公开演示底图（`demo`）和网格兜底（`grid`）。天地图模式仅在 `vite-env.d.ts` 中预留了 `VITE_TDT_TOKEN` 配置入口，具体实现放到下一阶段。

## 未来后端扩展方向

- Supabase：用于快速管理专题元数据、用户贡献和审核流程。
- Cloudflare Workers：用于轻量 API、缓存、权限控制和边缘部署。
- 自建 PostGIS：用于复杂空间查询、历史边界版本管理和大规模地理数据处理。
