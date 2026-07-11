import assert from "node:assert/strict";
import test from "node:test";

import {
  PRE_SIFT_PERSONALITY_DRAFT_KEY,
  PRE_SIFT_PROJECT_STORAGE_KEY,
  commitStorageMigration,
  readStorageValueCandidate,
  removeCurrentAndLegacyStorageValues,
  SIFT_PERSONALITY_DRAFT_KEY,
  SIFT_PROJECT_STORAGE_KEY,
  type StorageLike,
} from "../app/lib/storage-migration.ts";

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test("project state moves to the SIFT key without changing its contents", () => {
  const storage = new MemoryStorage();
  storage.setItem(PRE_SIFT_PROJECT_STORAGE_KEY, "{\"project\":true}");

  const candidate = readStorageValueCandidate(
    storage,
    SIFT_PROJECT_STORAGE_KEY,
    [PRE_SIFT_PROJECT_STORAGE_KEY],
  );
  assert.deepEqual(candidate, {
    value: "{\"project\":true}",
    sourceKey: PRE_SIFT_PROJECT_STORAGE_KEY,
  });
  assert.equal(storage.getItem(SIFT_PROJECT_STORAGE_KEY), null, "reading alone must not mutate storage");

  assert.ok(candidate);
  commitStorageMigration(storage, SIFT_PROJECT_STORAGE_KEY, [PRE_SIFT_PROJECT_STORAGE_KEY], candidate);
  assert.equal(storage.getItem(SIFT_PROJECT_STORAGE_KEY), "{\"project\":true}");
  assert.equal(storage.getItem(PRE_SIFT_PROJECT_STORAGE_KEY), null);
});

test("a current SIFT value wins and stale pre-SIFT values are removed", () => {
  const storage = new MemoryStorage();
  storage.setItem(SIFT_PROJECT_STORAGE_KEY, "current");
  storage.setItem(PRE_SIFT_PROJECT_STORAGE_KEY, "stale");

  const candidate = readStorageValueCandidate(
    storage,
    SIFT_PROJECT_STORAGE_KEY,
    [PRE_SIFT_PROJECT_STORAGE_KEY],
  );
  assert.deepEqual(candidate, { value: "current", sourceKey: SIFT_PROJECT_STORAGE_KEY });
  assert.ok(candidate);
  commitStorageMigration(storage, SIFT_PROJECT_STORAGE_KEY, [PRE_SIFT_PROJECT_STORAGE_KEY], candidate);
  assert.equal(storage.getItem(PRE_SIFT_PROJECT_STORAGE_KEY), null);
});

test("clearing local data removes current and transitional keys", () => {
  const storage = new MemoryStorage();
  storage.setItem(SIFT_PERSONALITY_DRAFT_KEY, "current");
  storage.setItem(PRE_SIFT_PERSONALITY_DRAFT_KEY, "legacy");

  removeCurrentAndLegacyStorageValues(
    storage,
    SIFT_PERSONALITY_DRAFT_KEY,
    [PRE_SIFT_PERSONALITY_DRAFT_KEY],
  );

  assert.equal(storage.getItem(SIFT_PERSONALITY_DRAFT_KEY), null);
  assert.equal(storage.getItem(PRE_SIFT_PERSONALITY_DRAFT_KEY), null);
});
