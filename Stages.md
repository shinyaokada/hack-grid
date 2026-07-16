# ハッキング風パズルゲーム ステージ設計書（1-1〜1-4 / 2-1〜2-4）

> 前提: [Overview.md](Overview.md)（コマンド仕様・パズルパターン）、[Screens.md](Screens.md)（画面遷移・UI仕様）に準拠する。
> 本書は Overview.md の「ステージデータ構造（JSON）」を実データとして埋め、Screens.md の画面フロー（ストーリー→CLI→鍵番号フォーム→クリア演出）にそのまま流し込める粒度まで詳細化したものである。

## 世界観・舞台

**サクラ物流センター**の受付端末に `guest` としてログインした状態から始まる、一連のセキュリティ調査（許可されたペネトレーションテスト）。

ステージが進むごとに「受付 → 資料室 → 通用口 → サーバー室 → 資料変換室 → 共有フォルダ → 倉庫の奥」と、同一拠点内の深部へ探索が進む。すべて `reception-pc` という同一端末上の別ディレクトリという体裁を取り、`connect`（横移動）はまだ使わない（`connect` はパターン4以降で別端末に踏み台移動する回のために温存する）。

## ステージ一覧サマリ

| ステージ | タイトル | パターン/スキン | 新出コマンド | 鍵番号 | 備考 |
|---|---|---|---|---|---|
| 1-1 | 受付端末 | 大枠チュートリアル | `ls` `cd` `read` | `7008` | Screens.md 2-1 準拠 |
| 1-2 | 受付端末・裏側 | パターン1-A（printer） | `inspect` `run` | `4921` | Screens.md 6章 準拠 |
| 1-3 | 資料室 | パターン1-B（backup） | なし | `5533` | run→read の2アクション |
| 1-4 | 通用口ログ | パターン1-C（logger） | `back`（初回ヒント） | `8264` | おとりツールで詰み体験 |
| 2-1 | サーバー室・搬入口 | パターン2-A（exporter→printer） | なし | `3390` | Overview Lv2サンプル準拠 |
| 2-2 | 資料変換室 | パターン2-B（converter→reader） | `status`（初回ヒント） | `7712` | 経由地が変わるだけの反復 |
| 2-3 | 共有フォルダ | パターン2-C（archiver→extractor） | なし | `1849` | 圧縮/解凍の言い換え |
| 2-4 | 倉庫の奥 | パターン2 応用（3段チェーン） | なし | `6027` | チェーンを1段伸ばして難度UP |

**鍵番号は全ステージ4桁の数字で統一する。**（Screens.md 未決事項「鍵番号フォームの桁数・入力形式」への回答として、このステージ群では数値4桁固定を採用する。）

---

## ステージ 1-1「受付端末」

Screens.md 2-1 で確定済みの大枠チュートリアルそのもの。詳細フロー・memo.txt の文言はそちらを正とし、ここでは JSON 化と設計書としての体裁のみ補う。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン | チュートリアル専用（パターン0扱い、`inspect`/`run`/`connect` は未提示） |
| 使用可能コマンド | `ls` `cd` `read`（`status` `help` `back` は使用可能だが誘導しない） |
| ロック条件 | なし（初期解放） |

### ストーリー（ストーリー画面）

> サクラ物流センターの受付端末に `guest` としてログインした。
> まずは自分に何ができるか、手近なところから確認してみよう。

### ファイルシステム

```
/home/guest: memo.txt, staff/
/home/guest/staff: (中身は非公開・cd 拒否のみで実装、ls対象外でよい)
```

### 攻略フロー

```
$ ls
memo.txt  staff/

$ cd staff
拒否: staff のみ入室可（あなた: guest）

$ read memo.txt
--- memo.txt ---
今日の合言葉は 7008
（本当に大事な金庫の番号は root にしか
  見られない場所にあるらしい……）
```

### ゴール・クリア演出

- 鍵番号: `7008`
- 気づき: 「拒否されても、まず `ls` と `read` だけで進められる場所はある」
- クリア後: ホーム画面ガイド（Screens.md 2-2）を一度だけ表示

### JSON

```json
{
  "stage": "1-1",
  "title": "受付端末",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "tutorial",
  "new_commands": ["ls", "cd", "read"],
  "lock_condition": null,
  "goal": { "type": "read", "path": "/home/guest/memo.txt", "answer": "7008" },
  "filesystem": {
    "/home/guest": ["memo.txt", "staff/"]
  },
  "dirs": {
    "/home/guest/staff": { "enterable_by": ["staff"] }
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root", "staff"],
      "content": "今日の合言葉は 7008\n（本当に大事な金庫の番号は root にしか見られない場所にあるらしい……）"
    }
  },
  "tools": {},
  "notice": "拒否されても、まず ls と read だけで進められる場所はある"
}
```

---

## ステージ 1-2「受付端末・裏側」

Screens.md 6章で確定済み（Overview.md サンプル盤面 Lv1 に対応）。パターン1-A・printer スキン。ここでは JSON 化のみ補う。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン1（Confused Deputy）/ スキンA（printer） |
| 新出コマンド | `inspect`（★NEW） `run`（★NEW） |
| ロック条件 | 1-1 クリアで解放 |

### ストーリー

> 受付のメモにあった一文が気になる。金庫の本当の番号は、root しか読めないファイルの中にあるらしい。

### 設計意図（発見方法について）

ストーリー画面では「root しか読めないファイルの中にあるらしい」としか語らず、正確なパスは教えない。かわりに `/home/guest/memo.txt`（受付担当の引き継ぎメモ）に `/root/note.txt` という具体的なパスを書いておき、`ls` → `read memo.txt` という**ゲーム内の調査行動**で発見させる。ナレーションが答えを教える形を避け、「怪しいメモを読む」という捜査的な手触りにするための設計。

### 攻略フロー

```
$ ls
memo.txt  printer

$ read memo.txt
--- memo.txt ---
引き継ぎメモ:
『金庫番号の確認は /root/note.txt を参照のこと』とのこと。
（root権限が要るらしく、まだ自分では見られていない……）

$ read /root/note.txt
拒否: root のみ読み取り可（あなた: guest）

$ inspect printer
所有者: root
実行可: 全員
動作: run printer <ファイル> でそのファイルの中身を表示する

$ run printer /root/note.txt
[printer を root 権限で実行]
--- /root/note.txt ---
金庫の暗証番号は 4921
```

### ゴール・クリア演出

- 鍵番号: `4921`
- 気づき: 「自分は読めないが、ツールに代行させたら読めた」

### JSON

```json
{
  "stage": "1-2",
  "title": "受付端末・裏側",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "confused_deputy",
  "skin": "A_printer",
  "new_commands": ["inspect", "run"],
  "lock_condition": "1-1 をクリアすると解放",
  "goal": { "type": "read", "path": "/root/note.txt", "answer": "4921" },
  "filesystem": {
    "/home/guest": ["memo.txt", "printer"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "引き継ぎメモ:\n『金庫番号の確認は /root/note.txt を参照のこと』とのこと。\n（root権限が要るらしく、まだ自分では見られていない……）"
    },
    "/root/note.txt": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "金庫の暗証番号は 4921"
    }
  },
  "tools": {
    "printer": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "display_file",
      "path_restriction": null
    }
  },
  "notice": "自分は読めないが、ツールに代行させたら読めた"
}
```

---

## ステージ 1-3「資料室」

パターン1（Confused Deputy）/ スキンB（backup）。Overview.md のスキン表にある「backup: 指定ファイルを `/backup/` にコピー → 自分で read（2アクション）」を実装する回。`run` 単発ではなく `run` → `read` の2手が必要になり、1-2 からの難度上昇を作る。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン1（Confused Deputy）/ スキンB（backup） |
| 新出コマンド | なし（`inspect` `run` は 1-2 で既習） |
| ロック条件 | 1-2 をクリアすると解放 |

### ストーリー

> 資料室の奥に社員証発行の記録があるらしい。root しか読めない台帳だが、バックアップ担当のツールが置いてあるのを見つけた。

### 攻略フロー

```
$ ls
memo.txt  backup

$ read memo.txt
--- memo.txt ---
資料室担当より: 社員証台帳（/root/idcard.csv）は root 権限のため私も直接は見られません。
バックアップの複製はいつも /backup/ に置いています。

$ read /root/idcard.csv
拒否: root のみ読み取り可（あなた: guest）

$ inspect backup
所有者: root
実行可: 全員
動作: run backup <ファイル> で /backup/ に複製する
制約: なし

$ run backup /root/idcard.csv
[backup を root 権限で実行]
/backup/idcard.csv に複製しました

$ read /backup/idcard.csv
--- /backup/idcard.csv ---
社員証の番号は 5533
```

### 設計意図

- 1-2 との違いは「ツールの出力そのものがゴールではなく、出力先を自分で `read` する」という一手増。プレイヤーの手順は変わらず `inspect → run → read` だが、`printer` が「表示するだけ」なのに対し `backup` は「複製するだけ」で、続きを自分でやる必要があると気づかせる。
- `/backup/idcard.csv` は複製先として **guest にも読めるパーミッション** を持つ世界読み取り可能な棚という設定（バックアップ倉庫は誰でも閲覧できる、という手触りの違いを出す）。
- 1-2 と同様、正確なパス（`/root/idcard.csv`）はストーリー画面では語らず、`memo.txt` を `read` して発見する。

### ゴール・クリア演出

- 鍵番号: `5533`
- 気づき: 「代行させたツールの出力先も、自分の権限で読めることがある」

### JSON

```json
{
  "stage": "1-3",
  "title": "資料室",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "confused_deputy",
  "skin": "B_backup",
  "new_commands": [],
  "lock_condition": "1-2 をクリアすると解放",
  "goal": { "type": "read", "path": "/backup/idcard.csv", "answer": "5533" },
  "filesystem": {
    "/home/guest": ["memo.txt", "backup"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "資料室担当より: 社員証台帳（/root/idcard.csv）は root 権限のため私も直接は見られません。\nバックアップの複製はいつも /backup/ に置いています。"
    },
    "/root/idcard.csv": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "社員証の番号は 5533"
    },
    "/backup/idcard.csv": {
      "owner": "root",
      "readable_by": ["guest", "root"],
      "content": "社員証の番号は 5533",
      "produced_by": "backup"
    }
  },
  "tools": {
    "backup": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "copy_file",
      "output_dir": "/backup/",
      "path_restriction": null
    }
  },
  "notice": "代行させたツールの出力先も、自分の権限で読めることがある"
}
```

---

## ステージ 1-4「通用口ログ」

パターン1（Confused Deputy）/ スキンC（logger）。Overview.md のスキン表「logger: 指定ファイルの内容をログに追記 → ログを read（間接性が上がる）」に対応。加えて、Screens.md 2-3 で「`back` の想定初出＝詰みかけた最初のタイミング」とされている条件を満たすため、**取り返しのつかない見た目のおとりツール**を配置し、`back` の必要性を初めて体感させる。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン1（Confused Deputy）/ スキンC（logger） |
| 新出コマンド | `back`（★NEW、おとり操作からの復帰で初出ヒント発火） |
| ロック条件 | 1-3 をクリアすると解放 |

### ストーリー

> 通用口の暗証番号が変更されたらしい。記録はログに残るはずだが、ログファイル自体は root しか読めない。

### 攻略フロー

```
$ ls
memo.txt  logger  shredder

$ read memo.txt
--- memo.txt ---
変更前の番号は /root/gatecode に残っているはず。
通用口の変更履歴は /var/log/access.log に残るらしい。

$ read /root/gatecode
拒否: root のみ読み取り可（あなた: guest）

$ inspect shredder
所有者: root
実行可: 全員
動作: run shredder <ファイル> で指定ファイルを完全に削除する
警告: 元に戻せません

$ inspect logger
所有者: root
実行可: 全員
動作: run logger <ファイル> で指定ファイルの内容を /var/log/access.log に追記する
制約: なし

$ run logger /root/gatecode
[logger を root 権限で実行]
/var/log/access.log に追記しました

$ read /var/log/access.log
--- /var/log/access.log ---
09:12 access denied: guest → /root
09:40 access denied: guest → /root
追記: 通用口の暗証番号は 8264
```

**詰みルート（想定される寄り道）**: `inspect shredder` で不穏な説明文を見て興味本位に `run shredder /root/gatecode` を実行すると、ゴールファイルが消失する。

```
$ run shredder /root/gatecode
[shredder を root 権限で実行]
/root/gatecode を削除しました

$ read /root/gatecode
拒否: ファイルが存在しません
```

ここで初めて `back` ボタンに「NEW」バッジと吹き出し「一手戻したいときは `back`」が表示され、直前の `run shredder` を取り消してログをグレーアウト表示に変え、`/root/gatecode` を復元する。

### 設計意図

- `logger` は「ログは基本 guest にも読める」という世界観を利用し、追記された1行を大量のノイズ（既存ログ）の中から見つけさせることで間接性を上げる（スキンC「間接性が上がる」に対応）。
- `shredder` はゴールに直結する唯一の入力を破壊しうる、初めての「本当に危険に見える」選択肢。`back` の必要性を機能として教える回に位置づける。誤操作しても `back` 一手で必ず復帰できるため詰みは発生しない（Overview.md「`back` = 詰み防止」を満たす）。

### ゴール・クリア演出

- 鍵番号: `8264`
- 気づき: 「危なそうな操作をしても、`back` があれば安心して試せる」

### JSON

```json
{
  "stage": "1-4",
  "title": "通用口ログ",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "confused_deputy",
  "skin": "C_logger",
  "new_commands": ["back"],
  "lock_condition": "1-3 をクリアすると解放",
  "goal": { "type": "read", "path": "/var/log/access.log", "answer": "8264" },
  "filesystem": {
    "/home/guest": ["memo.txt", "logger", "shredder"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "変更前の番号は /root/gatecode に残っているはず。\n通用口の変更履歴は /var/log/access.log に残るらしい。"
    },
    "/root/gatecode": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "通用口の暗証番号は 8264"
    },
    "/var/log/access.log": {
      "owner": "root",
      "readable_by": ["guest", "root"],
      "content": "09:12 access denied: guest → /root\n09:40 access denied: guest → /root",
      "append_from": "logger"
    }
  },
  "tools": {
    "logger": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "append_to_log",
      "output_path": "/var/log/access.log",
      "path_restriction": null
    },
    "shredder": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "delete_file",
      "path_restriction": null,
      "destructive": true,
      "recoverable_via": "back"
    }
  },
  "notice": "危なそうな操作をしても、back があれば安心して試せる"
}
```

---

## ステージ 2-1「サーバー室・搬入口」

パターン2（Chain）/ スキンA。Overview.md「サンプル盤面 Lv2」に対応（内容のみ数値の鍵番号に差し替え）。ここから `run` 単発では解けず、`run` → `run` の2段構成になる。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン2（Chain）/ スキンA（exporter→printer、パス制限あり） |
| 新出コマンド | なし |
| ロック条件 | 1-4 をクリアすると解放 |

### ストーリー

> サーバー室の暗証番号が知りたい。ここの printer は `/tmp/` 以下のファイルしか受け付けないよう制限されている。

### 攻略フロー

```
$ ls
memo.txt  exporter  printer

$ read memo.txt
--- memo.txt ---
搬入口メモ: サーバー室の暗証番号は /root/serverroom に記録されているらしい。

$ inspect printer
所有者: root
実行可: 全員
動作: 指定ファイルを表示する
制約: /tmp/ 以下のファイルのみ受け付ける

$ run printer /root/serverroom
拒否: /tmp/ 以下のファイルのみ許可

$ inspect exporter
所有者: root
実行可: 全員
動作: 指定ファイルを /tmp/out に書き出す
制約: なし

$ run exporter /root/serverroom
[exporter を root 権限で実行]
/tmp/out に書き出しました

$ run printer /tmp/out
[printer を root 権限で実行]
--- /tmp/out ---
サーバー室の暗証番号は 3390
```

### 設計意図

- `/tmp/out` は exporter による単なる複製であり、直接 `read /tmp/out` はできない（root専有のまま）。printer という「root 権限で動く別ツール」を経由して初めて中身が見える、という Confused Deputy の連鎖こそがパターン2の核。
- 1-3（backup）との違い: backup は出力先が guest にも読めたが、ここでは出力先 `/tmp/out` も root 専有のまま。「複製すれば読めるとは限らない」という反例を示し、次ツール（printer）を探させる。

### ゴール・クリア演出

- 鍵番号: `3390`
- 気づき: 「直接渡せないなら、一度別のツールに処理させてから渡す」

### JSON

```json
{
  "stage": "2-1",
  "title": "サーバー室・搬入口",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "chain",
  "skin": "A_exporter_printer",
  "new_commands": [],
  "lock_condition": "1-4 をクリアすると解放",
  "goal": { "type": "run_output", "tool": "printer", "path": "/tmp/out", "answer": "3390" },
  "filesystem": {
    "/home/guest": ["memo.txt", "exporter", "printer"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "搬入口メモ: サーバー室の暗証番号は /root/serverroom に記録されているらしい。"
    },
    "/root/serverroom": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "サーバー室の暗証番号は 3390"
    },
    "/tmp/out": {
      "owner": "root",
      "readable_by": ["root"],
      "content": null,
      "produced_by": "exporter"
    }
  },
  "tools": {
    "exporter": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "export_to",
      "output_path": "/tmp/out",
      "path_restriction": null
    },
    "printer": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "display_file",
      "path_restriction": "/tmp/"
    }
  },
  "notice": "直接渡せないなら、一度別のツールに処理させてから渡す"
}
```

---

## ステージ 2-2「資料変換室」

パターン2（Chain）/ スキンB。Overview.md スキン表「converter（形式変換して/cacheへ）→ reader（/cacheを読む）」に対応。構造は 2-1 と同型だが、経由地（`/cache/`）とツール名が変わるだけで手触りが変わることを検証する回。Screens.md 2-3 の「`status` は早い段階の任意ステージで初出ヒント」をここに割り当てる。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン2（Chain）/ スキンB（converter→reader、パス制限あり） |
| 新出コマンド | `status`（★NEW） |
| ロック条件 | 2-1 をクリアすると解放 |

### ストーリー

> 資料変換室に、フォーマット変換ツールと閲覧ツールが置いてある。閲覧ツールは `/cache/` 以下しか見てくれないらしい。

### 攻略フロー

```
$ status
端末: reception-pc / 権限: guest / 現在地: /home/guest / 接続履歴: なし

$ ls
memo.txt  converter  reader

$ read memo.txt
--- memo.txt ---
資料変換室のメモ: 予備鍵の保管場所は /root/keystore です。

$ inspect reader
所有者: root
実行可: 全員
動作: 指定ファイルを表示する
制約: /cache/ 以下のファイルのみ受け付ける

$ run reader /root/keystore
拒否: /cache/ 以下のファイルのみ許可

$ inspect converter
所有者: root
実行可: 全員
動作: 指定ファイルを変換して /cache/ に書き出す
制約: なし

$ run converter /root/keystore
[converter を root 権限で実行]
/cache/keystore.conv に書き出しました

$ run reader /cache/keystore.conv
[reader を root 権限で実行]
--- /cache/keystore.conv ---
予備鍵保管庫の番号は 7712
```

### 設計意図

- 手順は 2-1 と完全に同型（`inspect`→拒否→`inspect`別ツール→`run`→`run`）。プレイヤーが「あ、さっきと同じ形だ」とパターンを自力で認識できるかを確認する回として機能させる（Overview.md フェーズ2の「スキン差し替えでエンジンの汎用性検証」を、プレイヤー体験としても反復させる位置づけ）。
- `status` はここまで一度も使わなくても解けるステージが続いたため、「今の自分の状態をまとめて見たい」という欲求が生まれやすいこのタイミングで初出ヒントを出す。

### ゴール・クリア演出

- 鍵番号: `7712`
- 気づき: 「形は変わっても、やることは "拒否されたら別ルートを探す" の繰り返し」

### JSON

```json
{
  "stage": "2-2",
  "title": "資料変換室",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "chain",
  "skin": "B_converter_reader",
  "new_commands": ["status"],
  "lock_condition": "2-1 をクリアすると解放",
  "goal": { "type": "run_output", "tool": "reader", "path": "/cache/keystore.conv", "answer": "7712" },
  "filesystem": {
    "/home/guest": ["memo.txt", "converter", "reader"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "資料変換室のメモ: 予備鍵の保管場所は /root/keystore です。"
    },
    "/root/keystore": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "予備鍵保管庫の番号は 7712"
    },
    "/cache/keystore.conv": {
      "owner": "root",
      "readable_by": ["root"],
      "content": null,
      "produced_by": "converter"
    }
  },
  "tools": {
    "converter": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "convert_to",
      "output_path": "/cache/",
      "output_suffix": ".conv",
      "path_restriction": null
    },
    "reader": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "display_file",
      "path_restriction": "/cache/"
    }
  },
  "notice": "形は変わっても、やることは拒否されたら別ルートを探すの繰り返し"
}
```

---

## ステージ 2-3「共有フォルダ」

パターン2（Chain）/ スキンC。Overview.md スキン表「archiver（圧縮して/shareへ）→ extractor（解凍して表示）」に対応。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン2（Chain）/ スキンC（archiver→extractor、パス制限あり） |
| 新出コマンド | なし |
| ロック条件 | 2-2 をクリアすると解放 |

### ストーリー

> 共有フォルダに積み荷リストの照合コードがあるらしい。展開ツールは `/share/` 以下しか受け付けない。

### 攻略フロー

```
$ ls
memo.txt  archiver  extractor

$ read memo.txt
--- memo.txt ---
共有フォルダのメモ: 積み荷リストの照合コードは /root/manifest にあるようです。

$ inspect extractor
所有者: root
実行可: 全員
動作: 指定ファイルを解凍して表示する
制約: /share/ 以下のファイルのみ受け付ける

$ run extractor /root/manifest
拒否: /share/ 以下のファイルのみ許可

$ inspect archiver
所有者: root
実行可: 全員
動作: 指定ファイルを圧縮して /share/ に書き出す
制約: なし

$ run archiver /root/manifest
[archiver を root 権限で実行]
/share/manifest.zip に書き出しました

$ run extractor /share/manifest.zip
[extractor を root 権限で実行]
--- /share/manifest.zip を解凍 ---
積み荷リストの照合コードは 1849
```

### 設計意図

- 2-1・2-2 と同型3回目。ここまでで「パス制限のあるツール＋万能な前処理ツール」という型をプレイヤーが完全に自分の言葉で説明できる状態を作り、2-4 の応用（3段チェーン）への橋渡しとする。

### ゴール・クリア演出

- 鍵番号: `1849`
- 気づき: 「圧縮も変換もコピーも、結局は "経由地を作る" という同じ発想」

### JSON

```json
{
  "stage": "2-3",
  "title": "共有フォルダ",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "chain",
  "skin": "C_archiver_extractor",
  "new_commands": [],
  "lock_condition": "2-2 をクリアすると解放",
  "goal": { "type": "run_output", "tool": "extractor", "path": "/share/manifest.zip", "answer": "1849" },
  "filesystem": {
    "/home/guest": ["memo.txt", "archiver", "extractor"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "共有フォルダのメモ: 積み荷リストの照合コードは /root/manifest にあるようです。"
    },
    "/root/manifest": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "積み荷リストの照合コードは 1849"
    },
    "/share/manifest.zip": {
      "owner": "root",
      "readable_by": ["root"],
      "content": null,
      "produced_by": "archiver"
    }
  },
  "tools": {
    "archiver": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "archive_to",
      "output_path": "/share/",
      "output_suffix": ".zip",
      "path_restriction": null
    },
    "extractor": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "extract_and_display",
      "path_restriction": "/share/"
    }
  },
  "notice": "圧縮も変換もコピーも、結局は経由地を作るという同じ発想"
}
```

---

## ステージ 2-4「倉庫の奥」

パターン2（Chain）の応用スキン。Overview.md「チェーンが1段増えるごとに難易度が上がる」を体現する回として、`run`→`run`→`run` の**3段チェーン**にする。3回とも同型（前段の出力を次段が受け取り、次段にも別のパス制限がある）を繰り返す構造にすることで、新しい理解は要らず、単に手数が伸びるだけで難度が上がることを示す。

### 基本情報

| 項目 | 内容 |
|---|---|
| ホスト | `reception-pc` |
| プレイヤー権限 | `guest` |
| パターン/スキン | パターン2（Chain）応用／3段チェーン（collector→packager→viewer） |
| 新出コマンド | なし |
| ロック条件 | 2-3 をクリアすると解放 |

### ストーリー

> 倉庫の奥、金庫本体の最終コードにたどり着けそうだ。ただし今回は経由地が二段階ある。

### 攻略フロー

```
$ ls
memo.txt  collector  packager  viewer  labeler

$ read memo.txt
--- memo.txt ---
倉庫のメモ: 金庫本体の最終コードは /root/vaultcore に保管されているとのこと。

$ inspect viewer
所有者: root
実行可: 全員
動作: 指定ファイルを解読して表示する
制約: /pool/packed/ 以下のファイルのみ受け付ける

$ inspect packager
所有者: root
実行可: 全員
動作: 指定ファイルを梱包して /pool/packed/ に書き出す
制約: /pool/incoming/ 以下のファイルのみ受け付ける

$ inspect collector
所有者: root
実行可: 全員
動作: 指定ファイルを /pool/incoming/ に集める
制約: なし

$ inspect labeler
所有者: root
実行可: 全員
動作: 指定ファイルにラベルを貼る（表示内容は変化しない）
制約: /pool/incoming/ 以下のファイルのみ受け付ける

$ run collector /root/vaultcore
[collector を root 権限で実行]
/pool/incoming/vaultcore に集めました

$ run packager /pool/incoming/vaultcore
[packager を root 権限で実行]
/pool/packed/vaultcore.pkg に梱包しました

$ run viewer /pool/packed/vaultcore.pkg
[viewer を root 権限で実行]
--- /pool/packed/vaultcore.pkg を解読 ---
金庫本体の最終コードは 6027
```

### 設計意図

- `collector → packager → viewer` は 2-1〜2-3 の「万能ツール→制限付きツール」の型をそのまま2回繰り返しているだけで、新しい概念は一切増えていない。難度上昇が「チェーンの長さ」だけに由来することの証明として機能する（Overview.md「コマンドの追加で難易度を上げる」をNGとした設計憲法どおり）。
- `labeler` はダミーの寄り道ツール。`inspect` すると「表示内容は変化しない」と明記されており、実行しても損はないが解答には無関係と自力で判断させる（前段の 1-4 のような破壊的おとりではなく、無害な寄り道で探索の楽しさだけを担保する）。

### ゴール・クリア演出

- 鍵番号: `6027`
- 気づき: 「経由地が増えても、拒否→次のツールを探す、を繰り返すだけでいい」
- クリア演出内の「実行したコマンド手数」表示で、最短手数（`inspect`×3+`run`×3=6手、`labeler`を使わなければ）を振り返れるようにする

### JSON

```json
{
  "stage": "2-4",
  "title": "倉庫の奥",
  "host": "reception-pc",
  "player": { "name": "guest" },
  "pattern": "chain",
  "skin": "D_three_hop",
  "new_commands": [],
  "lock_condition": "2-3 をクリアすると解放",
  "goal": { "type": "run_output", "tool": "viewer", "path": "/pool/packed/vaultcore.pkg", "answer": "6027" },
  "filesystem": {
    "/home/guest": ["memo.txt", "collector", "packager", "viewer", "labeler"]
  },
  "files": {
    "/home/guest/memo.txt": {
      "owner": "guest",
      "readable_by": ["guest", "root"],
      "content": "倉庫のメモ: 金庫本体の最終コードは /root/vaultcore に保管されているとのこと。"
    },
    "/root/vaultcore": {
      "owner": "root",
      "readable_by": ["root"],
      "content": "金庫本体の最終コードは 6027"
    },
    "/pool/incoming/vaultcore": {
      "owner": "root",
      "readable_by": ["root"],
      "content": null,
      "produced_by": "collector"
    },
    "/pool/packed/vaultcore.pkg": {
      "owner": "root",
      "readable_by": ["root"],
      "content": null,
      "produced_by": "packager"
    }
  },
  "tools": {
    "collector": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "collect_to",
      "output_path": "/pool/incoming/",
      "path_restriction": null
    },
    "packager": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "package_to",
      "output_path": "/pool/packed/",
      "output_suffix": ".pkg",
      "path_restriction": "/pool/incoming/"
    },
    "viewer": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "decode_and_display",
      "path_restriction": "/pool/packed/"
    },
    "labeler": {
      "owner": "root",
      "executable_by": ["guest", "root"],
      "action": "label_file",
      "path_restriction": "/pool/incoming/",
      "cosmetic_only": true
    }
  },
  "notice": "経由地が増えても、拒否→次のツールを探す、を繰り返すだけでいい"
}
```

---

## 横断チェックリスト（実装前に確認）

- [ ] 1-1〜1-4 は同一ホスト `reception-pc` 内で `connect` を一切使わずに解ける（パターン1のみ）
- [ ] 2-1〜2-4 は `run`→`run`（2-4のみ`run`×3）以外の新規コマンドを要求しない（パターン2はChainの型のみ）
- [ ] 鍵番号は全ステージ4桁の数字・重複なし（7008 / 4921 / 5533 / 8264 / 3390 / 7712 / 1849 / 6027）
- [ ] `inspect` `run` の初出ヒントは 1-2、`back` の初出ヒントは 1-4、`status` の初出ヒントは 2-2 に一度だけ出す（Screens.md 5章のNEWバッジ仕様に準拠）
- [ ] 各ステージの `tools` はステージJSONにのみ存在し、エンジン本体のコード変更を伴わない（Overview.md「新ステージ追加＝JSONを1個書くだけ」を満たす）
- [ ] 1-3 の `/backup/idcard.csv` と 2-1〜2-4 の中間生成物（`/tmp/out` 等）で「出力先が読めるケース／読めないケース」の両方を経験させ、スキンごとの手触りの違いを維持している
- [ ] **root専有ファイルの正確なパスは、ストーリー画面のナレーションでは明かさない。** かならず `ls` で見える範囲に guest が `read` できる「メモ」（引き継ぎメモ・室内メモ等）を1つ置き、そこにパスを書く。プレイヤーがゲーム内の調査行動（`ls`→`read`）だけでパスを発見できることを、ステージ追加のたびに確認する
