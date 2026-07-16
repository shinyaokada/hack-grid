import type { CommandName, StageDefinition } from "@/data/stageSchema";

const DOCS: { name: CommandName; syntax: string; desc: string; hint?: string }[] = [
  { name: "ls", syntax: "ls", desc: "現在地のファイル・ツール一覧を表示する" },
  { name: "cd", syntax: "cd <dir>", desc: "ディレクトリを移動する" },
  { name: "read", syntax: "read <file>", desc: "ファイルの中身を読む" },
  {
    name: "inspect",
    syntax: "inspect <obj>",
    desc: "ツール・ファイルの仕様を調べる",
    hint: "inspect でツールの仕様を見てみよう",
  },
  {
    name: "run",
    syntax: "run <tool> [引数]",
    desc: "ツールを実行する",
    hint: "読めないなら、ツールに代わりに読ませてみよう",
  },
  {
    name: "status",
    syntax: "status",
    desc: "端末・権限・現在地・接続履歴をまとめて表示する",
    hint: "今の自分の状態をまとめて見たいときは status",
  },
  { name: "help", syntax: "help", desc: "このコマンド一覧をログに表示する" },
];

export function CommandDocs({
  stage,
  usedCommands,
}: {
  stage: StageDefinition;
  usedCommands: Set<CommandName>;
}) {
  return (
    <div className="w-full shrink-0 rounded border border-green-900 bg-black/60 p-3 text-xs text-green-300 md:w-64">
      <div className="mb-2 text-green-500">コマンド一覧</div>
      <dl className="flex flex-col gap-3">
        {DOCS.map((d) => {
          const isNew = stage.newCommands.includes(d.name) && !usedCommands.has(d.name);
          return (
            <div key={d.name}>
              <dt className="flex flex-wrap items-center gap-2 font-bold text-green-200">
                <span>{d.syntax}</span>
                {isNew && (
                  <span className="rounded bg-yellow-500 px-1 text-[10px] font-bold text-black">
                    NEW
                  </span>
                )}
              </dt>
              <dd className="text-green-400">{d.desc}</dd>
              {isNew && d.hint && <dd className="mt-1 text-yellow-400">ヒント: {d.hint}</dd>}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
