#!/usr/bin/env python3
"""
Apply ToolHeader to all remaining tool pages for F16 fix.
"""
import os
import re
import sys

TOOLS_DIR = r"C:\Dev\my-first-app\app/(app)/tools"

# Tool name mappings (tool file -> (title, meta))
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
    "witnessed-adult-arrest": ("Adult Cardiac Arrest (Witnessed)", "CPG 2.1"),
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
        # Find the first import statement and add ToolHeader after it
        # Look for the last import line
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                # Check if this is an import statement
                if line.strip().startswith('import ') and line.strip().endswith(';'):
                    # Find the closing parenthesis
                    paren_count = 0
                    in_single = False
                    in_double = False
                    for j, ch in enumerate(line):
                        if ch == "'" and not in_double:
                            in_single = not in_single
                        elif ch == '"' and not in_single:
                            in_double = not in_double
                        elif ch == '(' and not in_single and not in_double:
                            paren_count += 1
                        elif ch == ')' and not in_single and not in_double:
                            paren_count -= 1
                        if paren_count == 0 and in_single is False and in_double is False:
                            # End of import statement
                            break
                    # Check if next line is empty
                    if i + 1 < len(lines) and lines[i + 1].strip() == '':
                        insert_pos = i + 2
                    else:
                        insert_pos = i + 1
                    content = content.replace(
                        lines[insert_pos - 1],
                        lines[insert_pos - 1] + '\nimport { ToolHeader } from "@/app/_components/ToolHeader";',
                        1
                    )
                    break
    
    # Step 2: Replace the header section
    # This is complex because each page has a different structure
    # We need to find the header section and replace it with ToolHeader
    
    # Let me handle the common patterns
    
    # Save the changes
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✓ {tool_name} (import added, manual header review needed)")
    return True, "Processed"

# Process all remaining pages
remaining_pages = [
    "burns",
    "cpg",
    "cpg-chat",
    "cpg-latest-changes",
    "cpm",
    "documentation",
    "ecmo-criteria",
    "resus-timer",
    "shock-index",
    "sop",
    "sop-chat",
    "toxicology",
    "toxidrome",
    "treatment-log",
]

for tool_name in remaining_pages:
    filepath = os.path.join(TOOLS_DIR, tool_name, "page.tsx")
    if os.path.exists(filepath):
        process_file(filepath)
    else:
        print(f"  ✗ {tool_name}: file not found")

print("\nDone!")
