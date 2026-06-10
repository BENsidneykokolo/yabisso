"""Generate solutionp2p.md in mesfichiers/share/ from the 3 P2P source files."""

import datetime
from pathlib import Path

APP_SRC = Path(
    r"C:\Users\Utilisateur\Documents\Ben\myapp\yabisso\app\src\features\bluetooth\services"
)
OUT = Path(
    r"C:\Users\Utilisateur\Documents\Ben\myapp\yabisso\mesfichiers\share\solutionp2p.md"
)

SOURCES = [
    (
        "P2PAutoSync.js",
        "Orchestrateur principal - synchronisation P2P bidirectionnelle (V3.9)",
    ),
    ("NearbyMeshService.js", "Service Mesh BLE - decouverte et election des roles"),
    ("WifiDirectService.js", "Service WiFi Direct - transport de fichiers"),
]

lines_header = []
lines_header.append("# Yabisso - Code du partage automatique P2P (V3.9)\n")
lines_header.append("")
lines_header.append(
    f"Genere le {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
)
lines_header.append("")
lines_header.append(
    "Ce fichier contient le code source integral des 3 services JavaScript qui implementent"
)
lines_header.append(
    "le partage P2P bidirectionnel WiFi Direct + BLE Mesh dans l'app Yabisso (Loba)."
)
lines_header.append("")
lines_header.append("**Fichiers inclus :**")
lines_header.append("")
for fn, desc in SOURCES:
    lines_header.append(f"- `{fn}` - {desc}")
lines_header.append("")
lines_header.append("**Patch V3.9 (retour ami) :**")
lines_header.append(
    "- BARRIERE `_waitingForSlave` dans `_p2pSyncCycle()` : bloque le cycle 3s tant que le Slave n'a pas envoye YABISSO_HELLO"
)
lines_header.append(
    "- `.then()` pattern dans setTimeout Master (PAS d'`await`) — pattern asynchrone correct"
)
lines_header.append(
    "- `_waitForSlaveConfirmation` cherche dans TOUTES les cles de `_peerHandshakeConfirmed` (au lieu d'un peerName specifique qui vaut souvent 'unknown' au moment du fire)"
)
lines_header.append(
    "- Flag `_waitingForSlave` reset a la deconnexion + dans le `.then()` (success ou timeout)"
)
lines_header.append(
    "- Slave-initiated handshake : le Slave envoie YABISSO_HELLO immediatement apres startReceiving, le Master attend passivement"
)
lines_header.append("- Conservation du double-validateur PACK_RECEIVED_OK (V3.6.4)")
lines_header.append("")
lines_header.append("---")
lines_header.append("")

parts = ["\n".join(lines_header) + "\n\n"]
total_lines = 0

for filename, description in SOURCES:
    file_path = APP_SRC / filename
    if not file_path.exists():
        print(f"ATTENTION: {filename} introuvable")
        continue
    content = file_path.read_text(encoding="utf-8")
    code_lines = content.count("\n") + 1
    total_lines += code_lines
    parts.append(f"## `{filename}`\n\n")
    parts.append(f"_{description}_\n\n")
    parts.append(f"- **Chemin source** : `{file_path}`\n")
    parts.append(f"- **Lignes** : {code_lines}\n")
    parts.append(f"- **Caracteres** : {len(content)}\n\n")
    parts.append("```javascript\n")
    parts.append(content)
    parts.append("\n```\n\n---\n\n")

OUT.write_text("".join(parts), encoding="utf-8")
size = OUT.stat().st_size
print(f".md genere : {OUT}")
print(f"  -> {size} octets, {total_lines} lignes de code total")
