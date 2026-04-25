import { runStoreTests } from "./store.test.js";
import { runValidatorTests } from "./validator.test.js";

async function main(): Promise<void> {
  await runValidatorTests();
  await runStoreTests();
  console.log("All tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
