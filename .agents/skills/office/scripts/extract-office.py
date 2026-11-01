#!/usr/bin/env python3
"""
Antigravity Office Document Extractor & Inspector
Extracts structured text, tables, and sheet names from Office (.docx, .xlsx, .pptx, .csv) and PDF files.

Usage:
    python scripts/extract-office.py <path-to-document> [output-path]
"""

import os
import sys
import json
import csv
import zipfile
import xml.etree.ElementTree as ET

def extract_csv(path):
    rows = []
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        for row in reader:
            rows.append(row)
    return {"format": "csv", "total_rows": len(rows), "data": rows[:50]}

def extract_docx(path):
    try:
        import docx
        doc = docx.Document(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        tables = []
        for table in doc.tables:
            table_data = []
            for row in table.rows:
                table_data.append([cell.text.strip() for cell in row.cells])
            tables.append(table_data)
        return {"format": "docx", "paragraphs": paragraphs, "tables": tables}
    except ImportError:
        # Zero-dependency XML fallback via zipfile
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            texts = [node.text for node in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            return {"format": "docx", "note": "Extracted via fallback XML parser", "text": " ".join(texts)}

def extract_xlsx(path):
    try:
        import openpyxl
        wb = openpyxl.load_workbook(path, data_only=True)
        sheets = {}
        for name in wb.sheetnames:
            ws = wb[name]
            sheet_rows = []
            for row in ws.iter_rows(values_only=True):
                if any(row):
                    sheet_rows.append(list(row))
            sheets[name] = {"rows": len(sheet_rows), "sample": sheet_rows[:25]}
        return {"format": "xlsx", "sheets": sheets}
    except ImportError:
        with zipfile.ZipFile(path) as z:
            sheet_names = [n for n in z.namelist() if n.startswith('xl/worksheets/sheet')]
            return {"format": "xlsx", "note": "Extracted via fallback XML parser", "sheet_count": len(sheet_names)}

def extract_pdf(path):
    try:
        import pypdf
        reader = pypdf.PdfReader(path)
        text_pages = []
        for i, page in enumerate(reader.pages):
            text_pages.append(f"--- Page {i+1} ---\n" + (page.extract_text() or ''))
        return {"format": "pdf", "total_pages": len(reader.pages), "content": "\n".join(text_pages[:10])}
    except ImportError:
        return {"format": "pdf", "note": "pypdf not installed. Read natively via Antigravity read_file or attach to composer."}

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract-office.py <path-to-document> [output-path]")
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.csv':
        result = extract_csv(file_path)
    elif ext == '.docx':
        result = extract_docx(file_path)
    elif ext in ('.xlsx', '.xlsm'):
        result = extract_xlsx(file_path)
    elif ext == '.pdf':
        result = extract_pdf(file_path)
    else:
        result = {"format": "unsupported", "error": f"Unsupported file extension: {ext}"}

    output = json.dumps(result, indent=2, ensure_ascii=False)
    if len(sys.argv) >= 3:
        with open(sys.argv[2], 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Extraction saved to: {sys.argv[2]}")
    else:
        print(output)

if __name__ == '__main__':
    main()
