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
5. 运行 `npm run dev` 检查首页和场景页。
6. 运行 `npm run build` 确认类型和构建通过。
