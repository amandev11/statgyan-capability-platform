// Real PDF text extraction — lazily loads pdf.js only when a PDF is uploaded,
// so the ~1 MB parser chunk never enters the initial bundle.
//
// Output embeds "[Page N]" markers between pages so downstream MCQ generation
// can cite exact page numbers in every grounded question's source reference.

export interface PdfExtraction {
  text: string; // full text with [Page N] markers
  pages: number;
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function extractPdf(file: File): Promise<PdfExtraction> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) parts.push(`[Page ${p}] ${pageText}`);
  }
  return { text: parts.join("\n"), pages: doc.numPages };
}
