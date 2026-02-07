### サービスの定義

- **ターゲット：** 「遊ぶ」だけでなく「創る」ことも楽しみたい、レトロゲーム好きのエンジニアやクリエイター
- **課題：** 既存のゲームは遊ぶだけで終わってしまい、自分のアイデアを形にして誰かに公開・共有するまでのハードル（環境構築や公開作業）が高い。
- **解決する機能：** 未ログインでも即座に遊べる**ブラウザ型2Dアクションエンジン**、Web上で完結する**ノーコード・ステージエディタ**、およびユーザー間での**ハイスコアランキング・自作ステージ公開機能**。
- **サービス：** 「遊ぶ・創る・競う」がブラウザ1つで完結する、**ユーザー投稿型レトロダンジョン・プラットフォーム**。

「**レトロな2Dゲームのプレイと制作に興味がある人向けに、自作ステージの公開やスコア競合のための環境構築が手間であるという課題を、ブラウザ上で完結するステージエディタとハイスコアランキング機能で解決する、ユーザー投稿型ダンジョン制作・攻略プラットフォームサービス**」

- **「遊ぶ」のハードルを下げる:** ログイン不要で遊べる設定なので、Next.jsの**ISR（Incremental Static Regeneration）**を活用して、人気ステージのページを爆速で表示させる。
- **「創る」の体験をリッチに:** ステージエディタ部分は、Reactの**Dnd Kit**などを使って、タイルをパレットからドラッグ＆ドロップして配置できる直感的なUIにする。
- **「競う」の信頼性:** スコア管理には**Server Actions**を使用し、フロントエンド側でのスコア改ざんを防ぐロジックをサーバーサイドに組み込む。

### Phaser (最も多機能・王道)

世界で最も普及しているHTML5ゲームエンジンです。2026年現在も、Next.js向けの公式テンプレートが充実しており、迷ったらこれという選択肢です。

- **特徴:** 物理演算、タイルマップエディタ（Tiled等）との連携、アニメーション管理など、ゲームに必要な機能がすべて揃っています。
- **TypeScript対応:** 非常に強力。型定義がしっかりしており、大規模な開発でも安心です。
- **Reactとの相性:** `IonPhaser` などのラッパーを使わずとも、特定のDOM要素にゲームをマウントする形でNext.jsと併用可能です。
- **向いている人:** 「本格的なアクション要素や物理演算を入れたい」「ドキュメントや情報の多さを重視したい」人。

### 開発ログ

```
npx create-next-app@latest my-dungeon-game --typescript --tailwind --eslint
cd my-dungeon-game
npm install phaser
```

```
npm install @prisma/client@7.2.0 @prisma/adapter-better-sqlite3@7.2.0 @prisma/adapter-pg@7.2.0
npm install --save-dev prisma@7.2.0
```

### 各パッケージの役割

- **`prisma`**: CLIツールです。マイグレーション（DBの作成・更新）や `prisma studio` の起動に使用します。開発環境でのみ必要なので `--save-dev` をつけます。
- **`@prisma/client`**: コードからデータベースを操作するためのメインライブラリです。
- **`@prisma/adapter-better-sqlite3`**: Prisma 5.4.0以降で推奨されている、エッジコンピューティングや特定の環境（Next.jsなど）でSQLiteをより効率的に動作させるためのアダプターです。
- **`@prisma/adapter-pg`**: PostgreSQLをアダプター経由で接続するためのパッケージです。

1. **初期化コマンドの実行**

```bash
npx prisma init
```

2. **`prisma/schema.prisma` の編集**
3. **マイグレーション（DB反映）**

```bash
npx prisma migrate dev --name init
```

### prisma操作

DB参照
※または、dev.dbをクリック

```
npx prisma studio
```

サンプルデータ作成

```
npx tsx prisma/seed.ts
```

既存データを削除

```
npx prisma migrate reset
```

データベースへの反映

```
npx prisma migrate dev --name add_description_and_user_ids_to_dungeon
```

### prisma修正時

node_modules生成

```
npm install
```

.nextフォルダ生成

```
npm run build
```

Prisma Client の再生成

```
npx prisma generate
```

履歴を残さず強制同期

```
npx prisma db push --force-reset
```

2026/02/07
今後の拡張例：
DRAFT: 作成中。本人にしか見えない。
PUBLISHED: 公開中。誰でも遊べる。
PRIVATE: リンクを知っている人だけ遊べる（合言葉など）。
ARCHIVED: 公開終了。ランキング閲覧のみ。
BANNED: 規約違反などで運営が差し止めた状態。

enum に新しい値を追加して npx prisma migrate dev を実行する
