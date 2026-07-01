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
- `displayPeriod`（可选）：用于场景页展示的自然语言时间范围，例如“1937年9月”“隋唐至明清”。存在时优先于 `startDate`/`endDate` 的格式化范围显示。
- `startDate`
- `endDate`：机器可读时间，仍作为排序、计算和时间范围后备显示使用。
- `center`：默认中心点 `[longitude, latitude]`。
- `defaultCameraHeight`
- `summary`
- `tags`
- `subjects`（可选）：推荐的新字段，用于表达专题中的主题对象，例如战争参与方、历史线路、城市节点、机构、人物等。
- `factions`（可选）：第一版兼容字段，功能与 `subjects` 相同。

`metadata.subjects` 是推荐字段，可表达战争专题中的参与方，也可表达非战争专题中的对象、线路、城市、机构、人物等。`metadata.factions` 作为第一版兼容字段保留，后续会逐步淡化。渲染层会通过 `resolveScenarioSubjects(metadata)` 优先使用 `subjects`，缺失时回退到 `factions`。

## events.json

时间轴事件数组。第一版以事件节点驱动，不做连续时间插值。

字段：

- `id`
- `time`：事件时间，用于排序和默认显示。
- `displayTime`（可选）：用于时间轴展示的文案，例如“隋唐以来”“1937年9月25日清晨”。存在时优先显示。
- `sortOrder`（可选）：数字越小越靠前。存在时优先于 `time` 参与排序。
- `title`
- `description`
- `focus`：地图聚焦信息。
- `visibleLayers`：事件建议显示的图层，作为图层切换的提示，不会强制覆盖用户手动图层选择。

## 关于空 GeoJSON 图层

`places.geojson`、`routes.geojson`、`zones.geojson` 都必须是 GeoJSON `FeatureCollection`，且 `features` 必须是数组。空 `features` 数组被视为合法的空图层，不会导致专题加载失败。非空时才会进一步校验坐标范围。

## places.geojson

地点点位，使用 GeoJSON `FeatureCollection`，几何类型为 `Point`。

properties 包含：

- `id`
- `name`
- `type`
- `subject`（可选）：推荐字段，用于匹配 `metadata.subjects` 中的颜色。
- `faction`（可选）：兼容字段，功能与 `subject` 相同。
- `description`
- `startTime`
- `endTime`

渲染颜色优先使用 `subject`，缺失时回退到 `faction`。

## routes.geojson

路线数据，使用 GeoJSON `FeatureCollection`，几何类型为 `LineString`。

properties 包含：

- `id`
- `name`
- `type`
- `subject`（可选）：推荐字段。
- `faction`：兼容字段。
- `description`
- `startTime`
- `endTime`

## zones.geojson

区域数据，使用 GeoJSON `FeatureCollection`，几何类型为 `Polygon`。

properties 包含：

- `id`
- `name`
- `type`
- `subject`（可选）：推荐字段。
- `faction`：兼容字段。
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
5. 在 `metadata.json` 中使用通用专题描述，不要把字段含义限定为战争或战役。
   - 新专题优先使用 `metadata.subjects` 表达主题对象，例如“大运河沿线城市”“漕运与交通线路”。
   - GeoJSON properties 优先使用 `subject` 字段匹配颜色。
   - `factions` / `faction` 仅作为旧数据兼容字段保留；后续新增专题不建议再主动使用 `factions`，除非为了兼容旧数据。
6. 在 `sources.json` 中标明资料状态；演示数据必须说明坐标和线路不是正式史料成果。
7. 运行 `npm run dev` 或 `npm run preview` 检查首页和场景页。
8. 运行 `npm run build` 确认类型和构建通过。

`public/data/scenarios/grand-canal` 提供了一个非战争专题示例：大运河历史线路。它展示了节点城市、历史交通线路、示意影响范围和时间轴事件如何复用同一套数据模型。
