import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TextOverlay, VideoEditorHook } from "@/hooks/useVideoEditor";
import { Plus, Trash2, Type } from "lucide-react";

interface Props {
  editor: VideoEditorHook;
}

function StyleToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 select-none",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-white/10 text-muted-foreground hover:bg-white/15",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

const ANIMATIONS: { value: TextOverlay["animation"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" },
  { value: "slideDown", label: "Slide Down" },
  { value: "bounce", label: "Bounce" },
  { value: "zoomIn", label: "Zoom In" },
  { value: "typewriter", label: "Typewriter" },
];

export function TextEditor({ editor }: Props) {
  const { state, addTextOverlay, updateTextOverlay, removeTextOverlay } =
    editor;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      <Button
        onClick={addTextOverlay}
        className="w-full"
        size="sm"
        data-ocid="text.add_button"
      >
        <Plus className="w-3 h-3 mr-1.5" /> Add Text Overlay
      </Button>

      {state.textOverlays.length === 0 && (
        <div
          className="flex flex-col items-center gap-2 py-6 text-muted-foreground"
          data-ocid="text.empty_state"
        >
          <Type className="w-8 h-8 opacity-30" />
          <p className="text-xs text-center">
            No text overlays yet.
            <br />
            Click &quot;Add Text&quot; to get started.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {state.textOverlays.map((overlay, index) => (
          <div
            key={overlay.id}
            className="p-3 rounded-xl bg-card border border-white/10 space-y-3"
            data-ocid={`text.item.${index + 1}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Text {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => removeTextOverlay(overlay.id)}
                data-ocid={`text.delete_button.${index + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Content</Label>
              <Input
                value={overlay.text}
                onChange={(e) =>
                  updateTextOverlay(overlay.id, { text: e.target.value })
                }
                className="h-8 text-sm"
                placeholder="Enter text..."
                data-ocid={`text.input.${index + 1}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Font Size: {overlay.fontSize}px
                </Label>
                <Slider
                  value={[overlay.fontSize]}
                  min={10}
                  max={80}
                  step={1}
                  onValueChange={(v) =>
                    updateTextOverlay(overlay.id, { fontSize: v[0] })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <input
                  type="color"
                  value={overlay.color}
                  onChange={(e) =>
                    updateTextOverlay(overlay.id, { color: e.target.value })
                  }
                  className="w-full h-8 rounded-md border border-white/10 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Style toggles: Bold, Italic, Shadow, BG, Outline */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Style</Label>
              <div className="flex flex-wrap gap-1.5">
                <StyleToggle
                  active={overlay.fontWeight === "bold"}
                  onClick={() =>
                    updateTextOverlay(overlay.id, {
                      fontWeight:
                        overlay.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                  label="B"
                />
                <StyleToggle
                  active={overlay.fontStyle === "italic"}
                  onClick={() =>
                    updateTextOverlay(overlay.id, {
                      fontStyle:
                        overlay.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                  label="I"
                />
                <StyleToggle
                  active={overlay.shadow}
                  onClick={() =>
                    updateTextOverlay(overlay.id, { shadow: !overlay.shadow })
                  }
                  label="Shadow"
                />
                <StyleToggle
                  active={overlay.background}
                  onClick={() =>
                    updateTextOverlay(overlay.id, {
                      background: !overlay.background,
                    })
                  }
                  label="BG"
                />
                <StyleToggle
                  active={overlay.outline}
                  onClick={() =>
                    updateTextOverlay(overlay.id, { outline: !overlay.outline })
                  }
                  label="Outline"
                />
              </div>
            </div>

            {/* Animation picker */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Animation</Label>
              <div
                className="flex gap-1.5 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {ANIMATIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updateTextOverlay(overlay.id, { animation: value })
                    }
                    className={[
                      "flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 whitespace-nowrap",
                      overlay.animation === value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-white/10 text-muted-foreground hover:bg-white/15",
                    ].join(" ")}
                    data-ocid={`text.animation.${index + 1}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  X Pos: {overlay.x}%
                </Label>
                <Slider
                  value={[overlay.x]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) =>
                    updateTextOverlay(overlay.id, { x: v[0] })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Y Pos: {overlay.y}%
                </Label>
                <Slider
                  value={[overlay.y]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) =>
                    updateTextOverlay(overlay.id, { y: v[0] })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
