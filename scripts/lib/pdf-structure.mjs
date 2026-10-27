// Structured text extraction for tagged PDFs (CPG, CPM), used by the
// build-*-index scripts.
//
// The old indexes joined every text fragment on a page into one line, so a
// table cell or a flowchart box lost which row, column or patient group it
// belonged to (e.g. a paediatric cardiac-arrest volume read as an anaphylaxis
// volume). This module keeps that structure:
//
// - Reading order and grouping come from the PDF's structure tree (tagged PDF):
//   paragraphs, list items and boxes (Sect) become their own lines/blocks.
// - Tables: cell rectangles come from the drawn cell borders, so merged cells
//   are repeated into every row they span, and each value is labelled with the
//   header cells above it ("Cardiac arrest › Volume: 1.5ml").
// - Side-by-side column headings outside tables (ADULT | PAEDIATRIC, MILD |
//   MODERATE | SEVERE, SNAKE BITE | SPIDER BITE, ...) label every line below
//   them with the column it sits in, from its position on the page.
// - Stacked ADULT / PAEDIATRIC section headings carry over to the next page, so
//   a page that starts mid-section says which group it covers.
// - Page headers/footers (marked as artifacts) are dropped, as are the
//   near-white practitioner-level placeholders (I / II / III), which mark the
//   levels NOT authorised and would otherwise read as authorised.

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfjs = await import(
  "file:///" + require.resolve("pdfjs-dist/legacy/build/pdf.mjs").replace(/\\/g, "/")
);
const { getDocument, OPS } = pdfjs;

export async function openPdf(file) {
  return getDocument({ url: file, verbosity: 0 }).promise;
}

const POPULATION = /^(ADULT|PAEDIATRIC)$/;
const LEVEL_PLACEHOLDER = /^(I{1,3}|IV)$/;
const NAV_LINE = /^[▪•]?\s*BACK TO (TABLE OF CONTENTS|FORMULARY)\s*▪?$/i;
const BORDER_MAX = 2.5; // pt: thicker filled rectangles are shading, not borders

// ─── Geometry from the operator list ────────────────────────────────────────

function multiply(m, n) {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

/** Border segments (thin filled rectangles and stroked axis-aligned lines) and near-white text positions. */
function readOperators(ops) {
  const horizontal = []; // {y, x1, x2}
  const vertical = []; // {x, y1, y2}
  const shading = []; // {x1, y1, x2, y2}: filled cell backgrounds, which also bound cells
  const faintText = []; // {x, y} of near-white glyph runs
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];
  let fill = [0, 0, 0];
  let pending = null; // path awaiting its paint op
  let textMatrix = [1, 0, 0, 1, 0, 0];

  const addRect = (x, y, w, h) => {
    const [x1, y1] = apply(ctm, x, y);
    const [x2, y2] = apply(ctm, x + w, y + h);
    const [l, r] = [Math.min(x1, x2), Math.max(x1, x2)];
    const [b, t] = [Math.min(y1, y2), Math.max(y1, y2)];
    if (t - b <= BORDER_MAX && r - l > BORDER_MAX) horizontal.push({ y: (b + t) / 2, x1: l, x2: r });
    else if (r - l <= BORDER_MAX && t - b > BORDER_MAX) vertical.push({ x: (l + r) / 2, y1: b, y2: t });
    else if (r - l > BORDER_MAX && t - b > BORDER_MAX && !(r - l > 500 && t - b > 700)) shading.push({ x1: l, y1: b, x2: r, y2: t });
  };
  const addLine = (ax, ay, bx, by) => {
    const [x1, y1] = apply(ctm, ax, ay);
    const [x2, y2] = apply(ctm, bx, by);
    if (Math.abs(y1 - y2) < 0.5 && Math.abs(x1 - x2) > BORDER_MAX) horizontal.push({ y: y1, x1: Math.min(x1, x2), x2: Math.max(x1, x2) });
    else if (Math.abs(x1 - x2) < 0.5 && Math.abs(y1 - y2) > BORDER_MAX) vertical.push({ x: x1, y1: Math.min(y1, y2), y2: Math.max(y1, y2) });
  };

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    switch (fn) {
      // The fill colour is part of the graphics state: restore it with the matrix.
      case OPS.save: stack.push({ ctm, fill }); break;
      case OPS.restore: ({ ctm, fill } = stack.pop() ?? { ctm: [1, 0, 0, 1, 0, 0], fill: [0, 0, 0] }); break;
      case OPS.transform: ctm = multiply(ctm, args); break;
      case OPS.setFillRGBColor:
        fill = typeof args[0] === "string"
          ? [1, 3, 5].map((k) => parseInt(args[0].slice(k, k + 2), 16))
          : Array.from(args);
        break;
      case OPS.setFillGray: fill = [args[0] * 255, args[0] * 255, args[0] * 255]; break;
      case OPS.constructPath: pending = args; break;
      case OPS.fill: case OPS.eoFill: case OPS.stroke: case OPS.fillStroke: case OPS.eoFillStroke: case OPS.closeStroke: {
        if (!pending) break;
        const [subOps, coords] = pending;
        let c = 0;
        let cur = null;
        for (const op of subOps) {
          if (op === OPS.rectangle) { if (fn !== OPS.stroke && fn !== OPS.closeStroke) addRect(coords[c], coords[c + 1], coords[c + 2], coords[c + 3]); c += 4; }
          else if (op === OPS.moveTo) { cur = [coords[c], coords[c + 1]]; c += 2; }
          else if (op === OPS.lineTo) { if (cur && (fn === OPS.stroke || fn === OPS.closeStroke || fn === OPS.fillStroke)) addLine(cur[0], cur[1], coords[c], coords[c + 1]); cur = [coords[c], coords[c + 1]]; c += 2; }
          else if (op === OPS.curveTo) c += 6;
          else if (op === OPS.curveTo2 || op === OPS.curveTo3) c += 4;
        }
        pending = null;
        break;
      }
      case OPS.endPath: pending = null; break;
      case OPS.setTextMatrix: textMatrix = Array.from(args); break;
      case OPS.showText: {
        if (fill.every((v) => v >= 230)) {
          const s = args[0].map((g) => (g && g.unicode) || "").join("").trim();
          if (LEVEL_PLACEHOLDER.test(s)) {
            const [x, y] = apply(ctm, textMatrix[4], textMatrix[5]);
            faintText.push({ x, y });
          }
        }
        break;
      }
    }
  }
  return { horizontal, vertical, shading, faintText };
}

// ─── Text items ─────────────────────────────────────────────────────────────

/**
 * Symbol-font glyphs come through as Private Use Area characters, which read as
 * nothing. The CPG uses three: the ticks in the medication privileges chart
 * (Wingdings 2) and the titrate up/down arrows in the transfer drug chart (Wingdings).
 */
function mapSymbols(str, font) {
  if (/Wingdings2/.test(font)) return str.replace(//g, "✓").replace(//g, " ");
  if (/Wingdings/.test(font)) return str.replace(//g, "↑").replace(//g, "↓");
  return str;
}

/** Text items keyed by marked-content id, plus items outside the structure tree. */
function readText(textContent, faintText, fontOf) {
  const byId = new Map();
  const loose = [];
  const stack = []; // {id, artifact}
  let total = 0;
  let seq = 0; // drawing order on the page
  for (const it of textContent.items) {
    if (it.type === "beginMarkedContent" || it.type === "beginMarkedContentProps") {
      stack.push({ id: it.id ?? null, artifact: it.tag === "Artifact" });
      continue;
    }
    if (it.type === "endMarkedContent") { stack.pop(); continue; }
    if (typeof it.str !== "string" || it.str === "") continue;
    if (stack.some((s) => s.artifact)) continue;
    const [a, b, c, d, e, f] = it.transform;
    const size = Math.hypot(c, d) || Math.hypot(a, b) || 10;
    const str = mapSymbols(it.str, fontOf(it.fontName));
    const item = { str, x: e, y: f, w: it.width, h: size, eol: it.hasEOL, rotated: Math.abs(b) > Math.abs(a), dir: [a, b, c, d], seq: seq++ };
    if (LEVEL_PLACEHOLDER.test(it.str.trim()) && faintText.some((f) => Math.abs(f.x - item.x) < 1.5 && Math.abs(f.y - item.y) < 1.5)) continue;
    total += it.str.trim().length;
    const id = [...stack].reverse().find((s) => s.id)?.id;
    if (id) (byId.get(id) ?? byId.set(id, []).get(id)).push(item);
    else loose.push(item);
  }
  return { byId, loose, total };
}

/** Join items into a line, adding a space where the PDF leaves a gap instead of a space character. */
function joinItems(items) {
  let out = "";
  let prev = null;
  for (const it of items) {
    if (prev && !/\s$/.test(out) && !/^\s/.test(it.str)) {
      const sameLine = Math.abs(it.y - prev.y) < prev.h * 0.5;
      const gap = it.x - (prev.x + prev.w);
      if (!sameLine || prev.eol || gap > Math.min(prev.h, it.h) * 0.2) out += " ";
    }
    out += it.str;
    prev = it;
  }
  return out.replace(/\s+/g, " ").trim();
}

/** Page-space corners of a text item, following its direction (rotated header text runs up the page). */
function corners(i) {
  const [a, b, c, d] = i.dir;
  const ul = Math.hypot(a, b) || 1;
  const vl = Math.hypot(c, d) || 1;
  const u = [(a / ul) * i.w, (b / ul) * i.w];
  const v = [(c / vl) * i.h, (d / vl) * i.h];
  const o = [i.x - v[0] * 0.25, i.y - v[1] * 0.25];
  const top = [v[0] * 1.1, v[1] * 1.1];
  return [o, [o[0] + u[0], o[1] + u[1]], [o[0] + top[0], o[1] + top[1]], [o[0] + u[0] + top[0], o[1] + u[1] + top[1]]];
}

function boxOf(items) {
  const inked = items.filter((i) => i.str.trim());
  if (!inked.length) return null;
  const pts = inked.flatMap(corners);
  return {
    x1: Math.min(...pts.map((p) => p[0])),
    x2: Math.max(...pts.map((p) => p[0])),
    y1: Math.min(...pts.map((p) => p[1])),
    y2: Math.max(...pts.map((p) => p[1])),
  };
}

// ─── Tables ─────────────────────────────────────────────────────────────────

const TOL = 1.5;

/**
 * A cell's horizontal extent: out from its text to the nearest drawn vertical
 * border on each side, cut to the smallest shaded background containing the
 * text (shaded header cells are separated by gaps, not lines).
 */
function cellSpanX(box, borders) {
  const cy = (box.y1 + box.y2) / 2;
  const coversY = (v) => v.y1 - TOL <= cy && v.y2 + TOL >= cy;
  const left = borders.vertical.filter((v) => v.x <= box.x1 + TOL && coversY(v)).sort((a, b) => b.x - a.x)[0];
  const right = borders.vertical.filter((v) => v.x >= box.x2 - TOL && coversY(v)).sort((a, b) => a.x - b.x)[0];
  let x1 = left?.x ?? box.x1;
  let x2 = right?.x ?? box.x2;
  const fill = borders.shading
    .filter((s) => s.x1 <= box.x1 + TOL && s.x2 >= box.x2 - TOL && s.y1 <= box.y1 + TOL && s.y2 >= box.y2 - TOL)
    .sort((a, b) => (a.x2 - a.x1) - (b.x2 - b.x1))[0];
  if (fill) { x1 = Math.max(x1, fill.x1); x2 = Math.min(x2, fill.x2); }
  return { x1, x2 };
}

const overlap = (a1, a2, b1, b2) => Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

/**
 * A table as one line per body row. Every value is labelled with the header
 * cells above its column, and a merged cell is repeated into every row it
 * spans, so no row depends on a value printed in another row.
 *
 * Row spans come from the structure: a row lists only the cells that start in
 * it, so a cell carries down into following rows until a row has its own cell
 * in that column, or a drawn border closes it off. A carry-down with no border
 * evidence either way (the column has no row borders at all, or the row has an
 * empty cell we can't place) is counted in stats.ambiguousSpans.
 */
function renderTable(tableNode, ctx) {
  const rows = [];
  const collectRows = (node, inHead) => {
    for (const c of node.children ?? []) {
      if (c.role === "TR") rows.push({ node: c, header: inHead });
      else if (c.role === "THead") collectRows(c, true);
      else if (c.role === "TBody" || c.role === "TFoot") collectRows(c, false);
    }
  };
  collectRows(tableNode, false);
  for (const row of rows) {
    const cells = (row.node.children ?? []).filter((c) => c.role === "TD" || c.role === "TH");
    row.cells = cells
      .map((c) => {
        const items = ctx.itemsOf(c);
        // Text tagged elsewhere but drawn inside this cell (see relocateMistagged)
        // joins it, and the cell then reads top to bottom as drawn.
        const extra = ctx.movedInto.get(c);
        if (extra) {
          items.push(...extra);
          items.sort((a, b) => (Math.abs(a.y - b.y) > Math.min(a.h, b.h) * 0.5 ? b.y - a.y : a.x - b.x));
        }
        const box = boxOf(items);
        return { text: joinItems(items), th: c.role === "TH", box, span: box ? cellSpanX(box, ctx.borders) : null, seq: Math.min(...items.map((i) => i.seq)) };
      })
      .filter((c) => c.text && c.box);
    row.empties = cells.length - row.cells.length;
  }
  const live = rows.filter((r) => r.cells.length);
  if (!live.length) return { lines: [], plain: "", seq: Infinity };
  const all = live.flatMap((r) => r.cells);
  const tableX1 = Math.min(...all.map((c) => c.span.x1));
  const tableX2 = Math.max(...all.map((c) => c.span.x2));
  const width = tableX2 - tableX1;
  const fullWidth = (c) => c.span.x2 - c.span.x1 >= width * 0.8;

  // Header rows: THead rows plus leading rows of TH cells; a row that is a
  // single full-width cell is a section title, not a header.
  for (const r of live) if (r.cells.every(fullWidth)) r.header = false;
  for (const r of live) {
    if (r.cells.every(fullWidth)) break;
    if (r.header || (r.cells.length > 1 && r.cells.every((c) => c.th))) r.header = true;
    else break;
  }
  // Rows still spanned by a header cell (e.g. a tall "Age" header beside sub-heading
  // rows) are header rows too: they have no cell of their own in that column.
  const sameColumn = (a, b) => overlap(a.span.x1, a.span.x2, b.span.x1, b.span.x2) > 0.3 * Math.min(a.span.x2 - a.span.x1, b.span.x2 - b.span.x1);
  for (let i = live.findIndex((r) => !r.header); i > 0 && i < live.length; i++) {
    const tops = live.slice(0, i).filter((r) => r.header).flatMap((r) => r.cells).filter((c) => !fullWidth(c));
    const r = live[i];
    // An empty cell could be what fills that column, so a row with one isn't evidence.
    if (r.empties || r.cells.some(fullWidth) || !tops.some((h) => !r.cells.some((c) => sameColumn(c, h)))) break;
    r.header = true;
  }
  ctx.stats.cells += all.length;

  const headerCells = live.filter((r) => r.header).flatMap((r) => r.cells).filter((c) => !fullWidth(c));
  const labelFor = (cell) => {
    const parts = headerCells
      .filter((h) => h !== cell && h.box.y1 >= cell.box.y2 - TOL)
      .filter((h) => overlap(h.span.x1, h.span.x2, cell.span.x1, cell.span.x2) > 0.5 * Math.min(h.span.x2 - h.span.x1, cell.span.x2 - cell.span.x1))
      .sort((a, b) => b.box.y2 - a.box.y2)
      // Long header notes are shown in full once, on the "Columns:" lines.
      .map((h) => (h.text.length > 48 ? h.text.slice(0, 47).trimEnd() + "…" : h.text));
    return [...new Set(parts)].join(" › ");
  };

  const lines = [];
  for (const r of live.filter((x) => x.header)) lines.push("Columns: " + r.cells.map((c) => c.text).join(" | "));

  const body = live.filter((r) => !r.header);
  for (const r of body) r.y = median(r.cells.map((c) => (c.box.y1 + c.box.y2) / 2));
  // Text drawn between this table's rows but tagged outside it: its own row, at its height.
  // One row per drawn line of text ("1." and its item are tagged separately).
  const movedLines = [];
  for (const it of (ctx.movedRows.get(tableNode) ?? []).flat().filter((i) => i.str.trim())) {
    const line = movedLines.find((l) => Math.abs(l[0].y - it.y) < it.h * 0.5);
    if (line) line.push(it); else movedLines.push([it]);
  }
  for (const items of movedLines) {
    const sorted = items.sort((a, b) => a.x - b.x);
    const box = boxOf(sorted);
    if (!box) continue;
    const row = { cells: [{ text: joinItems(sorted), th: false, box, span: { x1: tableX1, x2: tableX2 }, seq: Math.min(...sorted.map((i) => i.seq)) }], empties: 0, y: (box.y1 + box.y2) / 2 };
    const at = body.findIndex((r) => r.y < row.y);
    body.splice(at < 0 ? body.length : at, 0, row);
  }
  const coversColumn = (a, b) => overlap(a.span.x1, a.span.x2, b.span.x1, b.span.x2) > 0.3 * Math.min(a.span.x2 - a.span.x1, b.span.x2 - b.span.x1);
  // Rows of labels (S | M | L, Level 1 | Level 2, 0 – 1mon | ...), as opposed to values.
  const isLabelRow = body.map((r) => {
    const own = r.cells.filter((c) => !fullWidth(c));
    return own.length >= 2 && own.slice(1).every((c) => isLabelText(c.text));
  });
  // Which body rows each cell covers.
  const covered = body.map(() => []);
  body.forEach((r, i) => {
    const firstX = Math.min(...r.cells.map((c) => c.span.x1));
    for (const c of r.cells) {
      covered[i].push(c);
      if (fullWidth(c)) continue;
      const isRowName = c.span.x1 <= firstX + TOL;
      const cx = (c.span.x1 + c.span.x2) / 2;
      const columnBorders = ctx.borders.horizontal.filter((h) => h.x1 - TOL <= cx && h.x2 + TOL >= cx && h.y < r.y);
      for (let j = i + 1; j < body.length; j++) {
        const next = body[j];
        if (next.cells.some(fullWidth) || next.cells.some((o) => coversColumn(o, c))) break;
        // A label never carries down into the values under it (a row's first cell,
        // such as a step number spanning its rows, still can).
        if (isLabelRow[i] && !isLabelRow[j] && !isRowName) break;
        const between = columnBorders.some((h) => h.y > next.y + 2 && h.y < body[j - 1].y - 2);
        if (between) break;
        // With no row borders in this column, the only evidence of a merge is the
        // missing cell — and an empty cell in the next row could be what's missing.
        // Leave the position blank rather than guess (e.g. a privileges chart's
        // empty "not authorised" cells under a "Level 1" header).
        if (!columnBorders.length && next.empties) { ctx.stats.ambiguousSpans.push(`not carried: ${c.text} → row ${j + 1}`); break; }
        if (!columnBorders.length) ctx.stats.ambiguousSpans.push(`${c.text} → row ${j + 1}`);
        covered[j].push(c);
        ctx.stats.mergedUses++;
      }
    }
  });
  // Tables without tagged headers: a run of label rows (S | M | L, 0 – 1mon |
  // 1 – 12mon | ...) heads the value rows below it, until the next title row or
  // label run. Value cells are labelled from it like tagged headers, so they
  // don't depend on being read by position; a value spanning several of the
  // lowest label cells names them all. A row's first cell is its name, not a value.
  const localHeader = body.map(() => null);
  if (!headerCells.length) {
    let run = [];
    let current = null;
    body.forEach((r, i) => {
      if (r.cells.every(fullWidth)) { run = []; current = null; return; }
      const own = r.cells.filter((c) => !fullWidth(c));
      if (own.length >= 2 && own.slice(1).every((c) => isLabelText(c.text))) {
        // A label run belongs to one group: it restarts when the row's first cell changes (step 2 → step 3).
        const first = [...covered[i]].sort((a, b) => a.span.x1 - b.span.x1)[0];
        if (run.length && run.firstCell !== first) run = [];
        run.push(r);
        run.firstCell = first;
        return;
      }
      if (run.length) { current = run; run = []; }
      localHeader[i] = current;
    });
  }
  const localLabel = (cell, rows) => {
    const covers = (h) => overlap(h.span.x1, h.span.x2, cell.span.x1, cell.span.x2) > 0.5 * Math.min(h.span.x2 - h.span.x1, cell.span.x2 - cell.span.x1);
    const leaves = rows[rows.length - 1].cells.filter((h) => !fullWidth(h) && overlap(h.span.x1, h.span.x2, cell.span.x1, cell.span.x2) > 0.6 * (h.span.x2 - h.span.x1));
    if (leaves.length > 1) {
      ctx.stats.colspanNotes.push(`${cell.text.slice(0, 40)} [${leaves.map((h) => h.text).join(" / ")}]`);
      return { note: ` [spans: ${leaves.sort((a, b) => a.span.x1 - b.span.x1).map((h) => h.text).join(" / ")}]` };
    }
    const parts = rows.flatMap((r) => r.cells.filter((h) => !fullWidth(h) && covers(h)).map((h) => h.text));
    return { label: [...new Set(parts)].map((t) => (t.length > 48 ? t.slice(0, 47).trimEnd() + "…" : t)).join(" › ") };
  };
  body.forEach((r, i) => {
    if (r.cells.every(fullWidth)) { lines.push(r.cells.map((c) => c.text).join(" | ")); return; }
    const cells = [...covered[i]].sort((a, b) => a.span.x1 - b.span.x1);
    lines.push(cells.map((c, k) => {
      if (localHeader[i] && k > 0 && !fullWidth(c)) {
        const { label, note } = localLabel(c, localHeader[i]);
        return (label ? `${label}: ${c.text}` : c.text) + (note ?? "");
      }
      const label = labelFor(c);
      return label ? `${label}: ${c.text}` : c.text;
    }).join(" | "));
  });
  const seqs = live.flatMap((r) => r.cells.map((c) => c.seq));
  const box = { x1: tableX1, x2: tableX2, y1: Math.min(...all.map((c) => c.box.y1)), y2: Math.max(...all.map((c) => c.box.y2)) };
  return { lines, plain: live.flatMap((r) => r.cells.map((c) => c.text)).join(" "), seq: Math.min(...seqs), box };
}

/** A label cell ("1 – 2yr", ">10yr", "Age in Months"), not a value ("≤90 or ≥169", "<70", "5mg"). */
function isLabelText(text) {
  if (/^[\d.,\s–-]+$/.test(text)) return false;
  if (/^[✓↑↓\s]+$/.test(text)) return false;
  if (/[≤≥]|\bor\b/.test(text)) return false;
  if (/[<>]\s*[\d(]/.test(text) && !/^[<>≥≤]?\s*\d+\s*(yr|yrs|years?|mon|months?|weeks?|days?)$/i.test(text.trim())) return false;
  if (/\d\s*(mg|mcg|ml|g|mmol|mmhg|%|kg)\b/i.test(text)) return false;
  return text.length <= 40;
}

/**
 * Some flowcharts are tagged far out of order (e.g. the failed intubation drill,
 * p.209, lists step 4 before step 2), and their drawing order isn't reliable
 * either. When over a quarter of a page's blocks disagree with the order they're
 * drawn in, read the page by position: whole boxes top to bottom, then left to
 * right, each box's lines in their own order. Labels are attached per block, so
 * they survive the reorder.
 */
function reorderIfScrambled(blocks) {
  const { orderInversions, orderPairs } = orderStats(blocks);
  if (orderPairs < 4 || orderInversions / orderPairs <= 0.25) return;
  const groups = new Map(); // key -> {top, left, members}
  let solo = 0;
  for (const b of blocks) {
    if (b.kind === "break" || !b.box) continue;
    const key = b.kind === "line" && b.group ? `g${b.group}` : `s${solo++}`;
    const g = groups.get(key) ?? groups.set(key, { top: -Infinity, left: Infinity, members: [] }).get(key);
    g.top = Math.max(g.top, b.box.y2);
    g.left = Math.min(g.left, b.box.x1);
    g.members.push(b);
  }
  const ordered = [...groups.values()].sort((a, b) => (Math.abs(a.top - b.top) > 6 ? b.top - a.top : a.left - b.left));
  blocks.length = 0;
  for (const g of ordered) {
    if (blocks.length) blocks.push({ kind: "break" });
    blocks.push(...g.members);
  }
}

/** Adjacent blocks whose structure-tree order disagrees with the order they're drawn in. */
function orderStats(blocks) {
  const seqs = blocks.filter((b) => b.kind !== "break" && Number.isFinite(b.seq)).map((b) => b.seq);
  let orderInversions = 0;
  for (let i = 1; i < seqs.length; i++) if (seqs[i] < seqs[i - 1]) orderInversions++;
  return { orderInversions, orderPairs: Math.max(0, seqs.length - 1) };
}

/**
 * Content tagged outside every table but drawn wholly inside one table cell
 * belongs to that cell: a tagging error in the PDF (e.g. noradrenaline's
 * "0.01 – 0.3mcg/kg/min", p.373, is tagged into the Special Notes list while
 * drawn in the Shock dose cell). Following the tags would take the dose out of
 * its row. Returns cell node -> moved items, and the set of moved content ids.
 */
function relocateMistagged(tree, byId, borders) {
  const movedInto = new Map();
  const movedRows = new Map(); // table node -> [items of one row] (drawn between rows, not in a cell)
  const moved = new Set();
  const cells = [];
  const tables = [];
  const outside = [];
  const contentIds = (n, acc = []) => {
    if (!n) return acc;
    if (n.type === "content") acc.push(n.id);
    else for (const c of n.children ?? []) contentIds(c, acc);
    return acc;
  };
  const walk = (n, inTable) => {
    if (!n) return;
    if (n.role === "TD" || n.role === "TH") {
      const items = contentIds(n).flatMap((id) => byId.get(id) ?? []);
      const box = boxOf(items);
      if (box) {
        const { x1, x2 } = cellSpanX(box, borders);
        const cx = (x1 + x2) / 2;
        const covers = (h) => h.x1 - TOL <= cx && h.x2 + TOL >= cx;
        const top = borders.horizontal.filter((h) => h.y >= box.y2 - TOL && covers(h)).sort((a, b) => a.y - b.y)[0];
        const bottom = borders.horizontal.filter((h) => h.y <= box.y1 + TOL && covers(h)).sort((a, b) => b.y - a.y)[0];
        // Only cells closed by drawn borders: without them the cell's extent is a guess.
        if (top && bottom && x2 - x1 > 0) cells.push({ node: n, x1, x2, y1: bottom.y, y2: top.y });
      }
      return;
    }
    if (n.type === "content") { if (!inTable) outside.push(n.id); return; }
    if (n.role === "Figure" || n.role === "Artifact") return;
    if (n.role === "Table") {
      // Table area from its rows of text; tables of fewer than two such rows are
      // left alone (a lone "N / Y" cell spans half a flowchart).
      const rowBoxes = [];
      const rows = (x) => { for (const c of x.children ?? []) { if (c.role === "TR") rowBoxes.push(boxOf(contentIds(c).flatMap((id) => byId.get(id) ?? []))); else if (["THead", "TBody", "TFoot"].includes(c.role)) rows(c); } };
      rows(n);
      const boxes = rowBoxes.filter(Boolean);
      if (boxes.length >= 2) {
        tables.push({ node: n, x1: Math.min(...boxes.map((b) => b.x1)) - 6, x2: Math.max(...boxes.map((b) => b.x2)) + 6, y1: Math.min(...boxes.map((b) => b.y1)), y2: Math.max(...boxes.map((b) => b.y2)) });
      }
    }
    for (const c of n.children ?? []) walk(c, inTable || n.role === "Table");
  };
  walk(tree, false);
  if (!cells.length && !tables.length) return { movedInto, movedRows, moved };
  for (const id of outside) {
    const items = (byId.get(id) ?? []).filter((i) => i.str.trim());
    if (!items.length) continue;
    const centre = (i) => [i.x + i.w / 2, i.y + i.h * 0.35];
    const home = cells.find((c) => items.every((i) => {
      const [x, y] = centre(i);
      return x > c.x1 + 1 && x < c.x2 - 1 && y > c.y1 + 1 && y < c.y2 - 1;
    }));
    if (home) {
      (movedInto.get(home.node) ?? movedInto.set(home.node, []).get(home.node)).push(...(byId.get(id) ?? []));
      moved.add(id);
      continue;
    }
    // Drawn inside a table but in no bordered cell (e.g. a list under a coloured
    // "Indications" band whose own cell is empty): a row of its own, placed by height.
    const table = tables.find((t) => items.every((i) => {
      const [x, y] = centre(i);
      return x > t.x1 && x < t.x2 && y > t.y1 && y < t.y2;
    }));
    if (!table) continue;
    (movedRows.get(table.node) ?? movedRows.set(table.node, []).get(table.node)).push(byId.get(id) ?? []);
    moved.add(id);
  }
  return { movedInto, movedRows, moved };
}

// ─── Page ───────────────────────────────────────────────────────────────────

/**
 * Extract one page.
 * @param state carried between pages: { population } (stacked ADULT/PAEDIATRIC section in force)
 */
export async function extractPage(pdf, pageNumber, state = {}) {
  const page = await pdf.getPage(pageNumber);
  const [tree, textContent, ops] = await Promise.all([
    page.getStructTree(),
    page.getTextContent({ includeMarkedContent: true }),
    page.getOperatorList(),
  ]);
  const borders = readOperators(ops);
  // Fonts are loaded into commonObjs by getOperatorList above.
  const fontOf = (id) => (page.commonObjs.has(id) ? String(page.commonObjs.get(id).name ?? "") : "");
  const { byId, loose, total } = readText(textContent, borders.faintText, fontOf);
  const reached = new Set();
  const stats = { cells: 0, mergedUses: 0, colspanNotes: [], ambiguousSpans: [] };

  const { movedInto, movedRows, moved } = relocateMistagged(tree, byId, borders);
  stats.relocated = moved.size;
  const itemsOf = (node) => {
    const out = [];
    const visit = (n) => {
      if (n.type === "content") {
        if (moved.has(n.id)) return; // rendered in the table cell it's drawn in
        reached.add(n.id);
        out.push(...(byId.get(n.id) ?? []));
        return;
      }
      for (const c of n.children ?? []) visit(c);
    };
    visit(node);
    return out;
  };
  for (const id of moved) reached.add(id);
  const textOf = (node) => joinItems(itemsOf(node));
  const ctx = { borders, itemsOf, textOf, stats, movedInto, movedRows };

  // Blocks in reading order: {kind: "line"|"table"|"break", text, box, group}
  // `group` is the innermost box (Sect/Div) a line sits in.
  const blocks = [];
  let groups = 0;
  const walk = (node, group = 0) => {
    if (!node) return;
    const role = node.role;
    if (role === "Table") {
      const { lines, plain, seq, box } = renderTable(node, ctx);
      if (lines.length) blocks.push({ kind: "table", lines, plain, seq, box });
      return;
    }
    if (role === "Figure" || role === "Artifact") { itemsOf(node); return; }
    if (["P", "H", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "Caption", "TOCI"].includes(role)) {
      const items = itemsOf(node);
      const text = joinItems(items);
      if (text && !NAV_LINE.test(text)) blocks.push({ kind: "line", text: (role === "LI" ? "• " : "") + text.replace(/^[•▪]\s*/, ""), box: boxOf(items), role, group, seq: Math.min(...items.map((i) => i.seq)) });
      return;
    }
    const boxed = role === "Sect" || role === "Div";
    const inner = boxed ? ++groups : group;
    if (boxed) blocks.push({ kind: "break" });
    for (const c of node.children ?? []) walk(c, inner);
    if (boxed) blocks.push({ kind: "break" });
  };
  walk(tree);
  reorderIfScrambled(blocks);

  // Text the structure tree never reached (untagged content): keep it, by position.
  for (const [id, items] of byId) if (!reached.has(id)) loose.push(...items);
  if (loose.length) {
    loose.sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = [];
    for (const it of loose) {
      const row = rows.find((r) => Math.abs(r.y - it.y) < it.h * 0.5);
      if (row) row.items.push(it); else rows.push({ y: it.y, items: [it] });
    }
    for (const r of rows) {
      const text = joinItems(r.items.sort((a, b) => a.x - b.x));
      if (text && !NAV_LINE.test(text)) blocks.push({ kind: "line", text, box: boxOf(r.items), untagged: true, seq: Math.min(...r.items.map((i) => i.seq)) });
    }
  }

  // Side-by-side column headings: short lines sharing a baseline, far apart —
  // upper case (ADULT | PAEDIATRIC) or a branch label ("Active seizures
  // identified" | "Post-ictal phase", "SpO2< 90%" | "SpO2> 90%"). List items,
  // box openers ("Consider:") and Y/N markers are content, never headings.
  const candidates = blocks.filter((b) => b.kind === "line" && b.box && b.role !== "LI" && !/^[•▪o–-]\s/.test(b.text) &&
    b.text.length >= 3 && b.text.length <= 45 &&
    ((b.text === b.text.toUpperCase() && /[A-Z]{3}/.test(b.text)) ||
      (/^[A-Za-z]/.test(b.text) && !/:$/.test(b.text) && !/^(consider|yes|no)$/i.test(b.text))));
  const headingRows = [];
  for (const c of candidates) {
    const y = c.box.y1;
    let row = headingRows.find((r) => Math.abs(r.y - y) <= 2.5);
    if (!row) headingRows.push((row = { y, heads: [] }));
    row.heads.push(c);
  }
  const columnRows = headingRows
    .map((r) => ({ ...r, heads: r.heads.sort((a, b) => a.box.x1 - b.box.x1) }))
    .filter((r) => r.heads.length >= 2 && r.heads.every((h, i) => i === 0 || (h.box.x1 + h.box.x2) / 2 - (r.heads[i - 1].box.x1 + r.heads[i - 1].box.x2) / 2 >= 100))
    .map((r) => {
      const centres = r.heads.map((h) => (h.box.x1 + h.box.x2) / 2);
      const bounds = centres.slice(1).map((c, i) => (c + centres[i]) / 2);
      return { y: r.y, heads: r.heads, bounds };
    })
    .sort((a, b) => b.y - a.y);
  // Many rows of side-by-side lines is a two-column list (e.g. names), not a flowchart.
  if (columnRows.length > 8) columnRows.length = 0;
  const headingSet = new Set(columnRows.flatMap((r) => r.heads));
  const columnOf = (row, box) => {
    // A line crossing a column boundary belongs to no single column.
    if (row.bounds.some((b) => box.x1 < b - 8 && box.x2 > b + 8)) return null;
    const cx = (box.x1 + box.x2) / 2;
    const i = row.bounds.filter((b) => cx > b).length;
    return row.heads[i].text;
  };
  const labelOf = (block) => {
    if (!block.box || !columnRows.length) return null;
    const above = columnRows.filter((r) => r.y > block.box.y2 - 1 || (headingSet.has(block) && r.y >= block.box.y1 - 2.5));
    if (!above.length) return null;
    const outer = above[0];
    const nearest = above[above.length - 1];
    // The nearest heading row sits inside the outer one when it splits the
    // columns further (HYPOGLYCAEMIA › ADULT | PAEDIATRIC) or repeats one label
    // in every column (ADULT › MILD | PAEDIATRIC › MILD); otherwise it starts a
    // new set of columns (SNAKE BITE | SPIDER BITE, then SCORPION | JELLYFISH).
    const nested = nearest !== outer &&
      (nearest.heads.length > outer.heads.length || new Set(nearest.heads.map((h) => h.text)).size === 1);
    const top = nested || nearest === outer ? outer : nearest;
    const a = columnOf(top, block.box);
    if (a === null) return "ALL COLUMNS";
    const b = nested ? columnOf(nearest, block.box) : null;
    return [a, b].filter((x, i, arr) => x && arr.indexOf(x) === i).join(" › ");
  };

  // A box is labelled as a whole: one containing a line that crosses a column
  // boundary, with its other lines in at most one column, is a wide box — all of
  // it is "ALL COLUMNS", including a short last bullet that happens to sit on
  // one side. A group whose lines fall in several columns holds several boxes,
  // so its lines keep their own labels.
  const groupLabel = new Map();
  if (columnRows.length) {
    const byGroup = new Map();
    for (const b of blocks) if (b.kind === "line" && b.group && !headingSet.has(b)) (byGroup.get(b.group) ?? byGroup.set(b.group, []).get(b.group)).push(b);
    for (const [g, members] of byGroup) {
      const labels = members.map((m) => labelOf(m));
      const columns = new Set(labels.filter((l) => l && l !== "ALL COLUMNS"));
      if (labels.includes("ALL COLUMNS") && columns.size <= 1) groupLabel.set(g, "ALL COLUMNS");
    }
  }

  // Assemble text.
  const out = [];
  let population = state.population ?? null;
  const first = blocks.find((b) => b.kind !== "break" && !b.untagged);
  if (population && !(first?.kind === "line" && POPULATION.test(first.text))) {
    out.push(`(continued from previous page: ${population} dosing)`);
  }
  let lastLabel = null;
  for (const b of blocks) {
    if (b.kind === "break") { if (out.length && out[out.length - 1] !== "") out.push(""); continue; }
    if (b.kind === "table") {
      if (out.length && out[out.length - 1] !== "") out.push("");
      out.push(...b.lines, "");
      continue;
    }
    if (POPULATION.test(b.text) && !headingSet.has(b)) population = b.text;
    if (headingSet.has(b)) {
      // Column headings name themselves; the lines under them get the labels.
      if (out.length && out[out.length - 1] !== "") out.push("");
      out.push(b.text);
      lastLabel = null;
      continue;
    }
    let label = groupLabel.get(b.group) ?? labelOf(b);
    // Content outside any column after labelled content (e.g. the box above the
    // split) must not read as part of the column just printed.
    if (!label && lastLabel && columnRows.length) label = "ALL COLUMNS";
    // Restate the label at the start of every box, not only when it changes.
    if (label && (label !== lastLabel || out[out.length - 1] === "")) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      out.push(`[${label}]`);
    }
    lastLabel = label;
    out.push(b.text);
  }
  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  // The page's words in reading order with no labels or markers: what a quote from
  // the page matches, and what search scores (repeated labels would skew it).
  const plain = blocks
    .map((b) => (b.kind === "table" ? b.plain : b.kind === "line" ? b.text : ""))
    .filter(Boolean)
    .join("\n");
  const reachedChars = [...reached].reduce((n, id) => n + (byId.get(id) ?? []).reduce((m, i) => m + i.str.trim().length, 0), 0);
  return {
    text,
    plain,
    coverage: total ? reachedChars / total : 1,
    stats: { ...stats, columnRows: columnRows.length, ...orderStats(blocks) },
    state: { population },
  };
}
