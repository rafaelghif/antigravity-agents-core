#!/usr/bin/env python3
"""
Reference implementation for generating a formatted Excel spreadsheet and Word document.
Demonstrates table formatting, formula usage, auto-fitting column widths, and clean exports.

Usage:
    python examples/generate-report.py
"""

import os
import sys

def generate_excel_report(output_path):
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Sprint Metrics"

        # Title Block
        ws.merge_cells("A1:D1")
        ws["A1"] = "Engineering Sprint Metrics Report"
        ws["A1"].font = Font(size=14, bold=True, color="FFFFFF")
        ws["A1"].fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[1].height = 30

        # Headers
        headers = ["Ticket ID", "Title", "Story Points", "Status"]
        ws.append([]) # row 2 empty
        ws.append(headers) # row 3
        ws.row_dimensions[3].height = 22

        header_fill = PatternFill(start_color="3B82F6", end_color="3B82F6", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF")
        thin_border = Border(
            left=Side(style='thin', color='CBD5E1'),
            right=Side(style='thin', color='CBD5E1'),
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='thin', color='CBD5E1')
        )

        for col_idx in range(1, 5):
            cell = ws.cell(row=3, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border

        # Sample Data
        data = [
            ["TCK-101", "Implement browser automation skill", 5, "Completed"],
            ["TCK-102", "Configure Office docs processing pipeline", 3, "Completed"],
            ["TCK-103", "Audit and update test suite catalog", 2, "In Review"],
            ["TCK-104", "Integrate multimodal document validation", 5, "Ready"],
        ]

        for r_idx, row in enumerate(data, start=4):
            ws.append(row)
            for c_idx in range(1, 5):
                cell = ws.cell(row=r_idx, column=c_idx)
                cell.border = thin_border
                if c_idx == 3:
                    cell.alignment = Alignment(horizontal="right")

        # Total Points Row
        total_row = len(data) + 4
        ws.cell(row=total_row, column=2, value="Total Points").font = Font(bold=True)
        total_cell = ws.cell(row=total_row, column=3, value=f"=SUM(C4:C{total_row-1})")
        total_cell.font = Font(bold=True)
        total_cell.border = thin_border

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        wb.save(output_path)
        print(f"✔ Excel report generated at: {output_path}")
    except ImportError:
        print("Note: openpyxl not installed. Install via: pip install openpyxl", file=sys.stderr)

if __name__ == '__main__':
    out = os.path.join('.scratch', 'sprint-report.xlsx')
    generate_excel_report(out)
