import type { ScenarioFaction, ScenarioMetadata, ScenarioSubject } from '@/types/scenario';

function factionToSubject(faction: ScenarioFaction): ScenarioSubject {
  return {
    id: faction.id,
    name: faction.name,
    color: faction.color,
  };
}

export function resolveScenarioSubjects(metadata: ScenarioMetadata): ScenarioSubject[] {
  if (metadata.subjects && metadata.subjects.length > 0) {
    return metadata.subjects;
  }

  if (metadata.factions && metadata.factions.length > 0) {
    return metadata.factions.map(factionToSubject);
  }

  return [];
}
