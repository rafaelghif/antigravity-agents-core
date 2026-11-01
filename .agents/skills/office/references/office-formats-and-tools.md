# Office Document Formats and Processing Tools

Authoritative guide on processing, generating, and converting Microsoft Office formats (.docx, .xlsx, .pptx) and PDFs in Google Antigravity.

---

## 1. Antigravity Native Multimodal Capabilities

Google Antigravity 2.0+ includes native multimodal ingestion for document formats:

- **Supported Formats**:
  - Microsoft Word (`.docx`)
  - Microsoft Excel (`.xlsx`, `.csv`, `.tsv`)
  - Microsoft PowerPoint (`.pptx`)
  - Portable Document Format (`.pdf`)
  - Compressed Archives (`.zip`, `.tar.gz`)
- **Direct Processing**:
  - Drag-and-drop documents into the Antigravity prompt composer.
  - Attached documents are parsed directly by Gemini multimodal models without requiring external conversion tools.
  - Agents can answer questions, extract tabular data, summarize contracts, and compare document revisions natively.

---

## 2. Programmatic Processing Ecosystem

When tasks require batch transformations, formula evaluation, data synthesis, or generating net-new formatted documents, use standard scripting libraries via `run_command`:

### Python Libraries (Recommended)
| Format | Library | Primary Use Case |
| :--- | :--- | :--- |
| **Excel (`.xlsx`)** | `openpyxl` / `pandas` | Reading/writing sheets, styles, number formatting, formulas, cell merging. |
| **Word (`.docx`)** | `python-docx` | Creating reports, heading hierarchies, styled tables, bullet lists. |
| **PowerPoint (`.pptx`)** | `python-pptx` | Generating slide decks, presentation outlines, shape layout. |
| **PDF (`.pdf`)** | `pypdf` / `pdfplumber` | Extracting raw text, table extraction, splitting/merging pages. |

### Node.js Alternatives
| Format | Package | Primary Use Case |
| :--- | :--- | :--- |
| **Excel (`.xlsx`)** | `exceljs` | Streaming large datasets, cell styling, data validation. |
| **Word (`.docx`)** | `docx` | Declarative document generation with tables, headers, and footers. |
| **PDF (`.pdf`)** | `pdf-parse` / `pdf-lib` | Text extraction, page manipulation, PDF form filling. |

---

## 3. Formatting & Generation Invariants

1. **Intention-Revealing Layout**:
   - Word/PDF documents must maintain a clear semantic hierarchy: Title (`H1`) > Major Sections (`H2`) > Subsections (`H3`).
   - Use dedicated table headers with alternating row fills or crisp borders for readability.
2. **Formula Integrity in Spreadsheets**:
   - Write UPPERCASE formula names (`=SUM(A1:A10)`, `=AVERAGE(B2:B50)`, `=VLOOKUP(...)`).
   - Explicitly format currency, percentages, and dates with localized cell number formats (never store currency as unformatted plain floats).
3. **Data Sanitization**:
   - Strip document metadata (author names, revisions, company tags) before publishing or committing generated office files.
   - Avoid hardcoding absolute file paths into document footers or links.
