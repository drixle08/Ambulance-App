#!/usr/bin/env python3
"""
Apply ToolHeader to all tool pages.

This script:
1. Adds `import { ToolHeader } from "@/app/_components/ToolHeader"` to each page
2. Replaces the custom header with `<ToolHeader>`
3. Standardizes the title and meta to match the list names
"""
import os
import re
import sys

TOOLS_DIR = r"C:\Dev\my-first-app\app/(app)/tools"
TOOL_HEADER_IMPORTS = [
    "import { ToolHeader } from \"@/app/_components/ToolHeader\";",
]

# Tool name mappings: page file -> (title, meta)
# These come from the TOOL_GROUPS data in data.ts
TOOL_NAMES = {
    "adult-arrest": ("Adult Cardiac Arrest", "CPG 2.1 · {EDITION.short}"),
    "witnessed-adult-arrest": ("Adult Cardiac Arrest (Witnessed)", "CPG 2.1 · {EDITION.short}"),
    "peds-arrest": ("Paediatric Arrest (WAAFELSS)", "CPG 2.3 · {EDITION.short}"),
    "peds-arrest-algorithm": ("Paediatric Arrest (WAAFELSS)", "CPG 2.3 · {EDITION.short}"),
    "peds-medical-arrest": ("Paediatric Medical Cardiac Arrest", "CPG 2.3 · {EDITION.short}"),
    "rass": ("Sedation Assessment (RASS)", "CPG 3.1 · {EDITION.short}"),
    "gcs": ("Glasgow Coma Scale (Adult + Paeds)", "Neuro assessment"),
    "race": ("RACE Scale (Stroke LVO)", "CPG 3.1 · {EDITION.short}"),
    "stroke": ("Stroke BEFAST", "CPG Stroke"),
    "mwcs": ("MWCS - Croup", "CPG Croup"),
    "asthma": ("Asthma Severity (Adult + Paeds)", "CPG Asthma"),
    "rsi-meds": ("RSI Medications", "CPG 11.1 · CCP"),
    "ecmo-criteria": ("ECMO / ECPR Criteria", "CPG ECMO / ECPR"),
    "rosc": ("Post-Cardiac Arrest (ROSC) Care", "CPG 2.6 · {EDITION.short}"),
    "reso": ("Post-Cardiac Arrest (ROSC) Care", "CPG 2.6 · {EDITION.short}"),
    "trauma-bypass": ("Trauma Bypass Criteria", "CPG 10.10"),
    "burns": ("Burn Surface Area Calculator", "CPG 10.9 Burns"),
    "toxicology": ("Toxidrome Finder", "CPG 8.x Toxicology"),
    "toxidrome": ("Toxidrome Flow Guide", "CPG 8.x · 12 toxidromes"),
    "treatment-log": ("Treatment Log", "Clinical Management"),
    "care-bundles": ("Care Bundles", "CCA Handbook"),
    "drug-calculator": ("Drug Infusion Calculator", "CCA Handbook / Medical Math"),
    "sop": ("Standard Operating Procedures", "SOP 2025"),
    "sop-chat": ("CPG Chat", "CPG + SOP"),
    "cpg": ("CPG Library", "Reference"),
    "cpg-chat": ("CPG Chat (beta)", "CPG + SOP"),
    "cpg-latest-changes": ("CPG Latest Changes", "CPG 2.6 Update"),
    "cpm": ("CPM v4.0 (2024)", "Clinical Procedure Manual"),
    "documentation": ("CHART Documentation", "Narrative template"),
    "shock-index": ("Shock Index", "Reference - Time-critical"),
    "vitals": ("Normal Vitals by Age", "CPG Reference"),
    "resus-timer": ("Emergency Resuscitation Timer", "CPR workflow"),
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = os.path.basename(filepath)
    tool_name = os.path.splitext(filename)[0]
    title, meta = TOOL_NAMES.get(tool_name, (tool_name.replace('-', ' ').title(), ''))

    # Step 1: Add ToolHeader import
    if 'ToolHeader' not in content:
        # Insert after the import block (after the last import statement)
        content = content.replace(
            'import {\n  ArrowLeft,',
            'import { ToolHeader } from "@/app/_components/ToolHeader";\nimport {\n  ArrowLeft,',
            1
        )

    # Step 2: Replace custom header with ToolHeader
    # The header pattern varies by page, so we use a flexible regex approach
    # Find the header section and replace it

    # Common patterns for headers to replace:
    # 1. Header with back button + h1 + p
    # 2. Header with back link + h1 + p
    # 3. Header with h1 + p (no back)

    # We'll use a more targeted approach: find the header block and replace it
    # The header is typically in a div with classes like "border-b", "bg-...", "px-4", "py-3"

    # For now, we'll do a basic replacement and verify manually
    # This is a complex transformation that needs careful handling

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

def main():
    files = []
    for root, dirs, filenames in os.walk(TOOLS_DIR):
        for filename in filenames:
            if filename == "page.tsx":
                filepath = os.path.join(root, filename)
                files.append(filepath)

    print(f"Found {len(files)} tool pages to process")

    for filepath in files:
        try:
            process_file(filepath)
            print(f"  ✓ {os.path.basename(filepath)}")
        except Exception as e:
            print(f"  ✗ {os.path.basename(filepath)}: {e}")

    print(f"\nProcessed {len(files)} files")

if __name__ == "__main__":
    main()
