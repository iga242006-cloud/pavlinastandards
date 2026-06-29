# Expected Image Assets

Place the following image files in this directory before deploying for self-hosted images.

## Required Files

| Filename | Description | Recommended Size |
|---|---|---|
| `physician-portrait.jpg` | Professional photo of Dr. Hector | 800×1000px minimum, portrait orientation |
| `clinic-exterior.jpg` | Exterior or interior photo of the clinic in Greenwood, IN | 1200×800px minimum, landscape |

## Current Fallback Behavior

- **`physician-portrait.jpg`** — if the local file is missing, the site falls back to the Franciscan Health directory photo automatically via the `onerror` attribute on the `<img>` tag. For production self-hosting, download the portrait and save it here as `physician-portrait.jpg`.

- **`clinic-exterior.jpg`** — currently not used as an `<img>` tag src (appears in future sections). When added, the layout already reserves the slot.

## To self-host the portrait

Download Dr. Hector's photo and save it here:

```
assets/physician-portrait.jpg
```

Source URL (Franciscan Health directory):
```
https://directory.franciscanhealth.org/sites/default/files/hg_features/hg_provider/e0a45b63cfb00b778742ba9cbb7f16a4.jpg
```

On Mac/Linux:
```bash
curl -o assets/physician-portrait.jpg \
  "https://directory.franciscanhealth.org/sites/default/files/hg_features/hg_provider/e0a45b63cfb00b778742ba9cbb7f16a4.jpg"
```

## Notes

- File names are case-sensitive. Use lowercase with hyphens exactly as listed.
- WebP versions are recommended for performance — add a `<picture>` element with WebP source if available.
- `loading="eager"` is set on the physician portrait (above the fold); all other images use `loading="lazy"`.
