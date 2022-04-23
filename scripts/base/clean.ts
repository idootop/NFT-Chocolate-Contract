import { runShell } from "./shell";

async function main() {
  await runShell(
    "rm -rf ./types ./cache ./artifacts ./coverage ./coverage.json"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
