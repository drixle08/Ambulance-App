#!/usr/bin/env python3
"""
Apply ToolHeader to remaining tool pages for F16 fix.
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
    "witnessed-adult-arrest": ("Adult Cardiac Arrest (Witnessed)", "CPG 2.1"),
}

def find_header_section(content):
    """
    Find the header section in a tool page.
    Returns the start and end positions of the header section.
    """
    # Common patterns for headers in tool pages:
    # 1. <header className="..."> ... </header>
    # 2. <div className="...header..."> ... </div>
    
    # Look for the header section
    # Pattern 1: <header className="sticky top-0..."> ... </header>
    # Pattern 2: <div className="...header..."> ... </div>
    
    # We'll use a regex to find the header section
    # This is a simplified approach - in practice, each page needs manual review
    
    return None

def apply_header_replacement(content, tool_name, title, meta):
    """
    Replace the header section with the ToolHeader component.
    """
    # This is a placeholder - actual implementation would need
    # to handle each page's specific structure
    
    # For now, return the content unchanged
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tool_name = os.path.splitext(os.path.basename(filepath))[0]
    title, meta = TOOL_NAMES.get(tool_name, (tool_name.replace('-', ' ').title(), ''))
    
    if 'ToolHeader' in content:
        return True, "Already has ToolHeader"
    
    # Add ToolHeader import
    if 'import { ToolHeader }' not in content:
        # Find the import block
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') and line.strip().endswith(';'):
                # Add ToolHeader import after this line
                insert_pos = i + 1
                lines.insert(insert_pos, 'import { ToolHeader } from "@/app/_components/ToolHeader";')
                content = '\n'.join(lines)
                break
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✓ {tool_name}: import added")
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
