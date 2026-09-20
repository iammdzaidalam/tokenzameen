# Media

## Photography

There is no project photography on file yet. Until a developer supplies it, every
hero, category tile and gallery slot uses **representative stock photography from
Unsplash**, self-hosted under `public/photos/` and served through `next/image`.
The Unsplash License permits commercial use and self-hosting without attribution;
each file is named by its Unsplash photo id so the source page is one URL away:
`https://unsplash.com/photos/<id without the photo- prefix>`.

Every `MediaAsset` keeps `placeholder: true` and an alt of the form
"Representative photograph for <project>" so nothing claims to show the project
itself. The project page also says so in the trust panel.

`scripts/photos.json` is the assignment: which id backs each category, each brand
hero, and the five slots (hero + four gallery) per project. To replace a photo,
drop the new file into `public/photos/`, point the assignment at it, and update
`src/content/projects.ts` or `src/content/categories.ts` (both read the ids from
that assignment shape). Set `placeholder: false` only for a photograph the
developer supplied of the actual project.

33 photographs are in use.

## Generated artwork

`scripts/generate-media.mjs` still produces the plotted masterplan drawing for
Garden Court (`public/media/projects/garden-court/masterplan.svg`), which is a
plan, not a photograph, and the six category illustrations retained under
`public/media/categories/` for any surface that wants line art rather than a photo.
Re-running the script is deterministic.
