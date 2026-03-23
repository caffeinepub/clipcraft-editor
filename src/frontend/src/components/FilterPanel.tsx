import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { RotateCcw, Sliders } from "lucide-react";

interface Props {
  editor: VideoEditorHook;
}

const KEN_BURNS_OPTIONS: {
  value: "none" | "zoomIn" | "zoomOut" | "panLeft" | "panRight";
  label: string;
  icon: string;
}[] = [
  { value: "none", label: "None", icon: "✕" },
  { value: "zoomIn", label: "Zoom In", icon: "🔍" },
  { value: "zoomOut", label: "Zoom Out", icon: "🔭" },
  { value: "panLeft", label: "Pan Left", icon: "⬅" },
  { value: "panRight", label: "Pan Right", icon: "➡" },
];

export function FilterPanel({ editor }: Props) {
  const {
    selectedClip,
    updateClipFilters,
    updateClipKenBurns,
    updateClipDuration,
  } = editor;

  if (!selectedClip) {
    return (
      <div
        className="flex flex-col items-center gap-2 py-6 text-muted-foreground"
        data-ocid="filters.empty_state"
      >
        <Sliders className="w-8 h-8 opacity-30" />
        <p className="text-xs text-center">Select a clip to adjust filters</p>
      </div>
    );
  }

  const { filters } = selectedClip;
  const isImage = selectedClip.type === "image";

  function resetFilters() {
    updateClipFilters(selectedClip!.id, {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      temperature: 0,
      highlights: 0,
      shadows: 0,
    });
  }

  const previewFilter = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `blur(${filters.blur}px)`,
    `hue-rotate(${filters.hue}deg)`,
    `sepia(${Math.abs(filters.temperature) * 0.3}%)`,
    `saturate(${100 + filters.temperature}%)`,
    `brightness(${100 + filters.highlights * 0.3}%)`,
  ].join(" ");

  const currentKenBurns = selectedClip.kenBurns ?? "none";
  const currentDuration = selectedClip.duration;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Adjustments
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground"
          onClick={resetFilters}
          data-ocid="filters.reset_button"
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Preview pill */}
      <div
        className="h-16 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center"
        style={{ filter: previewFilter }}
      >
        {selectedClip.thumbnailUrl ? (
          <img
            src={selectedClip.thumbnailUrl}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-800" />
        )}
      </div>

      {/* Ken Burns Effect — image clips only */}
      {isImage && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest border-t border-white/10 pt-3">
            Image Motion
          </p>
          <div className="grid grid-cols-5 gap-1">
            {KEN_BURNS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateClipKenBurns(selectedClip.id, opt.value)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                  currentKenBurns === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
                data-ocid={`filters.ken_burns_${opt.value}_button`}
              >
                <span className="text-base">{opt.icon}</span>
                <span
                  className="leading-tight text-center"
                  style={{ fontSize: "9px" }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration — image clips only */}
      {isImage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Duration
            </Label>
            <span className="text-xs font-mono text-primary">
              {currentDuration}s
            </span>
          </div>
          <Slider
            value={[currentDuration]}
            min={1}
            max={15}
            step={0.5}
            onValueChange={(v) => updateClipDuration(selectedClip.id, v[0])}
            data-ocid="filters.duration_slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1s</span>
            <span>15s</span>
          </div>
        </div>
      )}

      {/* Basic Adjustments */}
      <div className="space-y-4">
        {[
          {
            key: "brightness" as const,
            label: "Brightness",
            min: 0,
            max: 200,
            value: filters.brightness,
            unit: "%",
          },
          {
            key: "contrast" as const,
            label: "Contrast",
            min: 0,
            max: 200,
            value: filters.contrast,
            unit: "%",
          },
          {
            key: "saturation" as const,
            label: "Saturation",
            min: 0,
            max: 200,
            value: filters.saturation,
            unit: "%",
          },
          {
            key: "blur" as const,
            label: "Blur",
            min: 0,
            max: 20,
            value: filters.blur,
            step: 0.5,
            unit: "px",
          },
        ].map(({ key, label, min, max, value, step, unit }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <span className="text-xs font-mono text-primary">
                {value}
                {unit}
              </span>
            </div>
            <Slider
              value={[value]}
              min={min}
              max={max}
              step={step ?? 1}
              onValueChange={(v) =>
                updateClipFilters(selectedClip.id, { [key]: v[0] })
              }
              data-ocid={`filters.${key}_slider`}
            />
          </div>
        ))}
      </div>

      {/* Color Grading */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest border-t border-white/10 pt-3">
          Color Grading
        </p>
        {[
          {
            key: "hue" as const,
            label: "Hue",
            min: -180,
            max: 180,
            value: filters.hue,
            unit: "°",
          },
          {
            key: "temperature" as const,
            label: "Temperature",
            min: -100,
            max: 100,
            value: filters.temperature,
            unit: "",
          },
          {
            key: "highlights" as const,
            label: "Highlights",
            min: -100,
            max: 100,
            value: filters.highlights,
            unit: "",
          },
          {
            key: "shadows" as const,
            label: "Shadows",
            min: -100,
            max: 100,
            value: filters.shadows,
            unit: "",
          },
        ].map(({ key, label, min, max, value, unit }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <span className="text-xs font-mono text-primary">
                {value > 0 ? `+${value}` : value}
                {unit}
              </span>
            </div>
            <Slider
              value={[value]}
              min={min}
              max={max}
              step={1}
              onValueChange={(v) =>
                updateClipFilters(selectedClip.id, { [key]: v[0] })
              }
              data-ocid={`filters.${key}_slider`}
            />
          </div>
        ))}
      </div>

      {/* Preset filters */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Presets
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "Vivid", b: 110, c: 120, s: 140, bl: 0 },
            { name: "Matte", b: 105, c: 85, s: 70, bl: 0 },
            { name: "B&W", b: 100, c: 110, s: 0, bl: 0 },
            { name: "Warm", b: 105, c: 110, s: 130, bl: 0 },
            { name: "Cool", b: 100, c: 105, s: 85, bl: 0 },
            { name: "Dreamy", b: 105, c: 90, s: 90, bl: 2 },
          ].map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                updateClipFilters(selectedClip.id, {
                  brightness: preset.b,
                  contrast: preset.c,
                  saturation: preset.s,
                  blur: preset.bl,
                })
              }
              className="py-1.5 px-2 rounded-lg bg-secondary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
