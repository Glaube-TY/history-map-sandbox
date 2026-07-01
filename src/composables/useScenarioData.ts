import { ref } from 'vue';

import { loadScenarioBundle, loadScenarioList } from '@/services/scenarioLoader';
import type { ScenarioBundle, ScenarioSummary } from '@/types/scenario';

export function useScenarioData() {
  const scenarios = ref<ScenarioSummary[]>([]);
  const scenario = ref<ScenarioBundle | null>(null);
  const isLoading = ref(false);
  const errorMessage = ref('');

  async function fetchScenarios(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      scenarios.value = await loadScenarioList();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '专题列表加载失败';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchScenario(id: string): Promise<void> {
    isLoading.value = true;
    errorMessage.value = '';
    scenario.value = null;

    try {
      scenario.value = await loadScenarioBundle(id);
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '专题数据加载失败';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    scenarios,
    scenario,
    isLoading,
    errorMessage,
    fetchScenarios,
    fetchScenario,
  };
}
