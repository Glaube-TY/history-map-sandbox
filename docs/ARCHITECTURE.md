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
- `tdt`：天地图矢量底图模式，加载天地图矢量底图层和中文注记层，需要配置天地图 token；影像底图与三维地形作为后续扩展。
- `grid`：基础网格兜底模式，当在线底图加载失败或没有 token 时展示，保证场景始终可用。

当前版本已实现底图模式抽象：

- `demo` 模式使用 OpenStreetMap 公开图源，并在底层保留网格兜底。
- `grid` 模式仅使用基础网格，不依赖外部图源。
- `tdt` 模式已接入天地图矢量底图层（`vec`）和中文注记层（`cva`），需要配置 `VITE_TDT_TOKEN`；未配置 token 时自动回退到 `demo`，加载失败时自动回退到 `grid`。影像底图与三维地形不在当前版本范围内。

`CesiumViewer.vue` 通过 `VITE_BASEMAP_MODE` 读取默认模式，调用 `createSandboxViewer` 初始化对应底图，并通过 `BasemapStatus` 在地图角落显示当前底图状态。地图右上方提供运行时底图切换按钮，切换时只替换 `imageryLayers`，不影响专题数据图层（places / routes / zones）。用户选择会持久化到 `localStorage`，下次进入场景页时优先使用。

## 地形模式抽象

当前版本已增加轻量地形模式抽象，为后续三维地形展示做准备：

- `flat`：基础平面地形，使用默认椭球，不依赖外部地形服务。
- `cesium-ion`：Cesium Ion 三维地形，通过 `Cesium.Terrain.fromWorldTerrain()` 启用，需要配置 `VITE_CESIUM_ION_TOKEN`；未配置 token 或启用失败时自动回退到 `flat`，不会导致页面崩溃。

`CesiumViewer.vue` 通过 `VITE_TERRAIN_MODE` 读取默认地形模式，初始化时优先使用 `localStorage` 中保存的有效值（key：`history-map-sandbox:terrain-mode`）。地图右上方提供轻量地形切换按钮：平面 / 地形。切换地形只调整 `scene.terrain`，不影响底图、专题数据图层（places / routes / zones）和时间轴。

地形状态 `TerrainStatus` 与底图状态 `BasemapStatus` 独立显示，避免状态信息混淆。

本阶段只接入 Cesium Ion 官方地形入口。自托管 DEM / 中国区域地形瓦片等后续扩展不在当前版本范围内。

## 相机控制

相机控制作为前端交互层，独立于底图、地形和专题数据图层：

- `cesiumRenderer.ts` 提供 `flyToScenarioOverviewTopDown` 和 `flyToScenarioOblique`，分别对应“俯视”和“三维视角”两种预设。
- 相机函数优先根据 `places / routes / zones` 数据范围定位，无数据时回退到专题 `center + defaultCameraHeight`。
- `CesiumViewer.vue` 在地图工具栏提供视角切换按钮，只调整 `viewer.camera`，不修改底图、地形、专题数据图层或时间轴状态。
- “三维视角”使用 `HeadingPitchRoll` 等价方式设置 pitch（约 -42°），在启用 Cesium Ion 三维地形时更易观察地形起伏。

后续可扩展更多视角，例如当前事件斜视、路线跟随、时间轴自动镜头等。

## 未来后端扩展方向

- Supabase：用于快速管理专题元数据、用户贡献和审核流程。
- Cloudflare Workers：用于轻量 API、缓存、权限控制和边缘部署。
- 自建 PostGIS：用于复杂空间查询、历史边界版本管理和大规模地理数据处理。
