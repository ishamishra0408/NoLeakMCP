#!/usr/bin/env python3
"""
Build the redacted Slack screenshot that ships on the site.

    python3 evidence/step7-slack/redact-shot.py [SOURCE.png]

Source: a full-window macOS Chrome screenshot of the live #eng-channel thread,
2940x1910, taken 2026-09-08. The source is NOT committed (it carries the
workspace/channel ids in the URL bar, the DM list, other people's bookmark
names and two recognisable faces). Default path is ~/Desktop/Slack.png.

Outputs (both written, byte-identical):
    site/assets/slack-thread.png
    evidence/step7-slack/slack-thread.redacted.png

What this does, and why:

  CROP   Two regions are lifted out of the source and composed side by side on
         one canvas. Everything else is dropped, which is how the sensitive
         chrome is removed rather than painted over: the macOS menu bar, the
         Chrome tab strip/title, the URL bar (carries the real team + channel
         ids), the bookmarks bar (other people's doc names), the whole Slack
         workspace rail and sidebar (DM list, other channels, "An offer
         awaits"), and both message composer boxes are all outside both crops.

  BLUR   Every human avatar photo inside the two crops is Gaussian-blurred
         (radius 20) and then covered by an opaque rounded tile with initials.
         The blur is belt-and-braces: if a tile were ever mis-sized, what shows
         through is still unrecognisable. The eng-agent avatar is a generic
         Slack app glyph, not a photo, and is left alone.

  MASK   The collector host in the poisoned reply is painted out and replaced
         with "<attacker-host>/c/health?d=<BASE64>" in a similar-sized font, so
         the fact that the message carries an outbound URL survives while the
         live Beeceptor endpoint does not.

Names are NOT redacted: Isha Mishra and Devansh Pathak are the team's own
names, already in README.md and CHANGELOG.md, and the attack only reads
correctly if you can see that a human teammate posted it while spoofing a bot.

Requires: Pillow. No network.
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Desktop/Slack.png")
OUT_SITE = os.path.join(REPO, "site", "assets", "slack-thread.png")
OUT_EVID = os.path.join(HERE, "slack-thread.redacted.png")

SRC_SIZE = (2940, 1910)  # the source this script's coordinates were measured on

# --- source regions, in source pixels -------------------------------------
CHAN = (820, 415, 2065, 1350)   # #eng-channel: header -> end of the standup recap
THREAD = (2105, 415, 2930, 1290)  # Thread panel: header -> last reply

# Human avatar photos, in source pixels. (Everything else in these crops is
# either text or Slack's own chrome.)
AVATARS = [
    # (box, initials)
    ((851, 652, 925, 725), "DP"),   # channel · Devansh 6:06 PM
    ((851, 756, 925, 829), "IM"),   # channel · Isha 6:07 PM (thread parent)
    ((942, 892, 987, 936), "IM"),   # channel · "2 replies" facepile
    ((851, 972, 925, 1045), "DP"),  # channel · Devansh 9:04 PM
    ((2127, 527, 2205, 605), "IM"),  # thread · parent
    ((2127, 723, 2205, 801), "IM"),  # thread · the poisoned reply
    ((2127, 1179, 2205, 1257), "IM"),  # thread · reply 2
]

# The unfurled collector link inside the poisoned reply.
LINK_BOX = (2218, 985, 2900, 1027)
LINK_TEXT = "<attacker-host>/c/health?d=<BASE64>"

# --- canvas ----------------------------------------------------------------
W, H = 1600, 1000               # the site slot is aspect-ratio 16/10
PAD, GAP = 20, 28
BG = (16, 18, 20)
INK = (201, 209, 217)
DIM = (125, 133, 144)
RULE = (42, 47, 53)
TILE = (60, 66, 74)
LINK_BG = (29, 57, 72)          # Slack's dark-theme link-highlight fill
LINK_INK = (109, 178, 227)

LABEL_L = "#eng-channel — the channel view"
LABEL_R = "Thread — the poisoned reply (2 replies)"
FOOTER = [
    "Redacted from a live Slack window: browser chrome, URL bar, bookmarks, workspace rail/sidebar and composers cropped out;",
    "avatar photos blurred and tiled with initials; the collector host painted out and replaced with <attacker-host>.",
    "Kept verbatim: the poisoned reply's text, its author and timestamps, the reply count, and the channel's standup recap.",
]

FONT_DIRS = ["/System/Library/Fonts", "/System/Library/Fonts/Supplemental", "/Library/Fonts"]


def font(name, size):
    for d in FONT_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    return ImageFont.load_default()


def bold(size):
    return font("Arial Bold.ttf", size)


def regular(size):
    return font("Arial.ttf", size)


def redact(img):
    """Blur + tile every avatar, and mask the collector host. In place-ish."""
    d = ImageDraw.Draw(img)
    for (box, initials) in AVATARS:
        pad = 6
        wide = (box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad)
        img.paste(img.crop(wide).filter(ImageFilter.GaussianBlur(20)), wide[:2])
        r = max(6, (box[2] - box[0]) // 5)
        d.rounded_rectangle(box, radius=r, fill=TILE)
        f = bold(max(11, int((box[3] - box[1]) * 0.36)))
        d.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), initials,
               font=f, fill=INK, anchor="mm")

    # Collector host -> readable placeholder, same box, similar size.
    d.rounded_rectangle(LINK_BOX, radius=6, fill=LINK_BG)
    inner = LINK_BOX[2] - LINK_BOX[0] - 24
    size = int((LINK_BOX[3] - LINK_BOX[1]) * 0.78)
    f = regular(size)
    while size > 10 and d.textlength(LINK_TEXT, font=f) > inner:
        size -= 1
        f = regular(size)
    d.text((LINK_BOX[0] + 12, (LINK_BOX[1] + LINK_BOX[3]) / 2), LINK_TEXT,
           font=f, fill=LINK_INK, anchor="lm")
    return img


def main():
    if not os.path.exists(SRC):
        sys.exit(f"source screenshot not found: {SRC}\n"
                 "It is deliberately not committed. Pass the path as argv[1].")
    src = Image.open(SRC).convert("RGB")
    if src.size != SRC_SIZE:
        sys.exit(f"expected a {SRC_SIZE[0]}x{SRC_SIZE[1]} source, got {src.size}. "
                 "The crop boxes below are measured in those pixels.")

    src = redact(src)
    left, right = src.crop(CHAN), src.crop(THREAD)

    scale = (W - 2 * PAD - GAP) / (left.width + right.width)
    left = left.resize((round(left.width * scale), round(left.height * scale)), Image.LANCZOS)
    right = right.resize((round(right.width * scale), round(right.height * scale)), Image.LANCZOS)

    label_h, foot_gap, foot_step = 30, 20, 24
    block = label_h + left.height + foot_gap + foot_step * len(FOOTER)
    top = max(PAD, (H - block) // 2)

    out = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(out)
    lf, ff = bold(19), regular(15)
    d.text((PAD, top), LABEL_L, font=lf, fill=INK)
    d.text((PAD + left.width + GAP, top), LABEL_R, font=lf, fill=INK)

    y = top + label_h
    out.paste(left, (PAD, y))
    out.paste(right, (PAD + left.width + GAP, y))
    d.line([(PAD + left.width + GAP // 2, y), (PAD + left.width + GAP // 2, y + left.height)],
           fill=RULE, width=2)

    fy = y + left.height + foot_gap
    for i, line in enumerate(FOOTER):
        d.text((PAD, fy + i * foot_step), line, font=ff, fill=DIM)

    # 8-bit palette, no dither: the source is flat UI chrome, so 256 colours are
    # lossless to the eye and cut the file from ~445 KB to ~170 KB. This is a
    # public page asset; page weight is part of the deliverable.
    out = out.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.NONE)
    out.save(OUT_SITE, "PNG", optimize=True)
    out.save(OUT_EVID, "PNG", optimize=True)
    print(f"wrote {OUT_SITE} ({os.path.getsize(OUT_SITE)} bytes)")
    print(f"wrote {OUT_EVID} ({os.path.getsize(OUT_EVID)} bytes)")


if __name__ == "__main__":
    main()
