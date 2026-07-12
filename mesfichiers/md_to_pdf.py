#!/usr/bin/env python
"""
Convert solutionp2p.md to PDF with code syntax highlighting.
Uses reportlab + markdown + pygments.
"""

import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import markdown
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import JavascriptLexer
from pygments.util import ClassNotFound


APP_SRC = Path(
    r"C:\Users\Utilisateur\Documents\Ben\myapp\yabisso\app\src\features\bluetooth\services"
)
SHARE_DIR = Path(r"C:\Users\Utilisateur\Documents\Ben\myapp\yabisso\mesfichiers\share")
OUTPUT = SHARE_DIR / "solutionp2p.pdf"

SOURCES = [
    (
        "P2PAutoSync.js",
        "Orchestrateur principal — synchronisation P2P bidirectionnelle",
    ),
    ("NearbyMeshService.js", "Service Mesh BLE — découverte et election des roles"),
    ("WifiDirectService.js", "Service WiFi Direct — transport de fichiers"),
]


def extract_code_blocks(md_text):
    """Extract fenced code blocks from markdown, return list of (placeholder, code)."""
    blocks = []
    pattern = re.compile(r"^```(\w*)\n(.*?)\n^```", re.MULTILINE | re.DOTALL)

    def replacer(m):
        lang = m.group(1) or "text"
        code = m.group(2)
        placeholder = f"\x00CODE_BLOCK_{len(blocks)}\x00"
        blocks.append((placeholder, lang, code))
        return placeholder

    return pattern.sub(replacer, md_text), blocks


def render_code_block(code, lang):
    """Render a code block as Preformatted with syntax highlighting (HTML -> Preformatted)."""
    try:
        lexer = (
            JavascriptLexer() if lang in ("javascript", "js", "") else JavascriptLexer()
        )
    except ClassNotFound:
        lexer = JavascriptLexer()

    # Use Pygments to generate HTML with inline styles
    formatter = HtmlFormatter(
        style="monokai",
        noclasses=True,
        nobackground=True,
        cssclass="",
        linenos=False,
    )
    try:
        html = highlight(code, lexer, formatter)
    except Exception:
        html = code

    # Strip the wrapper div/pre
    html = re.sub(r"^<div[^>]*>", "", html)
    html = re.sub(r"</div>$", "", html)
    html = re.sub(r"<pre[^>]*>", "", html)
    html = re.sub(r"</pre>$", "", html)

    # Convert <span style="color: #XXX"> to <font color="#XXX">
    def span_repl(m):
        color = m.group(1)
        return f'<font color="#{color}">'

    html = re.sub(r'<span style="color: #([0-9A-Fa-f]+)">', span_repl, html)
    html = html.replace("</span>", "</font>")

    # Escape any & not part of an entity
    html = html.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")

    # Clean extra whitespace
    html = re.sub(r"\n+", "\n", html).strip()

    return html


def make_styles():
    """Create paragraph styles."""
    styles = getSampleStyleSheet()

    code_style = ParagraphStyle(
        "CodeBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.5,
        leading=9.5,
        leftIndent=2 * mm,
        rightIndent=2 * mm,
        spaceBefore=2,
        spaceAfter=2,
        textColor=colors.HexColor("#f8f8f2"),
        backColor=colors.HexColor("#272822"),
        borderPadding=4,
        alignment=TA_LEFT,
    )

    h1 = ParagraphStyle(
        "H1Custom",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        spaceAfter=12,
        textColor=colors.HexColor("#1a1a1a"),
    )
    h2 = ParagraphStyle(
        "H2Custom",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=10,
        spaceAfter=8,
        textColor=colors.HexColor("#2c3e50"),
    )
    h3 = ParagraphStyle(
        "H3Custom",
        parent=styles["Heading3"],
        fontSize=12,
        leading=15,
        spaceBefore=6,
        spaceAfter=4,
        textColor=colors.HexColor("#34495e"),
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=9,
        leading=12,
        spaceAfter=4,
        textColor=colors.HexColor("#222222"),
    )
    quote = ParagraphStyle(
        "Quote",
        parent=body,
        leftIndent=6 * mm,
        fontSize=8.5,
        textColor=colors.HexColor("#555555"),
        backColor=colors.HexColor("#f5f5f5"),
        borderPadding=4,
    )

    return {
        "code": code_style,
        "h1": h1,
        "h2": h2,
        "h3": h3,
        "body": body,
        "quote": quote,
    }


def add_page_number(canvas, doc):
    """Footer with page number."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(A4[0] / 2.0, 1 * cm, f"Page {page_num}")
    canvas.drawString(
        2 * cm, 1 * cm, "solutionp2p — Code du partage automatique P2P — V3.7"
    )
    canvas.drawRightString(A4[0] - 2 * cm, 1 * cm, "Yabisso P2P")
    canvas.restoreState()


def md_to_pdf(src_dir: Path, pdf_path: Path):
    print(f"Lecture des sources depuis {src_dir}...")
    parts = []
    total_lines = 0
    for filename, description in SOURCES:
        file_path = src_dir / filename
        if not file_path.exists():
            print(f"  ATTENTION: {filename} introuvable, skip")
            continue
        content = file_path.read_text(encoding="utf-8")
        lines = content.count("\n") + 1
        total_lines += lines
        parts.append(
            f"# {filename}\n\n_{description}_\n\n"
            f"**Chemin source** : `{file_path}`  \n"
            f"**Lignes** : {lines}  \n"
            f"**Caractères** : {len(content)}\n\n"
            f"```javascript\n{content}\n```\n"
        )
    md_text = "\n\n---\n\n".join(parts)
    print(f"  -> {len(md_text)} caracteres, {total_lines} lignes au total")

    # Extract code blocks BEFORE markdown processing
    print("Extraction des blocs de code...")
    md_text, code_blocks = extract_code_blocks(md_text)
    print(f"  -> {len(code_blocks)} blocs de code trouves")

    # V3.7: Build a placeholder->code map for the line-by-line loop below
    placeholder_to_code = {ph: (lang, code) for (ph, lang, code) in code_blocks}

    # Convert MD to HTML
    print("Conversion MD -> HTML...")
    md_obj = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
        extension_configs={"toc": {"permalink": False}},
    )
    html = md_obj.convert(md_text)
    # Restore code blocks in HTML (they appear as raw text since we replaced them)
    # Actually, since we replaced ``` with placeholders, the markdown will just
    # treat them as text. We need to handle this differently.
    # Better approach: convert MD to tokens, walk through them.

    # REPROCESS: walk through MD line by line instead
    print("Re-conversion MD -> tokens (parcours ligne par ligne)...")
    story = []
    styles = make_styles()

    lines = md_text.split("\n")
    i = 0
    in_code = False
    code_buffer = []
    code_lang = "javascript"

    while i < len(lines):
        line = lines[i]

        # V3.7: Detect placeholder from extract_code_blocks (replaces fenced code)
        if line.strip() in placeholder_to_code and not in_code:
            lang, code_text = placeholder_to_code[line.strip()]
            rendered_html = render_code_block(code_text, lang)
            try:
                p = Preformatted(rendered_html, styles["code"])
                story.append(p)
            except Exception:
                plain = ParagraphStyle(
                    "PlainCode",
                    parent=styles["body"],
                    fontName="Courier",
                    fontSize=7.5,
                    leading=9.5,
                    backColor=colors.HexColor("#272822"),
                    textColor=colors.HexColor("#f8f8f2"),
                    leftIndent=2 * mm,
                    rightIndent=2 * mm,
                    borderPadding=4,
                )
                story.append(
                    Preformatted(
                        code_text.replace("<", "&lt;").replace(">", "&gt;"), plain
                    )
                )
            story.append(Spacer(1, 2 * mm))
            i += 1
            continue

        # Code block start
        if line.strip().startswith("```") and not in_code:
            in_code = True
            code_lang = line.strip()[3:].strip() or "javascript"
            code_buffer = []
            i += 1
            continue

        # Code block end
        if line.strip() == "```" and in_code:
            in_code = False
            code_text = "\n".join(code_buffer)
            rendered_html = render_code_block(code_text, code_lang)
            try:
                p = Preformatted(rendered_html, styles["code"])
                story.append(p)
            except Exception as e:
                # Fallback: plain text
                plain = ParagraphStyle(
                    "PlainCode",
                    parent=styles["body"],
                    fontName="Courier",
                    fontSize=7.5,
                    leading=9.5,
                    backColor=colors.HexColor("#272822"),
                    textColor=colors.HexColor("#f8f8f2"),
                    leftIndent=2 * mm,
                    rightIndent=2 * mm,
                    borderPadding=4,
                )
                story.append(
                    Preformatted(
                        code_text.replace("<", "&lt;").replace(">", "&gt;"), plain
                    )
                )
            story.append(Spacer(1, 2 * mm))
            i += 1
            continue

        # Inside code block
        if in_code:
            code_buffer.append(line)
            i += 1
            continue

        # Horizontal rule
        if line.strip() == "---":
            story.append(Spacer(1, 3 * mm))
            i += 1
            continue

        # Headings
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            # Strip markdown inline
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            text = re.sub(r"\*(.+?)\*", r"\1", text)
            text = re.sub(r"`(.+?)`", r"\1", text)
            if level == 1:
                story.append(Paragraph(text, styles["h1"]))
            elif level == 2:
                story.append(Paragraph(text, styles["h2"]))
            elif level == 3:
                story.append(Paragraph(text, styles["h3"]))
            else:
                story.append(Paragraph(text, styles["body"]))
            i += 1
            continue

        # Tables (simple)
        if (
            "|" in line
            and i + 1 < len(lines)
            and re.match(r"^\|?[\s\-|:]+\|?$", lines[i + 1])
        ):
            table_lines = []
            while i < len(lines) and "|" in lines[i]:
                table_lines.append(lines[i])
                i += 1
            rows = []
            for tl in table_lines:
                cells = [c.strip() for c in tl.strip("|").split("|")]
                if re.match(r"^[\s\-|:]+$", "".join(cells)):
                    continue  # separator row
                rows.append(cells)
            if rows:
                col_widths = [A4[0] - 4 * cm] * len(rows[0])
                col_widths = [w / len(rows[0]) for w in col_widths]
                t = Table(rows, colWidths=col_widths)
                t.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#34495e")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, -1), 8),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                            (
                                "ROWBACKGROUNDS",
                                (0, 1),
                                (-1, -1),
                                [colors.white, colors.HexColor("#f9f9f9")],
                            ),
                            ("LEFTPADDING", (0, 0), (-1, -1), 4),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                )
                story.append(t)
                story.append(Spacer(1, 3 * mm))
            continue

        # Blank line
        if line.strip() == "":
            i += 1
            continue

        # List items
        if re.match(r"^\s*[-*+]\s+", line):
            text = re.sub(r"^\s*[-*+]\s+", "", line)
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            text = re.sub(r"\*(.+?)\*", r"\1", text)
            text = re.sub(r"`(.+?)`", r"\1", text)
            story.append(Paragraph("• " + text, styles["body"]))
            i += 1
            continue

        # Blockquote
        if line.startswith(">"):
            text = line.lstrip(">").strip()
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            story.append(Paragraph(text, styles["quote"]))
            i += 1
            continue

        # Normal paragraph
        text = line
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
        text = re.sub(r"\*(.+?)\*", r"\1", text)
        text = re.sub(r"`(.+?)`", r"\1", text)
        # Process links [text](url) -> just text
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
        if text.strip():
            story.append(Paragraph(text, styles["body"]))
        i += 1

    # Build PDF
    print(f"Génération du PDF : {pdf_path}...")
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Yabisso — Code du partage automatique P2P (V3.7)",
        author="MiniMax-M3",
        subject="Code source complet des 3 services de partage P2P",
    )

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"✅ PDF généré : {pdf_path} ({pdf_path.stat().st_size} octets)")


if __name__ == "__main__":
    SHARESOURCES_DIR = SHARE_DIR
    SHARESOURCES_DIR.mkdir(parents=True, exist_ok=True)
    md_to_pdf(APP_SRC, OUTPUT)
