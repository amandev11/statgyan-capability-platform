// Real Office-format text extraction — DOCX and PPTX are ZIP archives of XML.
// fflate (30 KB, no deps) inflates them in-browser; we parse the relevant XML
// parts directly. Lazily imported only when such a file is uploaded.
//
// Provenance is preserved structurally so downstream MCQ generation can cite
// real locations (never invented):
//  · DOCX  → paragraphs; Heading1–3 become "[Section: <heading>]" markers
//  · PPTX  → slides in order; each becomes "[Slide N] <title/body>" text

import { unzipSync, strFromU8 } from "fflate";

export interface OfficeExtraction {
  text: string;
  units: number; // pages-equivalent: sections for DOCX, slides for PPTX
}

function xmlText(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull the text of each <w:p> paragraph, flagging heading-styled paragraphs. */
function docxParagraphs(documentXml: string): { isHeading: boolean; text: string }[] {
  const out: { isHeading: boolean; text: string }[] = [];
  const paras = documentXml.match(/<w:p\b[\s\S]*?<\/w:p>/g) ?? [];
  for (const p of paras) {
    // Runs may split words — concatenate every <w:t> in document order.
    const runs = [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join("");
    const text = xmlText(runs);
    if (!text) continue;
    const style = p.match(/<w:pStyle w:val="([^"]+)"/)?.[1] ?? "";
    const isHeading = /^(Heading|heading)\s?[1-6]$/.test(style) || /^[1-6]$/.test(style);
    out.push({ isHeading, text });
  }
  return out;
}

export async function extractDocx(file: File): Promise<OfficeExtraction> {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const docXmlKey = Object.keys(zip).find((k) => k === "word/document.xml");
  if (!docXmlKey) throw new Error("Not a readable Word document");
  const paragraphs = docxParagraphs(strFromU8(zip[docXmlKey]));

  let sectionCount = 0;
  const parts: string[] = [];
  for (const para of paragraphs) {
    if (para.isHeading) {
      sectionCount += 1;
      parts.push(`[Section: ${para.text}]`);
    } else if (para.text.split(/\s+/).length >= 4) {
      parts.push(para.text);
    }
  }
  return { text: parts.join("\n"), units: Math.max(sectionCount, 1) };
}

/** Slide order comes from ppt/_rels + presentation.xml; numeric sort on slideN.xml is reliable in practice. */
export async function extractPptx(file: File): Promise<OfficeExtraction> {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const slideKeys = Object.keys(zip)
    .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
    .sort((a, b) => {
      const na = Number(/slide(\d+)\.xml$/.exec(a)?.[1] ?? 0);
      const nb = Number(/slide(\d+)\.xml$/.exec(b)?.[1] ?? 0);
      return na - nb;
    });
  if (slideKeys.length === 0) throw new Error("Not a readable PowerPoint file");

  const parts: string[] = [];
  for (let i = 0; i < slideKeys.length; i++) {
    const xml = strFromU8(zip[slideKeys[i]]);
    // Title placeholder first (if any), then all remaining text runs.
    const titleMatch = /<p:sp>(?:(?!<\/p:sp>)[\s\S])*?<p:ph[^>]*type="(?:ctrTitle|title)"[\s\S]*?<\/p:sp>/.exec(xml);
    const titleTexts = titleMatch ? [...titleMatch[0].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]) : [];
    const allTexts = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]);
    const bodyTexts = titleTexts.length ? allTexts.filter((t) => !titleTexts.includes(t)) : allTexts;

    const title = xmlText(titleTexts.join(" "));
    const body = xmlText(bodyTexts.join(" • "));
    parts.push(`[Slide ${i + 1}] ${title ? `Title: ${title}. ` : ""}${body}`.trim());
  }
  return { text: parts.join("\n"), units: slideKeys.length };
}
