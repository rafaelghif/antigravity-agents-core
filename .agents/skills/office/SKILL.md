---
name: office
description: Processes, analyzes, extracts, and generates Microsoft Office documents (.docx, .xlsx, .pptx) and PDFs using Antigravity native multimodal capabilities and automation scripts. Use this skill when the user asks to parse spreadsheets, generate Word reports, extract PDF data, or manipulate Office files.
---

# Office & Document Processing

Process, analyze, extract, and author Microsoft Office documents (`.docx`, `.xlsx`, `.pptx`), CSV spreadsheets, and PDFs using Antigravity's native multimodal file ingestion and automated generation scripts.

## Decision tree

1. **Does the task involve office documents, spreadsheets, or PDFs?**
   - **No (source code, plain markdown, database migrations, or live web pages)** → Route to the appropriate domain skill (`browsing`, `coding-standards`, `database-migration`).
   - **Yes** → Proceed to step 2.
2. **Are you reading/analyzing an existing file or generating/modifying one?**
   - **Reading or Analyzing an existing document**:
     - *Small to medium files (<20 MB) or attached directly in conversation*: Use Antigravity's native multimodal pipeline (`read_file` or prompt attachment). Gemini models parse text, tables, and layouts natively without external tools.
     - *Large datasets, formula audits, or batch exports*: Run the extraction helper [scripts/extract-office.py](./scripts/extract-office.py) via `run_command` to generate clean JSON or tabular outputs.
   - **Generating or Modifying a document**:
     - *Excel spreadsheets (`.xlsx`)*: Use `openpyxl` or `exceljs` with proper cell styles, uppercase formulas (`=SUM()`), and auto-fitted column widths (see [examples/generate-report.py](./examples/generate-report.py)).
     - *Word documents (`.docx`)*: Use `python-docx` or `pandoc` with clear semantic headings (`H1` > `H2` > `H3`) and styled tables.
     - *PDF exports*: Convert from Markdown/HTML or compile via headless tooling. Proceed to step 3.
3. **Where should generated files be stored and presented?**
   - Save output files to `.scratch/` or project asset paths.
   - Present a concise Markdown summary table in your response or conversation artifact and link directly to the generated office file with a clickable relative path.

---

## When to use office processing

### 1. Valid trigger scenarios
- **Native document inspection**: Reading uploaded `.docx`, `.xlsx`, `.pptx`, or `.pdf` files to extract requirements, analyze contracts, or audit business logic.
- **Spreadsheet data processing**: Parsing CSV/Excel tables, computing aggregations, validating formulas, or structuring raw metrics.
- **Client-ready report generation**: Converting technical markdown specs, test results, or sprint metrics into styled `.docx` reports or `.xlsx` workbooks.
- **Data conversions**: Transforming CSV/JSON into formatted Excel workbooks or compiling markdown into Word documents.

### 2. Prohibited anti-patterns
- **Hardcoding unformatted floats**: Never output raw floating-point numbers for currency without explicit cell formatting.
- **Monolithic raw dumps**: Never paste 10,000 raw spreadsheet rows directly into chat context; extract a representative sample and write the full dataset to a file.
- **Re-inventing native parsers**: Never write complex regexes to scrape text from binary docx/xlsx files when Antigravity's multimodal ingestion or [scripts/extract-office.py](./scripts/extract-office.py) handles it natively.

---

## Implementation workflow

### Step 1: Pre-flight format & tool selection
1. Check file extension and size:
   - For `.docx`, `.xlsx`, `.pptx`, `.pdf`: See [references/office-formats-and-tools.md](./references/office-formats-and-tools.md).
2. Choose execution path:
   - Reading/Q&A: Antigravity native multimodal `read_file`.
   - Batch extraction: Run [scripts/extract-office.py](./scripts/extract-office.py).
   - Authoring: Run a generator script like [examples/generate-report.py](./examples/generate-report.py).

### Step 2: Extraction & processing
- Execute extraction via `run_command`:
  ```bash
  python .agents/skills/office/scripts/extract-office.py path/to/document.xlsx .scratch/extracted.json
  ```
- Inspect extracted JSON structure and verify key sheet names or section headings.

### Step 3: Authoring & formatting standards
Follow formatting standards in [references/document-conversions.md](./references/document-conversions.md):
- Spreadsheets: Header fills, borders, frozen top row, auto-adjusted column widths, and uppercase formulas.
- Documents: Semantic hierarchy, styled table borders, and zero hardcoded absolute path links in footers.

### Step 4: Verification & artifact delivery
1. Verify the generated file is valid and non-empty (`test -s .scratch/output.xlsx`).
2. Provide a markdown summary table in the response and include a clickable file link to the generated document.
