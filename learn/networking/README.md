# Networking Course Architecture

This is a static course. It runs directly in the browser and deploys through Vercel without a build step.

## Files

| File | Responsibility |
| --- | --- |
| `index.html` | Course shell, landing-page sections, reader dialog, and script loading order |
| `course-manifest.js` | Course structure: chapter files, lesson count, and lab count |
| `course-content.js` | Loads the nine chapter card files into the course map |
| `content/chapter-*.html` | Module cards, concise previews, and source markup for each chapter |
| `course-lessons.js` | Lesson copy, five-page lesson markup, activities, and engineering context |
| `course-reader.js` | Reader navigation, Bloom reflections, browser-local progress, certificates, resume state, and lab completion evidence |\n| `course-labs.js` | Interactive in-reader lab binders and their local UI state |\n| `course-storage.js` | Browser storage, record normalization, and future cloud-sync handoff point |
| `course-models.js` | Landing-page models, OSI trace, standalone route/delay models, and final debugging capstone |
| `course.css` | Networking course layout, visual system, responsive behavior, and lab styling |
| `../../learn.js` | Shared Bit Foundry learning-page behavior |

## Course data stored locally

The course deliberately works without accounts. Browser storage keys are grouped by purpose:

- `bitfoundry-networking-course-v1`: lesson completion, demonstrated labs, capstone state, and lab observations
- `bitfoundry-networking-journal-v1`: Bloom reflections, lab evidence, and capstone handoff
- `bitfoundry-networking-capstone-v1`: draft capstone handoff
- `bitfoundry-networking-resume-v1`: most recently opened lesson and page
- `bitfoundry-notes-module-*`: working notes inside individual lessons

## Adding or changing a lesson

1. Update its visible module card in the matching `content/chapter-*.html` file.
2. Update the same module ID in `course-lessons.js`; keep the five pages focused on why, mechanism, engineering case, practice, and transfer.
3. Add an interactive model only when changing an input, tracing state, or making a decision helps students understand the mechanism.
4. Put reader flow and lab completion UI in `course-reader.js`; put browser persistence in `course-storage.js`; put an in-reader lab binder in `course-labs.js`; put a landing-page model in `course-models.js`.
5. Put visual rules in `course.css`, including a mobile rule when a new layout needs one.

## Product constraints

- Lead with system purpose and developer relevance.
- Use concise, evidence-based language.
- Keep journal, completion, and certificates functional without an account.
- Treat the future Socratic assistant as an opt-in layer that works from student-owned journal context.

## Validate before publishing

From the repository root, run:

```bash
node learn/networking/scripts/validate-course.mjs
```

The check verifies the manifest, all 41 module cards, lesson content, launch targets, and script order. Run it whenever lesson IDs, chapter files, or the course shell changes.
