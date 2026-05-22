from __future__ import annotations

import math
import re
import tkinter as tk
from dataclasses import dataclass, field
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from PIL import Image, ImageFilter, ImageTk


OUTPUT_SIZE = (1600, 1200)
WEBP_QUALITY = 82
IMAGE_KEYS = [f"reveal-{i}" for i in range(1, 6)] + ["full"]
EXPORT_NAMES = {key: f"{key}.webp" for key in IMAGE_KEYS}
ASPECT = 4 / 3
APP_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_ROOT = APP_DIR.parent / "public" / "cars"


@dataclass
class ImagePlan:
    crop: tuple[float, float, float, float] | None = None
    blurs: list[tuple[float, float, float, float]] = field(default_factory=list)


class RoadleImageCreator(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Roadle Image Creator")
        self.geometry("1220x820")
        self.minsize(980, 680)

        self.source_path: Path | None = None
        self.source_image: Image.Image | None = None
        self.display_image: Image.Image | None = None
        self.display_photo: ImageTk.PhotoImage | None = None
        self.preview_photo: ImageTk.PhotoImage | None = None
        self.canvas_scale = 1.0
        self.canvas_offset = (0, 0)

        self.global_blurs: list[tuple[float, float, float, float]] = []
        self.plans = {key: ImagePlan() for key in IMAGE_KEYS}
        self.selected_key = tk.StringVar(value="reveal-1")
        self.edit_mode = tk.StringVar(value="crop")
        self.output_root = tk.StringVar(value=str(DEFAULT_OUTPUT_ROOT))
        self.puzzle_id = tk.StringVar(value="")
        self.status = tk.StringVar(value="Load a source photo to begin.")
        self.mode_title = tk.StringVar(value="")
        self.mode_detail = tk.StringVar(value="")

        self._drag_start: tuple[float, float] | None = None
        self._drag_original_crop: tuple[float, float, float, float] | None = None
        self._drag_kind = "draw"

        self._build_ui()
        self.edit_mode.trace_add("write", self._on_mode_changed)
        self.selected_key.trace_add("write", self._on_mode_changed)
        self._sync_mode_state()
        self.bind("<Configure>", lambda _event: self._redraw_canvas())

    def _build_ui(self) -> None:
        self._configure_styles()

        self.configure(bg="#eef0ed")
        toolbar = ttk.Frame(self, padding=(12, 10), style="App.TFrame")
        toolbar.pack(side=tk.TOP, fill=tk.X)

        ttk.Button(toolbar, text="Load Photo", command=self.load_photo, style="Primary.TButton").pack(side=tk.LEFT)
        ttk.Label(toolbar, text="Puzzle id", style="Muted.TLabel").pack(side=tk.LEFT, padx=(14, 4))
        ttk.Entry(toolbar, textvariable=self.puzzle_id, width=32, style="Modern.TEntry").pack(side=tk.LEFT)
        ttk.Button(toolbar, text="Use Filename", command=self.use_filename_id).pack(side=tk.LEFT, padx=(6, 0))

        ttk.Label(toolbar, text="Output root", style="Muted.TLabel").pack(side=tk.LEFT, padx=(14, 4))
        ttk.Entry(toolbar, textvariable=self.output_root, width=34, style="Modern.TEntry").pack(side=tk.LEFT)
        ttk.Button(toolbar, text="Browse", command=self.choose_output_root).pack(side=tk.LEFT, padx=(6, 0))
        ttk.Button(toolbar, text="Export WebP Set", command=self.export_set, style="Accent.TButton").pack(side=tk.RIGHT)

        main = ttk.PanedWindow(self, orient=tk.HORIZONTAL, style="App.TPanedwindow")
        main.pack(fill=tk.BOTH, expand=True, padx=12, pady=(0, 10))

        left = ttk.Frame(main, style="Panel.TFrame")
        right = ttk.Frame(main, width=330, style="App.TFrame")
        main.add(left, weight=4)
        main.add(right, weight=1)

        self.mode_banner = tk.Label(
            left,
            textvariable=self.mode_title,
            anchor=tk.W,
            padx=14,
            pady=9,
            font=("Segoe UI", 11, "bold"),
        )
        self.mode_banner.pack(side=tk.TOP, fill=tk.X)
        self.canvas = tk.Canvas(left, bg="#151716", highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        self.canvas.bind("<ButtonPress-1>", self.on_mouse_down)
        self.canvas.bind("<B1-Motion>", self.on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_mouse_up)
        self.canvas.bind("<MouseWheel>", self.on_mouse_wheel)

        controls = ttk.Frame(right, padding=(14, 2), style="App.TFrame")
        controls.pack(fill=tk.BOTH, expand=True)

        mode_card = ttk.Frame(controls, padding=12, style="Card.TFrame")
        mode_card.pack(fill=tk.X, pady=(0, 12))
        ttk.Label(mode_card, text="Active mode", style="Muted.TLabel").pack(anchor=tk.W)
        self.mode_card_label = tk.Label(
            mode_card,
            textvariable=self.mode_title,
            anchor=tk.W,
            padx=0,
            pady=2,
            font=("Segoe UI", 12, "bold"),
            bg="#ffffff",
        )
        self.mode_card_label.pack(fill=tk.X)
        ttk.Label(mode_card, textvariable=self.mode_detail, wraplength=280, justify=tk.LEFT, style="CardMuted.TLabel").pack(anchor=tk.W)

        ttk.Label(controls, text="Step 1: global logo blur", style="Section.TLabel").pack(anchor=tk.W)
        ttk.Button(controls, text="Enter Global Blur Mode", command=lambda: self.edit_mode.set("global_blur"), style="Warning.TButton").pack(fill=tk.X, pady=(6, 4))
        ttk.Button(controls, text="Undo Global Blur", command=self.undo_global_blur).pack(fill=tk.X)

        ttk.Separator(controls).pack(fill=tk.X, pady=12)
        ttk.Label(controls, text="Step 2: selected image", style="Section.TLabel").pack(anchor=tk.W)
        grid = ttk.Frame(controls, style="App.TFrame")
        grid.pack(fill=tk.X, pady=(4, 6))
        for index, key in enumerate(IMAGE_KEYS):
            ttk.Radiobutton(
                grid,
                text=key,
                value=key,
                variable=self.selected_key,
                command=self.on_selected_key_changed,
            ).grid(row=index // 2, column=index % 2, sticky=tk.W, padx=(0, 8), pady=2)

        mode_row = ttk.Frame(controls, style="App.TFrame")
        mode_row.pack(fill=tk.X)
        ttk.Radiobutton(mode_row, text="Crop", value="crop", variable=self.edit_mode).pack(side=tk.LEFT)
        ttk.Radiobutton(mode_row, text="Blur", value="reveal_blur", variable=self.edit_mode).pack(side=tk.LEFT, padx=(14, 0))

        ttk.Button(controls, text="Copy Previous Crop", command=self.copy_previous_crop).pack(fill=tk.X, pady=(8, 4))
        ttk.Button(controls, text="Set Crop To Full 4:3", command=self.set_current_full_crop).pack(fill=tk.X)
        ttk.Button(controls, text="Undo Selected Blur", command=self.undo_selected_blur).pack(fill=tk.X)
        ttk.Button(controls, text="Suggest Progressive Crops", command=self.suggest_crops).pack(fill=tk.X, pady=(4, 0))

        ttk.Separator(controls).pack(fill=tk.X, pady=12)
        ttk.Label(controls, text="Preview", style="Section.TLabel").pack(anchor=tk.W)
        self.preview_canvas = tk.Canvas(controls, width=280, height=210, bg="#151716", highlightthickness=0)
        self.preview_canvas.pack(fill=tk.X, pady=(4, 8))

        ttk.Label(
            controls,
            text=(
                "Draw rectangles on the image. In crop mode, drag inside the crop to move it "
                "or use the mouse wheel to resize."
            ),
            wraplength=280,
            justify=tk.LEFT,
            style="Muted.TLabel",
        ).pack(anchor=tk.W)

        status_bar = ttk.Label(self, textvariable=self.status, padding=(12, 6), anchor=tk.W, style="Status.TLabel")
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def _configure_styles(self) -> None:
        style = ttk.Style(self)
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass
        style.configure("App.TFrame", background="#eef0ed")
        style.configure("Panel.TFrame", background="#151716")
        style.configure("Card.TFrame", background="#ffffff", relief=tk.FLAT)
        style.configure("TLabel", background="#eef0ed", foreground="#1f2523", font=("Segoe UI", 10))
        style.configure("Section.TLabel", background="#eef0ed", foreground="#1f2523", font=("Segoe UI", 10, "bold"))
        style.configure("Muted.TLabel", background="#eef0ed", foreground="#66716d", font=("Segoe UI", 9))
        style.configure("CardMuted.TLabel", background="#ffffff", foreground="#66716d", font=("Segoe UI", 9))
        style.configure("Status.TLabel", background="#dde3df", foreground="#33413c", font=("Segoe UI", 9))
        style.configure("TButton", padding=(10, 6), font=("Segoe UI", 9))
        style.configure("Primary.TButton", background="#22312c", foreground="#ffffff")
        style.map("Primary.TButton", background=[("active", "#31463f")])
        style.configure("Accent.TButton", background="#2f7d67", foreground="#ffffff")
        style.map("Accent.TButton", background=[("active", "#3c9a80")])
        style.configure("Warning.TButton", background="#f0b84d", foreground="#241a05")
        style.map("Warning.TButton", background=[("active", "#f6c76d")])
        style.configure("Modern.TEntry", fieldbackground="#ffffff", bordercolor="#cbd3cf", lightcolor="#cbd3cf", darkcolor="#cbd3cf")
        style.configure("TRadiobutton", background="#eef0ed", foreground="#27302d", font=("Segoe UI", 9))

    def load_photo(self) -> None:
        path = filedialog.askopenfilename(
            title="Choose source photo",
            filetypes=[
                ("Images", "*.jpg *.jpeg *.png *.webp *.bmp *.tif *.tiff"),
                ("All files", "*.*"),
            ],
        )
        if not path:
            return
        try:
            image = Image.open(path).convert("RGB")
        except Exception as exc:
            messagebox.showerror("Could not load image", str(exc))
            return

        self.source_path = Path(path)
        self.source_image = image
        self.global_blurs.clear()
        self.plans = {key: ImagePlan(crop=self._default_full_crop()) for key in IMAGE_KEYS}
        self.use_filename_id()
        self.status.set(f"Loaded {self.source_path.name} ({image.width}x{image.height}).")
        self._redraw_canvas()
        self._update_preview()

    def use_filename_id(self) -> None:
        if not self.source_path:
            return
        stem = self.source_path.stem.lower()
        slug = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
        self.puzzle_id.set(slug)

    def choose_output_root(self) -> None:
        path = filedialog.askdirectory(title="Choose output root")
        if path:
            self.output_root.set(path)

    def on_selected_key_changed(self) -> None:
        self.edit_mode.set("crop")
        self._redraw_canvas()
        self._update_preview()

    def _on_mode_changed(self, *_args: object) -> None:
        self._sync_mode_state()
        self._redraw_canvas()

    def _sync_mode_state(self) -> None:
        mode = self.edit_mode.get()
        key = self.selected_key.get()
        if mode == "global_blur":
            title = "GLOBAL BLUR MODE"
            detail = "Draw rectangles over badges, logos, or plates. These blurs apply to every exported image."
            bg = "#f0b84d"
            fg = "#241a05"
            cursor = "crosshair"
        elif mode == "reveal_blur":
            if key == "full":
                self.edit_mode.set("crop")
                return
            title = f"{key.upper()} BLUR MODE"
            detail = "Draw rectangles for extra clue masking on only this selected reveal."
            bg = "#ff7a90"
            fg = "#2b0710"
            cursor = "crosshair"
        else:
            title = f"{key.upper()} CROP MODE"
            previous = self._previous_key(key)
            if previous:
                detail = f"The dashed white rectangle is {previous}; use it as the starting reference for this crop."
            else:
                detail = "Draw or move the 4:3 crop. Mouse wheel resizes around the crop center."
            bg = "#5eead4"
            fg = "#082a26"
            cursor = "tcross"

        self.mode_title.set(title)
        self.mode_detail.set(detail)
        if hasattr(self, "mode_banner"):
            self.mode_banner.configure(bg=bg, fg=fg)
        if hasattr(self, "mode_card_label"):
            self.mode_card_label.configure(bg="#ffffff", fg=fg)
        if hasattr(self, "canvas"):
            self.canvas.configure(cursor=cursor)

    def _default_full_crop(self) -> tuple[float, float, float, float] | None:
        if self.source_image is None:
            return None
        width, height = self.source_image.size
        if width / height >= ASPECT:
            crop_h = height
            crop_w = crop_h * ASPECT
        else:
            crop_w = width
            crop_h = crop_w / ASPECT
        x1 = (width - crop_w) / 2
        y1 = (height - crop_h) / 2
        return (x1, y1, x1 + crop_w, y1 + crop_h)

    def set_current_full_crop(self) -> None:
        key = self.selected_key.get()
        self.plans[key].crop = self._default_full_crop()
        self._redraw_canvas()
        self._update_preview()

    def copy_previous_crop(self) -> None:
        key = self.selected_key.get()
        previous = self._previous_key(key)
        if previous is None:
            self.status.set("reveal-1 has no previous crop to copy.")
            return
        crop = self.plans[previous].crop
        if crop is None:
            self.status.set(f"{previous} has no crop to copy.")
            return
        self.plans[key].crop = crop
        self.status.set(f"Copied {previous} crop into {key}. Drag or scroll to expand it.")
        self.edit_mode.set("crop")
        self._redraw_canvas()
        self._update_preview()

    def suggest_crops(self) -> None:
        if self.source_image is None:
            return
        full = self._default_full_crop()
        if full is None:
            return
        x1, y1, x2, y2 = full
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        full_w = x2 - x1
        sizes = [0.18, 0.28, 0.42, 0.65, 0.82, 1.0]
        for key, size in zip(IMAGE_KEYS, sizes):
            crop_w = full_w * size
            crop_h = crop_w / ASPECT
            self.plans[key].crop = self._bounded_crop(cx - crop_w / 2, cy - crop_h / 2, cx + crop_w / 2, cy + crop_h / 2)
        self.status.set("Suggested centered progressive crops. Adjust each reveal as needed.")
        self._redraw_canvas()
        self._update_preview()

    def undo_global_blur(self) -> None:
        if self.global_blurs:
            self.global_blurs.pop()
            self._redraw_canvas()
            self._update_preview()

    def undo_selected_blur(self) -> None:
        plan = self.plans[self.selected_key.get()]
        if plan.blurs:
            plan.blurs.pop()
            self._redraw_canvas()
            self._update_preview()

    def on_mouse_down(self, event: tk.Event) -> None:
        if self.source_image is None:
            return
        point = self._canvas_to_image(event.x, event.y)
        if point is None:
            return
        self._drag_start = point
        self._drag_original_crop = self.plans[self.selected_key.get()].crop
        self._drag_kind = "draw"
        if self.edit_mode.get() == "crop" and self._drag_original_crop and self._point_in_rect(point, self._drag_original_crop):
            self._drag_kind = "move"

    def on_mouse_drag(self, event: tk.Event) -> None:
        if self.source_image is None or self._drag_start is None:
            return
        point = self._canvas_to_image(event.x, event.y, clamp=True)
        if point is None:
            return
        mode = self.edit_mode.get()
        key = self.selected_key.get()
        if mode == "crop":
            if self._drag_kind == "move" and self._drag_original_crop:
                dx = point[0] - self._drag_start[0]
                dy = point[1] - self._drag_start[1]
                x1, y1, x2, y2 = self._drag_original_crop
                self.plans[key].crop = self._bounded_crop(x1 + dx, y1 + dy, x2 + dx, y2 + dy)
            else:
                self.plans[key].crop = self._crop_from_drag(self._drag_start, point)
            self._redraw_canvas()
            self._update_preview()

    def on_mouse_up(self, event: tk.Event) -> None:
        if self.source_image is None or self._drag_start is None:
            return
        point = self._canvas_to_image(event.x, event.y, clamp=True)
        if point is None:
            self._drag_start = None
            return
        mode = self.edit_mode.get()
        if mode in {"global_blur", "reveal_blur"}:
            rect = self._normalized_rect((*self._drag_start, *point))
            if self._rect_is_meaningful(rect):
                if mode == "global_blur":
                    self.global_blurs.append(rect)
                else:
                    self.plans[self.selected_key.get()].blurs.append(rect)
        self._drag_start = None
        self._drag_original_crop = None
        self._redraw_canvas()
        self._update_preview()

    def on_mouse_wheel(self, event: tk.Event) -> None:
        if self.source_image is None or self.edit_mode.get() != "crop":
            return
        key = self.selected_key.get()
        crop = self.plans[key].crop
        if crop is None:
            return
        factor = 0.9 if event.delta > 0 else 1.1
        x1, y1, x2, y2 = crop
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        width = (x2 - x1) * factor
        height = width / ASPECT
        self.plans[key].crop = self._bounded_crop(cx - width / 2, cy - height / 2, cx + width / 2, cy + height / 2)
        self._redraw_canvas()
        self._update_preview()

    def _canvas_to_image(self, x: float, y: float, clamp: bool = False) -> tuple[float, float] | None:
        if self.source_image is None:
            return None
        ox, oy = self.canvas_offset
        ix = (x - ox) / self.canvas_scale
        iy = (y - oy) / self.canvas_scale
        if clamp:
            ix = min(max(ix, 0), self.source_image.width)
            iy = min(max(iy, 0), self.source_image.height)
            return ix, iy
        if 0 <= ix <= self.source_image.width and 0 <= iy <= self.source_image.height:
            return ix, iy
        return None

    def _image_rect_to_canvas(self, rect: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
        ox, oy = self.canvas_offset
        x1, y1, x2, y2 = rect
        return (
            ox + x1 * self.canvas_scale,
            oy + y1 * self.canvas_scale,
            ox + x2 * self.canvas_scale,
            oy + y2 * self.canvas_scale,
        )

    def _redraw_canvas(self) -> None:
        self.canvas.delete("all")
        if self.source_image is None:
            self.canvas.create_text(
                self.canvas.winfo_width() / 2,
                self.canvas.winfo_height() / 2,
                text="Load a source photo",
                fill="#e6e6e6",
                font=("Segoe UI", 18),
            )
            return

        cw = max(1, self.canvas.winfo_width())
        ch = max(1, self.canvas.winfo_height())
        scale = min(cw / self.source_image.width, ch / self.source_image.height)
        dw = max(1, int(self.source_image.width * scale))
        dh = max(1, int(self.source_image.height * scale))
        self.canvas_scale = scale
        self.canvas_offset = ((cw - dw) / 2, (ch - dh) / 2)
        self.display_image = self._apply_blurs(self.source_image, self.global_blurs).resize((dw, dh), Image.Resampling.LANCZOS)
        self.display_photo = ImageTk.PhotoImage(self.display_image)
        self.canvas.create_image(*self.canvas_offset, anchor=tk.NW, image=self.display_photo)

        for rect in self.global_blurs:
            self._draw_rect(rect, "#f6c453", "global blur")

        key = self.selected_key.get()
        previous = self._previous_key(key)
        if self.edit_mode.get() == "crop" and previous:
            previous_crop = self.plans[previous].crop
            if previous_crop:
                self._draw_rect(previous_crop, "#f7f7f4", f"previous: {previous}", width=2, dash=(7, 5))
        plan = self.plans[key]
        if plan.crop:
            self._draw_rect(plan.crop, "#5eead4", key, width=3)
        for rect in plan.blurs:
            self._draw_rect(rect, "#ff7a90", "reveal blur")

        self._draw_canvas_legend()

    def _draw_rect(
        self,
        rect: tuple[float, float, float, float],
        color: str,
        label: str,
        width: int = 2,
        dash: tuple[int, int] | None = None,
    ) -> None:
        x1, y1, x2, y2 = self._image_rect_to_canvas(rect)
        self.canvas.create_rectangle(x1, y1, x2, y2, outline=color, width=width, dash=dash)
        label_id = self.canvas.create_text(x1 + 7, y1 + 7, anchor=tk.NW, text=label, fill=color, font=("Segoe UI", 10, "bold"))
        bbox = self.canvas.bbox(label_id)
        if bbox:
            padding = 4
            bg_id = self.canvas.create_rectangle(
                bbox[0] - padding,
                bbox[1] - padding,
                bbox[2] + padding,
                bbox[3] + padding,
                fill="#151716",
                outline="",
            )
            self.canvas.tag_lower(bg_id, label_id)

    def _draw_canvas_legend(self) -> None:
        if self.source_image is None:
            return
        key = self.selected_key.get()
        previous = self._previous_key(key)
        lines = [f"current: {key}"]
        if self.edit_mode.get() == "crop" and previous:
            lines.append(f"dashed: {previous}")
        if self.edit_mode.get() == "global_blur":
            lines = ["global blur active", "new rectangles affect all exports"]
        text = "  |  ".join(lines)
        label_id = self.canvas.create_text(
            14,
            14,
            anchor=tk.NW,
            text=text,
            fill="#f7f7f4",
            font=("Segoe UI", 10, "bold"),
        )
        bbox = self.canvas.bbox(label_id)
        if bbox:
            bg_id = self.canvas.create_rectangle(
                bbox[0] - 8,
                bbox[1] - 6,
                bbox[2] + 8,
                bbox[3] + 6,
                fill="#151716",
                outline="#45504c",
            )
            self.canvas.tag_lower(bg_id, label_id)

    def _update_preview(self) -> None:
        self.preview_canvas.delete("all")
        if self.source_image is None:
            return
        key = self.selected_key.get()
        try:
            result = self._render_key(key).resize((280, 210), Image.Resampling.LANCZOS)
        except Exception as exc:
            self.preview_canvas.create_text(140, 105, text=str(exc), fill="#eeeeee", width=250)
            return
        self.preview_photo = ImageTk.PhotoImage(result)
        self.preview_canvas.create_image(0, 0, anchor=tk.NW, image=self.preview_photo)

    def _render_key(self, key: str) -> Image.Image:
        if self.source_image is None:
            raise RuntimeError("No source image loaded.")
        plan = self.plans[key]
        if plan.crop is None:
            raise RuntimeError(f"{key} has no crop.")
        if key == "full":
            base = self.source_image.copy()
        else:
            base = self._apply_blurs(self.source_image, self.global_blurs + plan.blurs)
        crop_box = tuple(round(v) for v in plan.crop)
        return base.crop(crop_box).resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)

    def export_set(self) -> None:
        if self.source_image is None:
            messagebox.showwarning("No source", "Load a source photo first.")
            return
        puzzle_id = self.puzzle_id.get().strip()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", puzzle_id):
            messagebox.showwarning("Invalid puzzle id", "Use lowercase letters, numbers, and hyphens only.")
            return
        missing = [key for key, plan in self.plans.items() if plan.crop is None]
        if missing:
            messagebox.showwarning("Missing crops", f"Set crops for: {', '.join(missing)}")
            return

        folder = Path(self.output_root.get()) / puzzle_id
        try:
            folder.mkdir(parents=True, exist_ok=True)
            for key in IMAGE_KEYS:
                image = self._render_key(key)
                image.save(folder / EXPORT_NAMES[key], "WEBP", quality=WEBP_QUALITY, method=6)
        except Exception as exc:
            messagebox.showerror("Export failed", str(exc))
            return
        self.status.set(f"Exported Roadle image set to {folder}")
        messagebox.showinfo("Export complete", f"Saved six WebP files to:\n{folder}")

    def _apply_blurs(self, image: Image.Image, rects: list[tuple[float, float, float, float]]) -> Image.Image:
        if not rects:
            return image.copy()
        result = image.copy()
        for rect in rects:
            x1, y1, x2, y2 = (round(v) for v in self._normalized_rect(rect))
            if x2 <= x1 or y2 <= y1:
                continue
            region = result.crop((x1, y1, x2, y2)).filter(ImageFilter.GaussianBlur(radius=22))
            result.paste(region, (x1, y1))
        return result

    def _crop_from_drag(self, start: tuple[float, float], end: tuple[float, float]) -> tuple[float, float, float, float]:
        x1, y1 = start
        x2, y2 = end
        width = abs(x2 - x1)
        height = abs(y2 - y1)
        if width < 8 or height < 8:
            return self.plans[self.selected_key.get()].crop or self._default_full_crop()
        if width / height > ASPECT:
            width = height * ASPECT
        else:
            height = width / ASPECT
        sx = 1 if x2 >= x1 else -1
        sy = 1 if y2 >= y1 else -1
        return self._bounded_crop(x1, y1, x1 + sx * width, y1 + sy * height)

    def _bounded_crop(self, x1: float, y1: float, x2: float, y2: float) -> tuple[float, float, float, float]:
        if self.source_image is None:
            return (0, 0, 0, 0)
        left, top, right, bottom = self._normalized_rect((x1, y1, x2, y2))
        width = min(right - left, self.source_image.width)
        height = width / ASPECT
        if height > self.source_image.height:
            height = self.source_image.height
            width = height * ASPECT
        left = min(max(left, 0), self.source_image.width - width)
        top = min(max(top, 0), self.source_image.height - height)
        return (left, top, left + width, top + height)

    @staticmethod
    def _normalized_rect(rect: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
        x1, y1, x2, y2 = rect
        return min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)

    @staticmethod
    def _point_in_rect(point: tuple[float, float], rect: tuple[float, float, float, float]) -> bool:
        x, y = point
        x1, y1, x2, y2 = rect
        return x1 <= x <= x2 and y1 <= y <= y2

    @staticmethod
    def _rect_is_meaningful(rect: tuple[float, float, float, float]) -> bool:
        x1, y1, x2, y2 = rect
        return math.hypot(x2 - x1, y2 - y1) > 12 and abs(x2 - x1) > 4 and abs(y2 - y1) > 4

    @staticmethod
    def _previous_key(key: str) -> str | None:
        try:
            index = IMAGE_KEYS.index(key)
        except ValueError:
            return None
        if index <= 0:
            return None
        return IMAGE_KEYS[index - 1]


if __name__ == "__main__":
    app = RoadleImageCreator()
    app.mainloop()
