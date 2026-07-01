# 数据模型

## scenarios.json

`public/data/scenarios.json` 是专题列表，用于首页卡片展示。

字段：

- `id`：专题唯一标识，也是专题目录名。
- `title`：专题标题。
- `category`：专题分类。
- `period`：时间范围的展示文案。
- `location`：地点文案。
- `summary`：摘要。
- `cover`：封面或图标路径。

## metadata.json

专题元数据，位于 `public/data/scenarios/{id}/metadata.json`。

字段：

- `id`
- `title`
- `category`
- `startDate`
- `endDate`
- `center`：默认中心点 `[longitude, latitude]`。
- `defaultCameraHeight`
- `summary`
- `tags`
- `factions`

`metadata.factions` 当前作为第一版兼容字段使用，可表达战争专题中的参与方，也可表达非战争专题中的对象、线路、城市、机构等。渲染层会用 `factions[].id` 匹配 GeoJSON 要素的 `properties.faction`，并使用 `factions[].color` 控制点、线、面颜色。后续可能将该字段泛化为 `subjects` 或 `actors`，但本阶段不重构字段名。

## events.json

时间轴事件数组。第一版以事件节点驱动，不做连续时间插值。

字段：

- `id`
- `time`
- `title`
- `description`
- `focus`：地图聚焦信息。
- `visibleLayers`：事件建议显示的图层。

## places.geojson

地点点位，使用 GeoJSON `FeatureCollection`，几何类型为 `Point`。

properties 包含：

- `id`
- `name`
- `type`
- `faction`：可选，用于匹配 `metadata.factions` 中的颜色。
- `description`
- `startTime`
- `endTime`

## routes.geojson

路线数据，使用 GeoJSON `FeatureCollection`，几何类型为 `LineString`。

properties 包含：

- `id`
- `name`
- `type`
- `faction`
- `description`
- `startTime`
- `endTime`

## zones.geojson

区域数据，使用 GeoJSON `FeatureCollection`，几何类型为 `Polygon`。

properties 包含：

- `id`
- `name`
- `type`
- `faction`
- `description`
- `startTime`
- `endTime`

## sources.json

记录专题资料来源、地图来源、坐标校订说明和许可提示。示例专题仅写明演示性质，正式专题必须补充可核验来源。

## 如何新增一个专题

1. 在 `public/data/scenarios.json` 增加专题摘要。
2. 新建 `public/data/scenarios/{id}` 目录。
3. 添加 `metadata.json`、`events.json`、`places.geojson`、`routes.geojson`、`zones.geojson`、`sources.json`。
4. 确认坐标使用 `[longitude, latitude]` 顺序。
5. 在 `metadata.json` 中使用通用专题描述，不要把字段含义限定为战争或战役。当前 `factions` 字段可临时表达“对象/主题”，例如“大运河沿线城市”“漕运与交通线路”。
6. 在 `sources.json` 中标明资料状态；演示数据必须说明坐标和线路不是正式史料成果。
7. 运行 `npm run dev` 或 `npm run preview` 检查首页和场景页。
8. 运行 `npm run build` 确认类型和构建通过。

`public/data/scenarios/grand-canal` 提供了一个非战争专题示例：大运河历史线路。它展示了节点城市、历史交通线路、示意影响范围和时间轴事件如何复用同一套数据模型。
