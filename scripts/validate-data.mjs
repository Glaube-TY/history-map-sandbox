import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_DIR = process.cwd();
const DATA_DIR = join(ROOT_DIR, 'public', 'data');
const SCENARIOS_PATH = join(DATA_DIR, 'scenarios.json');

const SCENARIO_FILES = [
  'metadata.json',
  'events.json',
  'places.geojson',
  'routes.geojson',
  'zones.geojson',
  'sources.json',
];

const VALID_LAYER_KEYS = new Set(['places', 'routes', 'zones', 'events']);
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const SCENARIO_ID_REGEX = /^[a-z0-9-]+$/;

const errors = [];
const warnings = [];
const stats = {
  scenarioCount: 0,
  eventCount: 0,
  featureCount: 0,
};

function reportError(message) {
  errors.push(message);
  console.error(`❌ ${message}`);
}

function reportWarning(message) {
  warnings.push(message);
  console.warn(`⚠️  ${message}`);
}

function readJson(path) {
  if (!existsSync(path)) {
    return { missing: true, data: null };
  }

  const content = readFileSync(path, 'utf-8');
  try {
    return { missing: false, data: JSON.parse(content) };
  } catch (error) {
    return {
      missing: false,
      data: null,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidCoordinatePair(value) {
  if (!Array.isArray(value) || value.length < 2) {
    return false;
  }

  const [longitude, latitude] = value;
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function validateCoordinatePosition(value, context) {
  if (!Array.isArray(value) || value.length < 2) {
    reportError(`${context} 坐标必须是 [longitude, latitude] 数组`);
    return false;
  }

  const [longitude, latitude] = value;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    reportError(`${context} 坐标必须是有限数字`);
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    reportError(`${context} 经度 ${longitude} 超出 -180 到 180 范围`);
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    reportError(`${context} 纬度 ${latitude} 超出 -90 到 90 范围`);
    return false;
  }

  return true;
}

function isPositiveFiniteNumber(value) {
  return Number.isFinite(value) && typeof value === 'number' && value > 0;
}

function validateScenariosJson(scenarios) {
  if (!Array.isArray(scenarios)) {
    reportError('scenarios.json 必须是数组');
    return [];
  }

  const ids = new Set();
  const validScenarios = [];

  scenarios.forEach((scenario, index) => {
    const prefix = `scenarios.json[${index}]`;

    const requiredFields = ['id', 'title', 'category', 'period', 'location', 'summary', 'cover'];
    requiredFields.forEach((field) => {
      if (!isNonEmptyString(scenario[field])) {
        reportError(`${prefix} 缺少或空字段：${field}`);
      }
    });

    if (scenario.id) {
      if (!SCENARIO_ID_REGEX.test(scenario.id)) {
        reportError(
          `${prefix} 专题 id "${scenario.id}" 只能包含小写字母、数字和短横线`,
        );
      } else if (ids.has(scenario.id)) {
        reportError(`${prefix} 专题 id "${scenario.id}" 重复`);
      } else {
        ids.add(scenario.id);
        validScenarios.push({
          id: scenario.id,
          title: scenario.title,
          category: scenario.category,
        });
      }
    }

    if (scenario.category !== undefined && !isNonEmptyString(scenario.category)) {
      reportError(`${prefix} category 不能为空`);
    }
  });

  return validScenarios;
}

function validateColor(value, context) {
  if (!isNonEmptyString(value)) {
    reportError(`${context} color 不能为空`);
    return false;
  }

  if (!HEX_COLOR_REGEX.test(value)) {
    reportError(`${context} color "${value}" 必须是 #RRGGBB 格式`);
    return false;
  }

  return true;
}

function normalizeSubjectOrFaction(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    color: String(item.color ?? ''),
  };
}

function areSubjectFactionListsEqual(subjects, factions) {
  if (subjects.length !== factions.length) {
    return false;
  }

  const normalizeForCompare = (list) =>
    list
      .map(normalizeSubjectOrFaction)
      .filter(Boolean)
      .sort((a, b) => a.id.localeCompare(b.id));

  const normalizedSubjects = normalizeForCompare(subjects);
  const normalizedFactions = normalizeForCompare(factions);

  if (normalizedSubjects.length !== normalizedFactions.length) {
    return false;
  }

  return normalizedSubjects.every((subject, index) => {
    const faction = normalizedFactions[index];
    return (
      subject.id === faction.id &&
      subject.name === faction.name &&
      subject.color.toLowerCase() === faction.color.toLowerCase()
    );
  });
}

function validateSubjectOrFactionList(list, context) {
  if (!Array.isArray(list)) {
    reportError(`${context} 必须是数组`);
    return new Set();
  }

  const ids = new Set();
  list.forEach((item, index) => {
    const itemContext = `${context}[${index}]`;
    if (!item || typeof item !== 'object') {
      reportError(`${itemContext} 必须是对象`);
      return;
    }

    ['id', 'name'].forEach((field) => {
      if (!isNonEmptyString(item[field])) {
        reportError(`${itemContext} 缺少或空字段：${field}`);
      }
    });

    if (item.id) {
      ids.add(item.id);
    }

    validateColor(item.color, `${itemContext}.color`);
  });

  return ids;
}

function validateMetadata(metadata, scenarioId, scenarioSummary) {
  const context = `scenarios/${scenarioId}/metadata.json`;

  if (!metadata || typeof metadata !== 'object') {
    reportError(`${context} 必须是对象`);
    return { subjectIds: new Set(), factionIds: new Set(), valid: false };
  }

  const requiredFields = [
    'id',
    'title',
    'category',
    'startDate',
    'endDate',
    'center',
    'defaultCameraHeight',
    'summary',
    'tags',
  ];
  requiredFields.forEach((field) => {
    if (metadata[field] === undefined || metadata[field] === null) {
      reportError(`${context} 缺少字段：${field}`);
    }
  });

  if (metadata.id !== scenarioId) {
    reportError(`${context} id "${metadata.id}" 与目录名 "${scenarioId}" 不一致`);
  }

  if (metadata.center && !isValidCoordinatePair(metadata.center)) {
    reportError(`${context} center 必须是合法经纬度 [longitude, latitude]`);
  }

  if (
    metadata.defaultCameraHeight !== undefined &&
    !isPositiveFiniteNumber(metadata.defaultCameraHeight)
  ) {
    reportError(`${context} defaultCameraHeight 必须是有限正数`);
  }

  if (metadata.tags !== undefined && !Array.isArray(metadata.tags)) {
    reportError(`${context} tags 必须是数组`);
  }

  let subjectIds = new Set();
  let factionIds = new Set();

  if (metadata.subjects !== undefined) {
    subjectIds = validateSubjectOrFactionList(
      metadata.subjects,
      `${context}.subjects`,
    );
  }

  if (metadata.factions !== undefined) {
    factionIds = validateSubjectOrFactionList(
      metadata.factions,
      `${context}.factions`,
    );
  }

  if (metadata.subjects === undefined && metadata.factions !== undefined) {
    reportWarning(`${context} 仅使用 factions，这是第一版兼容模式，建议迁移到 subjects`);
  }

  if (metadata.subjects !== undefined && metadata.factions !== undefined) {
    if (areSubjectFactionListsEqual(metadata.subjects, metadata.factions)) {
      // Content is consistent, no warning needed.
    } else {
      reportWarning(`${context} subjects 和 factions 内容不一致，建议统一使用 subjects`);
    }
  }

  if (scenarioSummary) {
    if (
      metadata.title !== undefined &&
      scenarioSummary.title !== undefined &&
      metadata.title !== scenarioSummary.title
    ) {
      reportWarning(`${context} title "${metadata.title}" 与 scenarios.json 不一致`);
    }

    if (
      metadata.category !== undefined &&
      scenarioSummary.category !== undefined &&
      metadata.category !== scenarioSummary.category
    ) {
      reportWarning(
        `${context} category "${metadata.category}" 与 scenarios.json "${scenarioSummary.category}" 不一致`,
      );
    }
  }

  return { subjectIds, factionIds, valid: true };
}

function validateEvents(events, scenarioId) {
  const context = `scenarios/${scenarioId}/events.json`;

  if (!Array.isArray(events)) {
    reportError(`${context} 必须是数组`);
    return;
  }

  const ids = new Set();

  events.forEach((event, index) => {
    const itemContext = `${context}[${index}]`;

    if (!event || typeof event !== 'object') {
      reportError(`${itemContext} 必须是对象`);
      return;
    }

    const requiredFields = ['id', 'time', 'title', 'description', 'focus', 'visibleLayers'];
    requiredFields.forEach((field) => {
      if (event[field] === undefined || event[field] === null) {
        reportError(`${itemContext} 缺少字段：${field}`);
      }
    });

    if (event.id) {
      if (ids.has(event.id)) {
        reportError(`${itemContext} 事件 id "${event.id}" 重复`);
      } else {
        ids.add(event.id);
      }
    }

    if (event.focus) {
      if (!isValidCoordinatePair(event.focus.center)) {
        reportError(`${itemContext}.focus.center 必须是合法经纬度 [longitude, latitude]`);
      }

      if (!isPositiveFiniteNumber(event.focus.height)) {
        reportError(`${itemContext}.focus.height 必须是有限正数`);
      }
    }

    if (!Array.isArray(event.visibleLayers)) {
      reportError(`${itemContext}.visibleLayers 必须是数组`);
    } else {
      event.visibleLayers.forEach((layer) => {
        if (!VALID_LAYER_KEYS.has(layer)) {
          reportError(
            `${itemContext}.visibleLayers 包含非法图层 "${layer}"，只允许 places/routes/zones/events`,
          );
        }
      });
    }

    if (event.sortOrder !== undefined && !Number.isFinite(event.sortOrder)) {
      reportError(`${itemContext}.sortOrder 必须是有限数字`);
    }

    if (event.displayTime !== undefined && typeof event.displayTime !== 'string') {
      reportError(`${itemContext}.displayTime 必须是字符串`);
    }
  });

  stats.eventCount += events.length;
}

function validateGeoJsonFeatureCollection(data, fileName, scenarioId) {
  const context = `scenarios/${scenarioId}/${fileName}`;

  if (!data || typeof data !== 'object') {
    reportError(`${context} 必须是 GeoJSON FeatureCollection`);
    return null;
  }

  if (data.type !== 'FeatureCollection') {
    reportError(`${context} type 必须是 "FeatureCollection"`);
  }

  if (!Array.isArray(data.features)) {
    reportError(`${context} features 必须是数组`);
    return null;
  }

  return data.features;
}

function validateBaseProperties(
  properties,
  context,
  referenceSubjectIds,
  referenceFactionIds,
  propertyIds,
) {
  const requiredFields = ['id', 'name', 'type', 'description'];
  requiredFields.forEach((field) => {
    if (!isNonEmptyString(properties[field])) {
      reportError(`${context} 缺少或空字段：${field}`);
    }
  });

  if (isNonEmptyString(properties.id)) {
    if (propertyIds.has(properties.id)) {
      reportError(`${context} properties.id "${properties.id}" 在当前 GeoJSON 文件中重复`);
    } else {
      propertyIds.add(properties.id);
    }
  }

  const subject = properties.subject;
  const faction = properties.faction;

  if (subject !== undefined && !referenceSubjectIds.has(subject)) {
    reportWarning(`${context}.subject "${subject}" 在 metadata.subjects 中未找到`);
  }

  if (faction !== undefined && !referenceFactionIds.has(faction)) {
    reportWarning(`${context}.faction "${faction}" 在 metadata.factions 中未找到`);
  }
}

function validatePlacesGeoJson(features, scenarioId, referenceSubjectIds, referenceFactionIds) {
  const propertyIds = new Set();

  features.forEach((feature, index) => {
    const context = `scenarios/${scenarioId}/places.geojson[${index}]`;

    if (feature.geometry?.type !== 'Point') {
      reportError(`${context} geometry.type 必须是 "Point"`);
    }

    validateCoordinatePosition(
      feature.geometry?.coordinates,
      `${context}.geometry.coordinates`,
    );

    validateBaseProperties(
      feature.properties ?? {},
      context,
      referenceSubjectIds,
      referenceFactionIds,
      propertyIds,
    );
  });

  stats.featureCount += features.length;
}

function validateRoutesGeoJson(features, scenarioId, referenceSubjectIds, referenceFactionIds) {
  const propertyIds = new Set();

  features.forEach((feature, index) => {
    const context = `scenarios/${scenarioId}/routes.geojson[${index}]`;

    if (feature.geometry?.type !== 'LineString') {
      reportError(`${context} geometry.type 必须是 "LineString"`);
    }

    const coordinates = feature.geometry?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      reportError(`${context} coordinates 至少包含 2 个点`);
    } else {
      coordinates.forEach((position, positionIndex) => {
        validateCoordinatePosition(
          position,
          `${context}.coordinates[${positionIndex}]`,
        );
      });
    }

    validateBaseProperties(
      feature.properties ?? {},
      context,
      referenceSubjectIds,
      referenceFactionIds,
      propertyIds,
    );
  });

  stats.featureCount += features.length;
}

function validateZonesGeoJson(features, scenarioId, referenceSubjectIds, referenceFactionIds) {
  const propertyIds = new Set();

  features.forEach((feature, index) => {
    const context = `scenarios/${scenarioId}/zones.geojson[${index}]`;

    if (feature.geometry?.type !== 'Polygon') {
      reportError(`${context} geometry.type 必须是 "Polygon"`);
    }

    const rings = feature.geometry?.coordinates;
    if (!Array.isArray(rings) || rings.length === 0) {
      reportError(`${context} coordinates 至少包含 1 个 ring`);
    } else {
      rings.forEach((ring, ringIndex) => {
        if (!Array.isArray(ring) || ring.length < 4) {
          reportError(
            `${context}.coordinates[${ringIndex}] 每个 ring 至少包含 4 个点`,
          );
          return;
        }

        ring.forEach((position, positionIndex) => {
          validateCoordinatePosition(
            position,
            `${context}.coordinates[${ringIndex}][${positionIndex}]`,
          );
        });

        const first = ring[0];
        const last = ring[ring.length - 1];
        if (
          !Array.isArray(first) ||
          !Array.isArray(last) ||
          first.length < 2 ||
          last.length < 2 ||
          first[0] !== last[0] ||
          first[1] !== last[1]
        ) {
          reportError(
            `${context}.coordinates[${ringIndex}] Polygon ring 必须闭合（首尾坐标相同）`,
          );
        }
      });
    }

    validateBaseProperties(
      feature.properties ?? {},
      context,
      referenceSubjectIds,
      referenceFactionIds,
      propertyIds,
    );
  });

  stats.featureCount += features.length;
}

function validateSources(sources, scenarioId) {
  const context = `scenarios/${scenarioId}/sources.json`;

  if (!sources || typeof sources !== 'object') {
    reportError(`${context} 必须是对象`);
    return;
  }

  const requiredFields = ['notice', 'historicalSources', 'mapSources', 'coordinateReview', 'licenseNote'];
  requiredFields.forEach((field) => {
    if (sources[field] === undefined || sources[field] === null) {
      reportError(`${context} 缺少字段：${field}`);
    }
  });

  if (sources.historicalSources !== undefined && !Array.isArray(sources.historicalSources)) {
    reportError(`${context} historicalSources 必须是数组`);
  }

  if (sources.mapSources !== undefined && !Array.isArray(sources.mapSources)) {
    reportError(`${context} mapSources 必须是数组`);
  }
}

function validateScenario(scenarioSummary) {
  const scenarioId = scenarioSummary.id;
  const scenarioDir = join(DATA_DIR, 'scenarios', scenarioId);

  if (!existsSync(scenarioDir)) {
    reportError(`scenarios/${scenarioId} 目录不存在`);
    return;
  }

  const filesResult = {};
  let hasFileError = false;

  SCENARIO_FILES.forEach((fileName) => {
    const filePath = join(scenarioDir, fileName);
    const result = readJson(filePath);

    if (result.missing) {
      reportError(`scenarios/${scenarioId}/${fileName} 不存在`);
      hasFileError = true;
      return;
    }

    if (result.parseError) {
      reportError(`scenarios/${scenarioId}/${fileName} JSON 解析失败：${result.parseError}`);
      hasFileError = true;
      return;
    }

    filesResult[fileName] = result.data;
  });

  if (hasFileError) {
    return;
  }

  stats.scenarioCount += 1;

  const metadata = filesResult['metadata.json'];
  const events = filesResult['events.json'];
  const places = filesResult['places.geojson'];
  const routes = filesResult['routes.geojson'];
  const zones = filesResult['zones.geojson'];
  const sources = filesResult['sources.json'];

  const { subjectIds, factionIds, valid: metadataValid } = validateMetadata(
    metadata,
    scenarioId,
    scenarioSummary,
  );

  if (!metadataValid) {
    return;
  }

  if (events !== undefined) {
    validateEvents(events, scenarioId);
  }

  const placesFeatures = validateGeoJsonFeatureCollection(places, 'places.geojson', scenarioId);
  if (placesFeatures) {
    validatePlacesGeoJson(placesFeatures, scenarioId, subjectIds, factionIds);
  }

  const routesFeatures = validateGeoJsonFeatureCollection(routes, 'routes.geojson', scenarioId);
  if (routesFeatures) {
    validateRoutesGeoJson(routesFeatures, scenarioId, subjectIds, factionIds);
  }

  const zonesFeatures = validateGeoJsonFeatureCollection(zones, 'zones.geojson', scenarioId);
  if (zonesFeatures) {
    validateZonesGeoJson(zonesFeatures, scenarioId, subjectIds, factionIds);
  }

  if (sources !== undefined) {
    validateSources(sources, scenarioId);
  }
}

function main() {
  console.log('开始校验专题数据...\n');

  if (!existsSync(SCENARIOS_PATH)) {
    reportError(`scenarios.json 不存在：${SCENARIOS_PATH}`);
    printSummary();
    process.exit(1);
  }

  const scenariosResult = readJson(SCENARIOS_PATH);
  if (scenariosResult.parseError) {
    reportError(`scenarios.json JSON 解析失败：${scenariosResult.parseError}`);
    printSummary();
    process.exit(1);
  }

  const scenarios = validateScenariosJson(scenariosResult.data);

  scenarios.forEach((scenario) => {
    validateScenario(scenario);
  });

  printSummary();

  if (errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

function printSummary() {
  console.log('\n--- 校验摘要 ---');
  console.log(`专题数量：${stats.scenarioCount}`);
  console.log(`事件数量：${stats.eventCount}`);
  console.log(`GeoJSON 要素数量：${stats.featureCount}`);
  console.log(`错误：${errors.length} 个`);
  console.log(`警告：${warnings.length} 个`);

  if (errors.length === 0) {
    console.log('\n✅ 所有专题数据校验通过');
  } else {
    console.log('\n❌ 数据校验失败，请修复上述错误后重试');
  }
}

main();
