#!/usr/bin/env python3
"""
Apply ToolHeader to all tool pages for F16 fix.
"""
import os
import re

TOOLS_DIR = r"C:\Dev\my-first-app\app/(app)/tools"

# Tool name mappings
TOOL_NAMES = {
    "adult-arrest": ("Adult Medical Cardiac Arrest", "CPG 2.1"),
    "witnessed-adult-arrest": ("Adult Cardiac Arrest (Witnessed)", "CPG 2.1"),
    "peds-arrest": ("Paediatric Arrest (WAAFELSS)", "CPG 2.3"),
    "peds-arrest-algorithm": ("Paediatric Arrest (WAAFELSS)", "CPG 2.3"),
    "peds-medical-arrest": ("Paediatric Medical Cardiac Arrest", "CPG 2.3"),
    "rass": ("Sedation Assessment (RASS)", "CPG 3.1"),
    "gcs": ("Glasgow Coma Scale (Adult + Paeds)", "Neuro assessment"),
    "race": ("RACE Scale (Stroke LVO)", "CPG 3.1"),
    "stroke": ("Stroke BEFAST", "CPG Stroke"),
    "mwcs": ("MWCS - Croup", "CPG Croup"),
    "asthma": ("Asthma Severity (Adult + Paeds)", "CPG Asthma"),
    "rsi-meds": ("RSI Medications", "CPG 11.1"),
    "ecmo-criteria": ("ECMO / ECPR Criteria", "CPG ECMO / ECPR"),
    "rosc": ("Post-Cardiac Arrest (ROSC) Care", "CPG 2.6"),
    "trauma-bypass": ("Trauma Bypass Criteria", "CPG 10.10"),
    "burns": ("Burn Surface Area Calculator", "CPG 10.9"),
    "toxicology": ("Toxidrome Finder", "CPG 8.x Toxicology"),
    "toxidrome": ("Toxidrome Flow Guide", "CPG 8.x"),
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
    
    tool_name = os.path.splitext(os.path.basename(filepath))[0]
    title, meta = TOOL_NAMES.get(tool_name, (tool_name.replace('-', ' ').title(), ''))
    
    if 'ToolHeader' in content:
        return True, "Already has ToolHeader"
    
    # Step 1: Add ToolHeader import
    if 'import { ToolHeader }' not in content:
        content = content.replace(
            'import { useState } from "react";',
            'import { useState } from "react";\nimport { ToolHeader } from "@/app/_components/ToolHeader";',
            1
        )
    
    # Step 2: Replace the header section
    # We need to find the header section and replace it with ToolHeader
    
    # Common patterns for headers in tool pages:
    # 1. Header with back button (uses Link)
    # 2. Header with back link (text link)
    # 3. Header with eyebrow and h1
    
    # Let's use a more targeted approach for each pattern
    
    # Pattern: Header with back button (adult-arrest pattern)
    # This pattern has: <Link ...>...</Link>, <div className="flex-1...">, <p...>, <h1...>
    
    # Pattern: Header with back text link (sepsis pattern)
    # ...
    
    # For now, let's just add the import and note that the header replacement
    # needs to be done manually for each page.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True, "Processed"

# Process all pages
count = 0
for root, dirs, files in os.walk(TOOLS_DIR):
    for f in sorted(files):
        if f == "page.tsx":
            filepath = os.path.join(root, f)
            process_file(filepath)
            count += 1

print(f"Processed {count} files")
