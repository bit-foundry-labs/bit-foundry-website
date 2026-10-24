# Networking Course Architecture

This is a static course. It runs directly in the browser and deploys through Vercel without a build step.

## Files

| File | Responsibility |
| --- | --- |
| `index.html` | Course structure, lesson source content, semantic markup, and page sections |
| `course.css` | Networking course layout, visual system, responsive behavior, and lab styling |
| `course-reader.js` | Five-page lesson reader, Bloom prompts, journal, course progress, labs, certificates, and resume state |
| `course-models.js` | Landing-page models, OSI trace, standalone route/delay models, and final debugging capstone |
| `../../learn.js` | Shared Bit Foundry learning-page behavior |

## Course data stored locally

The course deliberately works without accounts. Browser storage keys are grouped by purpose:

- `bitfoundry-networking-course-v1`: lesson completion, demonstrated labs, capstone state, and lab observations
- `bitfoundry-networking-journal-v1`: Bloom reflections, lab evidence, and capstone handoff
- `bitfoundry-networking-capstone-v1`: draft capstone handoff
- `bitfoundry-networking-resume-v1`: most recently opened lesson and page
- `bitfoundry-notes-module-*`: working notes inside individual lessons

## Adding or changing a lesson

1. Keep module source markup in `index.html`.
2. Update the matching entry in the lesson-reader data in `course-reader.js`.
3. Add an interactive model only when changing an input, tracing state, or making a decision helps students understand the mechanism.
4. Put reader and lab logic in `course-reader.js`; put a landing-page model in `course-models.js`.
5. Put visual rules in `course.css`, including a mobile rule when a new layout needs one.

## Product constraints

- Lead with system purpose and developer relevance.
- Use concise, evidence-based language.
- Keep journal, completion, and certificates functional without an account.
- Treat the future Socratic assistant as an opt-in layer that works from student-owned journal context.
