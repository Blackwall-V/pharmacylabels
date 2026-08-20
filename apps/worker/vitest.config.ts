import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      // Unit tests never issue real queries, but pipeline/match.ts imports the db client
      // at module load time, which throws immediately if DATABASE_URL is unset.
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
    },
  },
});
