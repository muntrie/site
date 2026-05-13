# Graph Report - muntrie-website  (2026-05-13)

## Corpus Check
- 6 files · ~576,071 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 115 nodes · 169 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fbce0cee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `applyLocale()` - 11 edges
2. `updateActiveStagePreview()` - 8 edges
3. `togglePreviewSound()` - 7 edges
4. `Muntrie Public Legal Pages` - 7 edges
5. `escapeHtml()` - 6 edges
6. `renderHome()` - 5 edges
7. `switchToStageBackground()` - 5 edges
8. `renderLegalPage()` - 5 edges
9. `renderStoreBadge()` - 4 edges
10. `renderClosingDownloadCard()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `renderStageBackground()` --calls--> `escapeHtml()`  [EXTRACTED]
  script.js → script.js  _Bridges community 7 → community 4_
- `renderLegalPage()` --calls--> `escapeHtml()`  [EXTRACTED]
  script.js → script.js  _Bridges community 7 → community 6_
- `renderHome()` --calls--> `renderStageBackgrounds()`  [EXTRACTED]
  script.js → script.js  _Bridges community 6 → community 4_
- `applyLocale()` --calls--> `renderHome()`  [EXTRACTED]
  script.js → script.js  _Bridges community 6 → community 3_
- `renderActiveStageBackground()` --calls--> `getActiveStageEntry()`  [EXTRACTED]
  script.js → script.js  _Bridges community 4 → community 5_

## Communities (15 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (20): deviceShellNode, heroNode, liveTimeNode, localeButtons, navIndicatorNode, navToggleNode, previewAmbientAudioNode, previewAmbientValueNodes (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (10): body, failures, optimizedImages, root, runtimeFiles, runtimeText, script, syncPreviewAudioBody (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): code:text (https://<github-user-or-org>.github.io/<repo-name>/privacy.h), code:text (https://<github-user-or-org>.github.io/<repo-name>/privacy.h), code:text (https://<github-user-or-org>.github.io/<repo-name>/site/priv), code:bash (cd site), code:text (http://localhost:4173/privacy.html), Current Purpose, Google Play URL, Local Preview (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (12): alignCurrentHashTarget(), applyLocale(), applyTextContent(), getPath(), renderConfigLinks(), scheduleActiveNavIndicatorSync(), setActiveNavLink(), setupActiveNavObserver() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (11): buildCssImageValue(), cssImageUrl(), escapeCssUrl(), renderActiveStageBackground(), renderStageBackground(), renderStageBackgrounds(), renderStageIndicators(), setupStageBackgroundMotion() (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.43
Nodes (8): getActiveStageEntry(), pausePreviewAudio(), playPreviewAudio(), syncPreviewAudio(), syncPreviewAudioSources(), togglePreviewSound(), updateActiveStagePreview(), updatePreviewSoundUi()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (6): applyPreviewOrientation(), getContactEmail(), renderHome(), renderLegalPage(), renderSimpleCards(), renderStagePreview()

### Community 7 - "Community 7"
Cohesion: 0.4
Nodes (6): escapeHtml(), getDownloadCardState(), getStoreBadgeMeta(), renderClosingDownloadCard(), renderImageSourceAttributes(), renderStoreBadge()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): graphify, PUA Skill Auto Trigger, RTK - Rust Token Killer (Global Codex Rule)

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): clamp(), setupStageClockLayoutObserver(), syncStageClockLayout()

## Knowledge Gaps
- **40 isolated node(s):** `localeButtons`, `yearNodes`, `heroNode`, `liveTimeNode`, `stageBackgroundsNode` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `applyLocale()` connect `Community 3` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `localeButtons`, `yearNodes`, `heroNode` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._