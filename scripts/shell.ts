import { exec as execSync, spawn } from "child_process";
import { promisify } from "util";

const exec = promisify(execSync);

class Shell {
  async run(command: string) {
    return exec(command);
  }

  get args() {
    return process.argv.slice(2);
  }
}

export const shell = new Shell();

const id = 1;
export async function runShell(
  command: string,
  p?: {
    tag?: string;
    showTag?: boolean;
  }
): Promise<boolean> {
  const { tag = `spawn-${id}`, showTag = true } = p ?? {};
  return new Promise<boolean>((resolve) => {
    const commands = command.split(" ").filter((e) => isNotEmpty(e.trim()));
    const bin = commands[0];
    const [, ...args] = commands;
    const ls = spawn(bin, args);
    const errors: any[] = [];
    ls.stdout.on("data", (data) => {
      printOutputs("🟩", data, tag, showTag);
    });
    ls.stderr.on("data", (data) => {
      errors.push(data);
      printOutputs("🟥", data, tag, showTag);
    });
    ls.on("close", () => {
      resolve(errors.length < 1);
    });
  }).catch(() => false);
}

const isNotEmpty = (e: any) =>
  !(typeof e === "string" && (e.length < 1 || !/\S/.test(e)));

export function printf(message?: any, ...optionalParams: any[]): void {
  console.log(message, ...optionalParams);
}

const printOutputs = (
  leading: string,
  data: any,
  tag: string,
  showTag: boolean
) => {
  const datas = `${data}`.split("\n").filter((e) => isNotEmpty(e.trim()));
  datas.forEach((e) => {
    printf(!showTag ? e : `${leading} ${tag ? tag + " | " : ""}${e}`);
  });
};
