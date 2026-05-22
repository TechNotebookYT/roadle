# Roadle Image Creator Utility

A small Tkinter desktop app for building Roadle puzzle image sets from one source photo.

## Install

```powershell
python -m pip install -r requirements.txt
```

## Run

```powershell
python roadle_image_creator.py
```

## Workflow

1. Load a high-quality source photo.
2. Draw global logo/badge blur rectangles.
3. For each output image, choose a 4:3 crop.
4. Optionally draw extra blur rectangles for each reveal.
5. Export to `public/cars/<make-model-year>/` as:

```text
reveal-1.webp
reveal-2.webp
reveal-3.webp
reveal-4.webp
reveal-5.webp
full.webp
```

All exports are `1600x1200` WebP files at quality 82.
