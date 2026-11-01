# Document Conversion & Pipeline Reference

Operational procedures for converting, extracting, and rendering between Markdown, Office formats, and PDFs.

---

## 1. Markdown to Word (`.docx`) & PDF

When exporting engineering reports, sprint summaries, or architecture specifications to client-facing documents:

### Markdown to DOCX via Pandoc
If `pandoc` is available in the environment:
```bash
pandoc specs/my-spec.md -o .scratch/my-spec.docx --toc
```

### Python-Based Generation
When `pandoc` is unavailable, use `python-docx` to construct formatted Word documents programmatically (see [examples/generate-report.py](../examples/generate-report.py)).

---

## 2. Spreadsheet Conversions (CSV ↔ XLSX)

### Converting CSV / JSON to Formatted XLSX
Plain CSVs lack formatting and formula support. Convert raw metrics or query exports into styled Excel workbooks:
1. Load data via `pandas` or `openpyxl`.
2. Apply header styles (bold, background fill, frozen header row).
3. Auto-fit column widths to prevent truncated cell values:
   ```python
   for col in ws.columns:
       max_len = max(len(str(cell.value or '')) for cell in col)
       col_letter = col[0].column_letter
       ws.column_dimensions[col_letter].width = max(max_len + 3, 10)
   ```
4. Save workbook to `.scratch/` or project output directories.

---

## 3. PDF Extraction Pipeline

1. **Native Antigravity Ingestion**:
   - For small/medium PDFs (< 50 pages), read natively via Antigravity `read_file` or composer attachment.
2. **Programmatic Extraction**:
   - For massive PDFs or batch extraction, use [scripts/extract-office.py](../scripts/extract-office.py) to output structured text and tables.
