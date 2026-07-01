export type LayerKey = 'places' | 'routes' | 'zones' | 'events';

export type LayerVisibility = Record<LayerKey, boolean>;

export interface LayerOption {
  key: LayerKey;
  label: string;
  description: string;
}

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  places: true,
  routes: true,
  zones: true,
  events: true,
};

export const LAYER_OPTIONS: LayerOption[] = [
  {
    key: 'places',
    label: '地点',
    description: '关键地点、城镇、节点和空间标注',
  },
  {
    key: 'routes',
    label: '路线',
    description: '行动、迁徙、交通或贸易路线',
  },
  {
    key: 'zones',
    label: '区域',
    description: '影响范围、控制区或重点空间',
  },
  {
    key: 'events',
    label: '事件',
    description: '时间轴当前事件说明',
  },
];
