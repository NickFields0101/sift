export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const SIFT_PROJECT_STORAGE_KEY = "sift-v1";
export const SIFT_PERSONALITY_DRAFT_KEY = "sift-ipip-neo-120-draft-v1";

// These keys are read only during the one-time SIFT upgrade migration.
export const PRE_SIFT_PROJECT_STORAGE_KEY = ["idea", "foundry-v1"].join("-");
export const PRE_SIFT_PERSONALITY_DRAFT_KEY = ["idea", "foundry-ipip-neo-120-draft-v1"].join("-");

export interface StorageValueCandidate {
  value: string;
  sourceKey: string;
}

export function readStorageValueCandidate(
  storage: StorageLike,
  currentKey: string,
  legacyKeys: readonly string[],
): StorageValueCandidate | null {
  const current = storage.getItem(currentKey);
  if (current !== null) return { value: current, sourceKey: currentKey };

  for (const legacyKey of legacyKeys) {
    const legacy = storage.getItem(legacyKey);
    if (legacy === null) continue;
    return { value: legacy, sourceKey: legacyKey };
  }

  return null;
}

export function commitStorageMigration(
  storage: StorageLike,
  currentKey: string,
  legacyKeys: readonly string[],
  candidate: StorageValueCandidate,
) {
  if (candidate.sourceKey !== currentKey) storage.setItem(currentKey, candidate.value);
  legacyKeys.forEach((key) => storage.removeItem(key));
}

export function removeCurrentAndLegacyStorageValues(
  storage: StorageLike,
  currentKey: string,
  legacyKeys: readonly string[],
) {
  storage.removeItem(currentKey);
  legacyKeys.forEach((key) => storage.removeItem(key));
}
