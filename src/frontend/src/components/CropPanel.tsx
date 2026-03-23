import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Crop, RotateCcw } from "lucide-react";

interface Props {
  editor: VideoEditorHook;
}

export function CropPanel({ editor }: Props) {
  const { selectedClip, updateClipCrop } = editor;

  if (!selectedClip) {
    return (
      <div
        className="flex flex-col items-center gap-2 py-6 text-muted-foreground"
        data-ocid="crop.empty_state"
      >
        <Crop className="w-8 h-8 opacity-30" />
        <p className="text-xs text-center">Select a clip to crop</p>
      </div>
    );
  }

  const { crop } = selectedClip;

  function resetCrop() {
    updateClipCrop(selectedClip!.id, { top: 0, left: 0, right: 0, bottom: 0 });
  }

  const sides = [
    { key: "top" as const, label: "Top", value: crop.top },
    { key: "bottom" as const, label: "Bottom", value: crop.bottom },
    { key: "left" as const, label: "Left", value: crop.left },
    { key: "right" as const, label: "Right", value: crop.right },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Crop
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground"
          onClick={resetCrop}
          data-ocid="crop.reset_button"
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>

      {/* Visual crop preview */}
      <div className="relative h-24 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
        {selectedClip.thumbnailUrl ? (
          <img
            src={selectedClip.thumbnailUrl}
            alt="crop preview"
            className="w-full h-full object-cover"
            style={{
              clipPath: `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`,
            }}
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-violet-700 to-indigo-900"
            style={{
              clipPath: `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`,
            }}
          />
        )}
        {/* Crop overlay border indicator */}
        <div
          className="absolute border-2 border-primary/70 pointer-events-none rounded"
          style={{
            top: `${crop.top}%`,
            left: `${crop.left}%`,
            right: `${crop.right}%`,
            bottom: `${crop.bottom}%`,
          }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {sides.map(({ key, label, value }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <span className="text-xs font-mono text-primary">{value}%</span>
            </div>
            <Slider
              value={[value]}
              min={0}
              max={50}
              step={1}
              onValueChange={(v) =>
                updateClipCrop(selectedClip.id, { [key]: v[0] })
              }
              data-ocid={`crop.${key}_slider`}
            />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Drag sliders to crop from each side (0–50%)
      </p>
    </div>
  );
}
