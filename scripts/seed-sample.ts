#!/usr/bin/env tsx
/**
 * Seed Supabase with sample IT Passport questions for development/testing.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-sample.ts
 *
 * For production data, use the main import script instead:
 *   npx tsx --env-file=.env.local scripts/import-questions.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";

const OUTPUT_JSON = path.resolve("scripts/data/questions.json");

const SAMPLE_QUESTIONS = [
  // ── ストラテジ系 ──────────────────────────────────────────────────────
  {
    ipa_id: "SAMPLE_Q001",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "経営戦略マネジメント",
    question:
      "SWOT分析において，自社の強み（Strengths）として分類されるものはどれか。",
    options: [
      { key: "ア", text: "競合他社が持つ特許技術" },
      { key: "イ", text: "自社が保有する熟練した技術者" },
      { key: "ウ", text: "市場に新規参入してくる競合他社" },
      { key: "エ", text: "顧客ニーズの多様化" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q002",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "経営戦略マネジメント",
    question:
      "PPM（プロダクト・ポートフォリオ・マネジメント）において，市場成長率が高く市場占有率も高い事業は，どのように分類されるか。",
    options: [
      { key: "ア", text: "金のなる木" },
      { key: "イ", text: "スター" },
      { key: "ウ", text: "負け犬" },
      { key: "エ", text: "問題児" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q003",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "経営戦略マネジメント",
    question:
      "PDCAサイクルにおいて，計画（Plan）の次に行う活動として正しいものはどれか。",
    options: [
      { key: "ア", text: "Action（改善）" },
      { key: "イ", text: "Check（評価）" },
      { key: "ウ", text: "Do（実行）" },
      { key: "エ", text: "Plan（再計画）" },
    ],
    answer: "ウ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q004",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "技術戦略マネジメント",
    question:
      "MOT（技術経営）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "企業の資金調達や財務管理を専門的に行う経営手法" },
      { key: "イ", text: "技術を経営戦略と結び付け，イノベーションを通じて競争優位を創出する経営手法" },
      { key: "ウ", text: "製品やサービスの品質管理を組織全体で行う経営手法" },
      { key: "エ", text: "人材の採用・育成・評価を体系的に行う経営手法" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q005",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "ビジネスインダストリ",
    question:
      "BCP（事業継続計画）を策定する主な目的として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "競合他社より先に新製品を市場投入し，市場シェアを拡大する" },
      { key: "イ", text: "自然災害や事故などの緊急事態が発生した際，事業への影響を最小化し，事業を継続または早期復旧させる" },
      { key: "ウ", text: "従業員の労働環境を改善し，生産性と定着率を向上させる" },
      { key: "エ", text: "年間の売上目標と利益目標を達成するための行動計画を策定する" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q006",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "企業と法務",
    question:
      "著作権法において，プログラムの著作物に関する記述として，正しいものはどれか。",
    options: [
      { key: "ア", text: "アイデアそのものも著作権で保護される" },
      { key: "イ", text: "会社の業務として作成したプログラムは，特段の定めがない限り会社が著作権者となる" },
      { key: "ウ", text: "プログラムの著作権は登録しなければ発生しない" },
      { key: "エ", text: "プログラムを逆コンパイルすることは常に著作権侵害にあたる" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q007",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "企業と法務",
    question:
      "個人情報保護法における個人情報の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "企業が保有する営業秘密に関する情報" },
      { key: "イ", text: "氏名・生年月日などにより特定の個人を識別できる情報" },
      { key: "ウ", text: "政府機関が保有する行政文書に記載されている情報" },
      { key: "エ", text: "統計データのように個人を特定できない集計情報" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q008",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "システム戦略",
    question:
      "ERP（Enterprise Resource Planning）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "顧客情報を一元管理し，マーケティングや営業活動を支援するシステム" },
      { key: "イ", text: "財務・人事・生産・販売など企業の基幹業務を統合的に管理するシステム" },
      { key: "ウ", text: "製品の企画から廃棄まで，ライフサイクル全体を管理するシステム" },
      { key: "エ", text: "調達から顧客への製品供給まで，サプライチェーン全体を最適化するシステム" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q009",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "システム戦略",
    question:
      "SaaS（Software as a Service）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "アプリケーション開発・実行環境をインターネット経由で提供するサービス" },
      { key: "イ", text: "インターネット経由でアプリケーションソフトウェアを提供するサービス" },
      { key: "ウ", text: "コンピュータのハードウェアやネットワーク等をインターネット経由で提供するサービス" },
      { key: "エ", text: "ソフトウェアパッケージを購入して自社サーバにインストールして利用するサービス" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q010",
    year: "SAMPLE",
    category: "ストラテジ系",
    subcategory: "経営管理システム",
    question:
      "KPI（Key Performance Indicator）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "企業が社会や環境に対して負う責任のこと" },
      { key: "イ", text: "経営戦略を実現するための重要な業績評価指標" },
      { key: "ウ", text: "財務・顧客・業務プロセス・学習と成長の4視点から戦略を評価するツール" },
      { key: "エ", text: "損益分岐点を超えるために必要な最低売上高のこと" },
    ],
    answer: "イ",
    explanation: "",
  },

  // ── マネジメント系 ────────────────────────────────────────────────────
  {
    ipa_id: "SAMPLE_Q036",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question:
      "WBS（Work Breakdown Structure）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "各タスクの担当者とその役割・責任を一覧で示した表" },
      { key: "イ", text: "作業の先行・後続関係を矢印で示し，クリティカルパスを求める手法" },
      { key: "ウ", text: "プロジェクトの成果物や作業を階層的に分解・整理した構成図" },
      { key: "エ", text: "プロジェクトのスケジュールをバーチャートで視覚化した図" },
    ],
    answer: "ウ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q037",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question:
      "プロジェクトマネジメントにおけるリスクマネジメントの説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "プロジェクト完了後に実施するコストの精算業務" },
      { key: "イ", text: "プロジェクトに影響を与える可能性のある不確実な事象を識別・分析・対応する活動" },
      { key: "ウ", text: "プロジェクトメンバーの業務分担と進捗を管理する活動" },
      { key: "エ", text: "プロジェクト要件の変更を承認・記録する活動" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q038",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "プロジェクトマネジメント",
    question:
      "アジャイル開発の特徴として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "開発工程ごとに成果物を確定させ，次の工程に進む逐次的な開発手法" },
      { key: "イ", text: "短い反復（イテレーション）で動くソフトウェアを継続的に提供し，変化に柔軟に対応する開発手法" },
      { key: "ウ", text: "設計書や仕様書を重視し，ドキュメント主導で進める開発手法" },
      { key: "エ", text: "テスト工程を最初に行い，その後で実装を行う開発手法" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q039",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "サービスマネジメント",
    question:
      "SLA（Service Level Agreement）の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "ITサービスの継続的改善を目的としたフレームワーク" },
      { key: "イ", text: "サービス提供者と利用者の間で，サービスの品質水準を合意した文書" },
      { key: "ウ", text: "ソフトウェアのライセンス使用条件を定めた契約書" },
      { key: "エ", text: "プロジェクトの範囲・スケジュール・コストを定めた計画書" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q040",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "サービスマネジメント",
    question:
      "ITILにおけるインシデント管理の目的として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "インシデントの根本原因を特定し，再発を防止する" },
      { key: "イ", text: "サービスへの影響を最小限に抑え，できるだけ早くサービスを正常状態に回復する" },
      { key: "ウ", text: "サービスレベル目標を設定し，達成状況を監視する" },
      { key: "エ", text: "変更要求を評価し，リスクを管理しながら変更を実施する" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q041",
    year: "SAMPLE",
    category: "マネジメント系",
    subcategory: "システム監査",
    question:
      "システム監査の目的として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "システム開発プロジェクトの進捗を管理し，納期を守る" },
      { key: "イ", text: "情報システムのリスクに対するコントロールが適切かどうかを独立した立場から点検・評価する" },
      { key: "ウ", text: "ソフトウェアのバグや欠陥を発見・修正する" },
      { key: "エ", text: "ユーザーがシステムを正しく操作しているかを確認する" },
    ],
    answer: "イ",
    explanation: "",
  },

  // ── テクノロジ系 ──────────────────────────────────────────────────────
  {
    ipa_id: "SAMPLE_Q060",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "基礎理論",
    question:
      "10進数の「25」を2進数に変換した値はどれか。",
    options: [
      { key: "ア", text: "10111" },
      { key: "イ", text: "11001" },
      { key: "ウ", text: "11010" },
      { key: "エ", text: "11100" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q061",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "コンピュータシステム",
    question:
      "CPUのクロック周波数が2倍になると，一般的に処理速度はどうなるか。",
    options: [
      { key: "ア", text: "処理速度はほぼ変わらない" },
      { key: "イ", text: "処理速度は約2倍になる" },
      { key: "ウ", text: "処理速度は約4倍になる" },
      { key: "エ", text: "処理速度は約8倍になる" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q062",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "ソフトウェア",
    question:
      "OSが提供する機能として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "会計処理や給与計算などの業務アプリケーション機能" },
      { key: "イ", text: "ハードウェアの管理やプロセスの制御など，コンピュータ資源を管理する基本機能" },
      { key: "ウ", text: "文書の作成・編集・印刷を行うワープロ機能" },
      { key: "エ", text: "データの統計分析・グラフ化を行う表計算機能" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q063",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "ソフトウェア",
    question:
      "関係データベースにおけるSQL文「SELECT」の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "テーブルからレコードを削除する" },
      { key: "イ", text: "テーブルに新しいレコードを挿入する" },
      { key: "ウ", text: "テーブルのレコードを更新する" },
      { key: "エ", text: "テーブルのレコードを検索・取得する" },
    ],
    answer: "エ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q064",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "ネットワーク",
    question:
      "DNSの説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "IPアドレスとMACアドレスを対応付けるプロトコル" },
      { key: "イ", text: "インターネット上のコンピュータにIPアドレスを動的に割り当てるプロトコル" },
      { key: "ウ", text: "ドメイン名とIPアドレスを相互に変換するシステム" },
      { key: "エ", text: "電子メールをサーバ間で転送するプロトコル" },
    ],
    answer: "ウ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q065",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "ネットワーク",
    question:
      "HTTPSとHTTPの違いとして，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "HTTPSはHTTPよりも通信速度が速い" },
      { key: "イ", text: "HTTPSはTLS/SSLによる暗号化通信を行い，通信内容の盗聴・改ざんを防止する" },
      { key: "ウ", text: "HTTPSはHTTPと異なるポート番号を使用するが，通信内容は同じである" },
      { key: "エ", text: "HTTPSはWebサーバの負荷を軽減するためのプロトコルである" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q066",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "セキュリティ",
    question:
      "フィッシング詐欺の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "Webサイトの脆弱性を突いてデータベースを不正操作する攻撃" },
      { key: "イ", text: "偽のWebサイトや電子メールを用いて，利用者のIDやパスワードなどを騙し取る詐欺" },
      { key: "ウ", text: "コンピュータウイルスを大量にばらまき，システムを感染させる攻撃" },
      { key: "エ", text: "大量のリクエストを送り付けてサーバを機能不全にする攻撃" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q067",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "セキュリティ",
    question:
      "公開鍵暗号方式の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "暗号化と復号に同じ鍵を使用する方式" },
      { key: "イ", text: "公開鍵で暗号化し，対応する秘密鍵でのみ復号できる方式" },
      { key: "ウ", text: "送受信者があらかじめ安全な方法で同じ鍵を共有する方式" },
      { key: "エ", text: "パスワードを一方向に変換し，元に戻せない形で保存する方式" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q068",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "セキュリティ",
    question:
      "ファイアウォールの主な役割として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "コンピュータウイルスを検知・駆除する" },
      { key: "イ", text: "ネットワーク間の通信を監視・制御し，不正なアクセスを遮断する" },
      { key: "ウ", text: "ネットワーク上の通信を暗号化して盗聴を防ぐ" },
      { key: "エ", text: "ユーザーのIDとパスワードを管理して認証を行う" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q069",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "データベース",
    question:
      "関係データベースにおいて，テーブル間の関連付けに使用するものはどれか。",
    options: [
      { key: "ア", text: "インデックス" },
      { key: "イ", text: "外部キー" },
      { key: "ウ", text: "トランザクション" },
      { key: "エ", text: "ビュー" },
    ],
    answer: "イ",
    explanation: "",
  },
  {
    ipa_id: "SAMPLE_Q070",
    year: "SAMPLE",
    category: "テクノロジ系",
    subcategory: "情報デザイン",
    question:
      "UXデザインにおける「ユーザーエクスペリエンス」の説明として，最も適切なものはどれか。",
    options: [
      { key: "ア", text: "システムの応答速度やスループットなどの性能指標" },
      { key: "イ", text: "製品やサービスを利用する際のユーザーの総合的な体験・感情" },
      { key: "ウ", text: "ソフトウェアの機能要件を文書化した仕様書" },
      { key: "エ", text: "ユーザーインタフェースの画面レイアウトや色使い" },
    ],
    answer: "イ",
    explanation: "",
  },
];

async function upsertToSupabase(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping DB upsert.");
    return;
  }
  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("questions")
    .upsert(SAMPLE_QUESTIONS, { onConflict: "ipa_id" });
  if (error) throw new Error(`Supabase upsert error: ${error.message}`);
  console.log(`Upserted ${SAMPLE_QUESTIONS.length} rows to Supabase.`);
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });

  // Save JSON
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(SAMPLE_QUESTIONS, null, 2), "utf-8");
  console.log(`Saved ${SAMPLE_QUESTIONS.length} sample questions → ${OUTPUT_JSON}`);

  // Upsert to Supabase
  await upsertToSupabase();
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
