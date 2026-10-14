# Brief (editorial-ui)

Project: pass-guard
Page: home
Date: 2026-10-14

## Direction (step 2)
World: the pin-tumbler lock and the locksmith's bench: machined steel cylinders, brass keys and pins, engraved faceplates, key-cutting.
Palette: bg #101316, ink #E4E7EA, accent #D9A74A
Display font: Archivo (wide axis 125, 800) — reads like lettering engraved on a lock faceplate.
Text font: Geist (body) + Geist Mono (passwords, figures, formulas).
Navigation: Split top bar → compact on scroll, with the two-tab segmented switch (sliding brass indicator) as the nav.
Hero content: the live generator itself (product demo: the password is cut into a key in front of you).
Composition: Tool because the page IS a tool and the generated password is the result-protagonist; rejected Pinned scene (nobody should scroll to get a password), Type window (would bury the tool under decoration).
Candidates: 1) Tool: wordmark + one line, the generator panel with the password as the largest element; 2) Pinned scene: lock cylinder whose pins set in 3 beats; 3) Type window: giant PASSGUARD letters masking the key steel.
Split test: n/a (Tool chosen)
Footer composition: Ground line — a hairline with a small key lying on it, the formula and the KDF note, then the signature.
Motif: a key whose bitting (cut depths) is derived from the current password; it re-cuts on regenerate and appears small in the logo and footer.
Name: concept, because "PassGuard" literally names guarding a pass/key; the key-and-lock motif comes from the activity anyway.
Repeats: none (no prior site on record)
Previous pages read: src/App.jsx, components/*, index.css (existing cyan/violet aurora + glass; abandoned on purpose)
Galleries: skipped because the task is an existing app restyle with a defined function; no browser gallery pass.
Story: Generate a key with real randomness, see how deep its cuts go, and audit any key — all without leaving the tab.

## Facts (step 3)
Given by the user: all copy in the existing components (kept verbatim).
Placeholders to mark: none
Not invented: no stats, users, brands or claims added.

## Flags
Flags: existing, interactive
