import type { StageDefinition, ToolAction, ToolDefinition } from "@/data/stageSchema";
import type { CommandResult, EngineState } from "@/engine/types";
import { basename, dirnameOf, normalizeDir, resolvePath } from "@/engine/paths";

const DISPLAY_ACTIONS: ToolAction[] = [
  "display_file",
  "extract_and_display",
  "decode_and_display",
];

const PRODUCING_ACTIONS: ToolAction[] = [
  "copy_file",
  "export_to",
  "convert_to",
  "archive_to",
  "collect_to",
  "package_to",
];

export function handleLs(state: EngineState): CommandResult {
  const entries = state.filesystem[state.currentDir] ?? [];
  if (entries.length === 0) {
    return { lines: ["(このディレクトリは空です)"], isError: false };
  }
  return { lines: [entries.join("  ")], isError: false };
}

export function handleCd(
  state: EngineState,
  stage: StageDefinition,
  target: string,
): CommandResult {
  const path = normalizeDir(resolvePath(state.currentDir, target));
  const dirDef = stage.dirs?.[path];
  const knownAsDir =
    Boolean(dirDef) ||
    Object.prototype.hasOwnProperty.call(state.filesystem, path) ||
    (state.filesystem[state.currentDir] ?? []).includes(`${basename(path)}/`);

  if (!knownAsDir) {
    return { lines: ["拒否: そのようなディレクトリはありません"], isError: true };
  }
  if (dirDef?.enterableBy && !dirDef.enterableBy.includes(state.role)) {
    return {
      lines: [`拒否: ${basename(path)} のみ入室可（あなた: ${state.role}）`],
      isError: true,
    };
  }
  state.currentDir = path;
  return { lines: [], isError: false };
}

export function handleRead(state: EngineState, target: string): CommandResult {
  const path = resolvePath(state.currentDir, target);
  const file = state.files[path];
  if (!file || !file.exists) {
    return { lines: ["拒否: ファイルが存在しません"], isError: true };
  }
  if (!file.readableBy.includes(state.role)) {
    return {
      lines: [`拒否: ${file.readableBy.join("/")} のみ読み取り可（あなた: ${state.role}）`],
      isError: true,
    };
  }
  return { lines: [`--- ${path} ---`, file.content], isError: false };
}

export function handleInspect(stage: StageDefinition, target: string): CommandResult {
  const tool = stage.tools[target];
  if (!tool) {
    return { lines: ["拒否: そのようなツールはありません"], isError: true };
  }
  return { lines: tool.inspectText.split("\n"), isError: false };
}

export function handleStatus(state: EngineState): CommandResult {
  return {
    lines: [
      `端末: ${state.host} / 権限: ${state.role} / 現在地: ${state.currentDir} / 接続履歴: なし`,
    ],
    isError: false,
  };
}

const HELP_LINES = [
  "ls              現在地のファイル・ツール一覧を表示する",
  "cd <dir>        ディレクトリを移動する",
  "read <file>     ファイルの中身を読む",
  "inspect <obj>   ツール・ファイルの仕様を調べる",
  "run <tool> [引数]  ツールを実行する",
  "status          現在の状態（端末・権限・現在地・接続履歴）を表示する",
  "back            直前の操作を取り消す",
  "help            このコマンド一覧を表示する",
];

export function handleHelp(): CommandResult {
  return { lines: HELP_LINES, isError: false };
}

function computeDestPath(tool: ToolDefinition, srcPath: string): string {
  if (tool.outputMode === "fixed") {
    return tool.outputPath as string;
  }
  const dir = (tool.outputPath as string).endsWith("/")
    ? (tool.outputPath as string)
    : `${tool.outputPath}/`;
  return `${dir}${basename(srcPath)}${tool.outputSuffix ?? ""}`;
}

function registerInFilesystem(state: EngineState, path: string): void {
  const dir = dirnameOf(path);
  const name = basename(path);
  const entries = state.filesystem[dir] ?? [];
  if (!entries.includes(name)) {
    state.filesystem[dir] = [...entries, name];
  }
}

export function handleRun(
  state: EngineState,
  stage: StageDefinition,
  toolName: string,
  argRaw: string | undefined,
): CommandResult {
  const tool = stage.tools[toolName];
  if (!tool) {
    return { lines: ["拒否: そのようなツールはありません"], isError: true };
  }
  if (!tool.executableBy.includes(state.role)) {
    return {
      lines: [`拒否: ${toolName} の実行権限がありません（あなた: ${state.role}）`],
      isError: true,
    };
  }

  if (DISPLAY_ACTIONS.includes(tool.action)) {
    if (!argRaw) return { lines: ["拒否: 対象ファイルを指定してください"], isError: true };
    const path = resolvePath(state.currentDir, argRaw);
    if (tool.pathRestriction && !path.startsWith(tool.pathRestriction)) {
      return {
        lines: [`拒否: ${tool.pathRestriction} 以下のファイルのみ許可`],
        isError: true,
      };
    }
    const file = state.files[path];
    if (!file || !file.exists) {
      return { lines: ["拒否: ファイルが存在しません"], isError: true };
    }
    const header = (tool.displayHeaderTemplate ?? "--- {path} ---").replace("{path}", path);
    return {
      lines: [`[${toolName} を root 権限で実行]`, header, file.content],
      isError: false,
    };
  }

  if (tool.action === "append_to_log") {
    if (!argRaw) return { lines: ["拒否: 対象ファイルを指定してください"], isError: true };
    const srcPath = resolvePath(state.currentDir, argRaw);
    if (tool.pathRestriction && !srcPath.startsWith(tool.pathRestriction)) {
      return {
        lines: [`拒否: ${tool.pathRestriction} 以下のファイルのみ許可`],
        isError: true,
      };
    }
    const src = state.files[srcPath];
    if (!src || !src.exists) {
      return { lines: ["拒否: ファイルが存在しません"], isError: true };
    }
    const destPath = tool.outputPath as string;
    const existing = state.files[destPath];
    const prevContent = existing?.exists ? existing.content : "";
    const newLine = `追記: ${src.content}`;
    state.files[destPath] = {
      exists: true,
      owner: "root",
      readableBy: existing?.readableBy ?? tool.outputReadableBy ?? ["root"],
      content: prevContent ? `${prevContent}\n${newLine}` : newLine,
    };
    registerInFilesystem(state, destPath);
    const message = (tool.runSuccessTemplate ?? "{destPath} を更新しました").replace(
      "{destPath}",
      destPath,
    );
    return {
      lines: [`[${toolName} を root 権限で実行]`, message],
      isError: false,
      mutated: true,
    };
  }

  if (tool.action === "delete_file") {
    if (!argRaw) return { lines: ["拒否: 対象ファイルを指定してください"], isError: true };
    const path = resolvePath(state.currentDir, argRaw);
    if (tool.pathRestriction && !path.startsWith(tool.pathRestriction)) {
      return {
        lines: [`拒否: ${tool.pathRestriction} 以下のファイルのみ許可`],
        isError: true,
      };
    }
    const file = state.files[path];
    if (!file || !file.exists) {
      return { lines: ["拒否: ファイルが存在しません"], isError: true };
    }
    file.exists = false;
    const message = (tool.runSuccessTemplate ?? "{destPath} を削除しました").replace(
      "{destPath}",
      path,
    );
    return {
      lines: [`[${toolName} を root 権限で実行]`, message],
      isError: false,
      mutated: true,
    };
  }

  if (PRODUCING_ACTIONS.includes(tool.action)) {
    if (!argRaw) return { lines: ["拒否: 対象ファイルを指定してください"], isError: true };
    const srcPath = resolvePath(state.currentDir, argRaw);
    if (tool.pathRestriction && !srcPath.startsWith(tool.pathRestriction)) {
      return {
        lines: [`拒否: ${tool.pathRestriction} 以下のファイルのみ許可`],
        isError: true,
      };
    }
    const src = state.files[srcPath];
    if (!src || !src.exists) {
      return { lines: ["拒否: ファイルが存在しません"], isError: true };
    }
    const destPath = computeDestPath(tool, srcPath);
    state.files[destPath] = {
      exists: true,
      owner: "root",
      readableBy: tool.outputReadableBy ?? ["root"],
      content: src.content,
    };
    registerInFilesystem(state, destPath);
    const message = (tool.runSuccessTemplate ?? "{destPath} を作成しました").replace(
      "{destPath}",
      destPath,
    );
    return {
      lines: [`[${toolName} を root 権限で実行]`, message],
      isError: false,
      mutated: true,
    };
  }

  if (tool.action === "label_file") {
    if (!argRaw) return { lines: ["拒否: 対象ファイルを指定してください"], isError: true };
    const path = resolvePath(state.currentDir, argRaw);
    if (tool.pathRestriction && !path.startsWith(tool.pathRestriction)) {
      return {
        lines: [`拒否: ${tool.pathRestriction} 以下のファイルのみ許可`],
        isError: true,
      };
    }
    const file = state.files[path];
    if (!file || !file.exists) {
      return { lines: ["拒否: ファイルが存在しません"], isError: true };
    }
    return {
      lines: [`[${toolName} を root 権限で実行]`, "ラベルを貼りました（表示内容は変化しません）"],
      isError: false,
    };
  }

  return { lines: ["拒否: 未対応の操作です"], isError: true };
}
