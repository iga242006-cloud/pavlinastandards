# Expected Image Assets

Place the following image files in this directory before deploying:

## Required Files

| Filename | Description | Recommended Size |
|---|---|---|
| `physician-portrait.jpg` | Professional photo of Dr. Hector — used in the Doctor section with a teal frame overlay | 800×1000px minimum, portrait orientation |
| `clinic-exterior.jpg` | Exterior or interior photo of the Hector Family Medicine clinic in Greenwood, IN — used in the Contact section as a background or card image | 1200×800px minimum, landscape |

## Notes

- If either image is missing, CSS gradient placeholders will display automatically — the layout stays visually complete.
- Use high-resolution originals; images are lazy-loaded and served at display size.
- File names are case-sensitive. Use lowercase with hyphens exactly as listed above.
- WebP versions (`physician-portrait.webp`, `clinic-exterior.webp`) are recommended as well for performance — add a `<picture>` element with WebP source if available.
