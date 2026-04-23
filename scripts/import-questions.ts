#!/usr/bin/env tsx
/**
 * Download IPA IT Passport public exam PDFs and import into Supabase.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-questions.ts
 *
 * Requirements:
 *   - Internet access to www3.jitec.ipa.go.jp
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (optional;
 *     if absent the script still saves scripts/data/questions.json)
 */

import * as fs from "node:fs";
import * as path from "node:path";
// @ts-expect-error pdf-parse lacks a complete type declaration
import pdfParse from "pdf-parse";
import { load as cheerioLoad } from "cheerio";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Option {
  key: string;
  text: string;
}

interface Question {
  ipa_id: string;      // "R6_Q001"
  year: string;        // "R6"
  category: string;    // "ストラテジ系" | "マネジメント系" | "テクノロジ系"
  subcategory: string; // e.g. "企業と法務"
  question: string;
  options: Option[];
  answer: string;      // "ア" | "イ" | "ウ" | "エ"
  explanation: string;
}

interface AnswerEntry {
  answer: string;
  category: string;
  subcategory: string;
}

interface PdfGroup {
  year: string;         // "R5" | "R6" | "R7"
  label: string;
  questionUrl: string;
  answerUrl: string | null;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IPA_BASE_URL = "https://www3.jitec.ipa.go.jp";
const QUESTIONS_PAGE_URL = `${IPA_BASE_URL}/JitesCbt/html/openinfo/questions.html`;

const SCRIPTS_DIR = path.resolve(process.cwd(), "scripts");
const DATA_DIR = path.join(SCRIPTS_DIR, "data");
const PDFS_DIR = path.join(DATA_DIR, "pdfs");
const OUTPUT_JSON = path.join(DATA_DIR, "questions.json");

// Today: 2026-04-23 = 令和8年.  Target = last 3 completed years.
const TARGET_YEARS = new Set(["R5", "R6", "R7"]);

// Fallback: if the HTML page cannot be scraped, use these known URL patterns.
// IPA公開問題のURLパターン（実際のファイル名は年度により異なる場合があります）
const KNOWN_PDF_URLS: PdfGroup[] = [
  {
    year: "R7",
    label: "令和7年度公開問題",
    questionUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R07_AMQN_J.pdf`,
    answerUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R07_AMAN_J.pdf`,
  },
  {
    year: "R6",
    label: "令和6年度公開問題",
    questionUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R06_AMQN_J.pdf`,
    answerUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R06_AMAN_J.pdf`,
  },
  {
    year: "R5",
    label: "令和5年度公開問題",
    questionUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R05_AMQN_J.pdf`,
    answerUrl: `${IPA_BASE_URL}/JitesCbt/resources/up/pdf/IP_R05_AMAN_J.pdf`,
  },
];

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
  Referer: QUESTIONS_PAGE_URL,
};

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} GET ${url}`);
  return res.text();
}

async function downloadPdf(url: string, dest: string): Promise<boolean> {
  if (fs.existsSync(dest)) {
    console.log(`  cached  ${path.basename(dest)}`);
    return true;
  }
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    console.warn(`  skip (${res.status})  ${path.basename(dest)}`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`  saved   ${path.basename(dest)}`);
  return true;
}

// ---------------------------------------------------------------------------
// Scrape PDF list from IPA questions page
// ---------------------------------------------------------------------------

function extractYear(text: string): string | null {
  const m = text.match(/令和\s*(\d+)\s*年/);
  if (m) return `R${m[1]}`;
  const m2 = text.match(/\bR(\d{1,2})\b/i);
  if (m2) return `R${m2[1].toUpperCase()}`;
  return null;
}

async function scrapePdfGroups(): Promise<PdfGroup[]> {
  console.log("Fetching PDF list from IPA...");
  const html = await fetchText(QUESTIONS_PAGE_URL);
  const $ = cheerioLoad(html);

  const links: { text: string; url: string }[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href.toLowerCase().includes(".pdf")) return;
    const url = href.startsWith("http")
      ? href
      : `${IPA_BASE_URL}${href.startsWith("/") ? "" : "/"}${href}`;
    links.push({ text: $(el).text().trim(), url });
  });

  // Separate question PDFs and answer PDFs
  const isQuestionLink = (l: { text: string; url: string }) =>
    l.text.includes("問題") ||
    /[qQ][nN]/.test(l.url) ||
    l.url.toLowerCase().includes("question");
  const isAnswerLink = (l: { text: string; url: string }) =>
    l.text.includes("解答") ||
    /[aA][nN]/.test(l.url) ||
    l.url.toLowerCase().includes("answer");

  const questionLinks = links.filter(isQuestionLink);
  const answerLinks = links.filter(isAnswerLink);

  const groups: PdfGroup[] = [];
  for (const ql of questionLinks) {
    const year = extractYear(ql.text) ?? extractYear(ql.url);
    if (!year || !TARGET_YEARS.has(year)) continue;
    // Avoid duplicate years (take first match)
    if (groups.some((g) => g.year === year)) continue;

    const answerLink = answerLinks.find((al) => {
      const ay = extractYear(al.text) ?? extractYear(al.url);
      return ay === year;
    });
    groups.push({
      year,
      label: ql.text || year,
      questionUrl: ql.url,
      answerUrl: answerLink?.url ?? null,
    });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Parse question PDF text
// ---------------------------------------------------------------------------

/** Rough fallback: assign category by question number range */
function categoryByNumber(n: number): string {
  if (n <= 35) return "ストラテジ系";
  if (n <= 59) return "マネジメント系";
  return "テクノロジ系";
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t　]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseQuestionPdf(
  text: string,
  year: string
): Map<number, Partial<Question>> {
  const result = new Map<number, Partial<Question>>();

  // Split on "問N" boundaries.  IPA uses full-width and half-width variants.
  const blockRe = /(?:^|\n)\s*問\s*(\d{1,3})\s+/g;
  const blocks: { num: number; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(text)) !== null) {
    blocks.push({ num: parseInt(m[1], 10), start: m.index });
  }

  for (let i = 0; i < blocks.length; i++) {
    const { num, start } = blocks[i];
    const end = blocks[i + 1]?.start ?? text.length;
    const block = text.slice(start, end).trim();

    // Options: lines starting with ア/イ/ウ/エ (may be full-width)
    const optRe = /([アイウエ])\s+([\s\S]+?)(?=\n[アイウエ]\s+|\s*$)/g;
    const options: Option[] = [];
    let om: RegExpExecArray | null;
    while ((om = optRe.exec(block)) !== null) {
      options.push({
        key: om[1],
        text: om[2].replace(/\s*\n\s*/g, " ").trim(),
      });
    }
    if (options.length < 4) continue;

    // Question text: between "問N" prefix and the first option
    const firstOptIdx = block.search(/\n[アイウエ]\s/);
    const prefix = block.match(/^問\s*\d+\s+/)?.[0] ?? "";
    const questionText = (
      firstOptIdx > 0
        ? block.slice(prefix.length, firstOptIdx)
        : block.slice(prefix.length)
    )
      .replace(/\s*\n\s*/g, " ")
      .trim();

    result.set(num, {
      ipa_id: `${year}_Q${String(num).padStart(3, "0")}`,
      year,
      question: questionText,
      options,
      category: categoryByNumber(num), // overwritten if answer PDF available
      subcategory: "",
      answer: "",
      explanation: "",
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Parse answer PDF text
// ---------------------------------------------------------------------------

function parseAnswerPdf(text: string): Map<number, AnswerEntry> {
  const result = new Map<number, AnswerEntry>();
  const CATEGORIES = "ストラテジ系|マネジメント系|テクノロジ系";

  // Table row pattern: "N  [ア-エ]  category  subcategory..."
  const rowRe = new RegExp(
    `(\\d{1,3})\\s+([アイウエ])\\s+(${CATEGORIES})\\s+([^\\n]+)`,
    "g"
  );
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    // subcategory field may contain multiple tab-separated columns; take first
    const subcategory = m[4].split(/\s{2,}/)[0].trim();
    result.set(num, { answer: m[2], category: m[3], subcategory });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Supabase upsert
// ---------------------------------------------------------------------------

async function upsertToSupabase(questions: Question[]): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log(
      "\nSUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping DB upsert."
    );
    return;
  }

  const supabase = createClient(url, key);
  const BATCH = 100;
  let inserted = 0;

  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);
    const { error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "ipa_id" });
    if (error) throw new Error(`Supabase upsert error: ${error.message}`);
    inserted += batch.length;
    process.stdout.write(`  upserted ${inserted}/${questions.length}\r`);
  }
  console.log(`\n  Done — ${inserted} rows upserted.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(PDFS_DIR, { recursive: true });

  // Discover PDFs
  let groups: PdfGroup[] = [];
  try {
    groups = await scrapePdfGroups();
  } catch (err) {
    console.warn(
      `Could not scrape IPA page (${(err as Error).message}). Falling back to known URLs.`
    );
    groups = KNOWN_PDF_URLS;
  }

  if (groups.length === 0) {
    console.error("No PDF groups found for years:", [...TARGET_YEARS]);
    process.exit(1);
  }
  console.log(
    `Target exams: ${groups.map((g) => `${g.year}(${g.label})`).join(", ")}\n`
  );

  const allQuestions: Question[] = [];

  for (const group of groups) {
    console.log(`=== ${group.year} ===`);

    const qPath = path.join(PDFS_DIR, `${group.year}_questions.pdf`);
    const aPath = path.join(PDFS_DIR, `${group.year}_answers.pdf`);

    const qOk = await downloadPdf(group.questionUrl, qPath);
    if (group.answerUrl) await downloadPdf(group.answerUrl, aPath);

    if (!qOk) {
      console.warn(`  Skipping ${group.year} — question PDF unavailable.`);
      continue;
    }

    // Parse question PDF
    const qText = normalizeText(
      (await pdfParse(fs.readFileSync(qPath))).text as string
    );
    const questionsMap = parseQuestionPdf(qText, group.year);
    console.log(`  Parsed ${questionsMap.size} questions`);

    // Parse answer PDF
    let answersMap = new Map<number, AnswerEntry>();
    if (fs.existsSync(aPath)) {
      const aText = normalizeText(
        (await pdfParse(fs.readFileSync(aPath))).text as string
      );
      answersMap = parseAnswerPdf(aText);
      console.log(`  Parsed ${answersMap.size} answers`);
    }

    for (const [num, q] of questionsMap) {
      const a = answersMap.get(num);
      allQuestions.push({
        ipa_id: q.ipa_id!,
        year: q.year!,
        category: a?.category ?? q.category!,
        subcategory: a?.subcategory ?? q.subcategory!,
        question: q.question!,
        options: q.options!,
        answer: a?.answer ?? q.answer!,
        explanation: "",
      });
    }
  }

  allQuestions.sort((a, b) => {
    if (a.year !== b.year) return a.year < b.year ? -1 : 1;
    return parseInt(a.ipa_id.split("_Q")[1]) - parseInt(b.ipa_id.split("_Q")[1]);
  });

  // Save JSON
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(allQuestions, null, 2), "utf-8");
  console.log(`\nSaved ${allQuestions.length} questions → ${OUTPUT_JSON}`);

  // Upsert to Supabase
  await upsertToSupabase(allQuestions);
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
