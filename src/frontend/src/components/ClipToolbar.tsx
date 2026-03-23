import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import {
  Crop,
  Gauge,
  Scissors,
  Trash2,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Props {
  editor: VideoEditorHook;
}

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;

export function ClipToolbar({ editor }: Props) {
  const {
    selectedClip,
    removeClip,
    updateClipMuted,
    updateClipSpeed,
    updateClipVolume,
    splitClip,
    trimClip,
  } = editor;

  const [splitTime, setSplitTime] = useState<number | null>(null);
  const [trimStart, setTrimStart] = useState<number | null>(null);
  const [trimEnd, setTrimEnd] = useState<number | null>(null);

  const clipDuration = selectedClip?.duration ?? 0;
  const resolvedSplit = splitTime ?? clipDuration / 2;
  const resolvedTrimStart = trimStart ?? selectedClip?.startOffset ?? 0;
  const resolvedTrimEnd = trimEnd ?? selectedClip?.endOffset ?? clipDuration;

  return (
    <AnimatePresence>
      {selectedClip && (
        <motion.div
          key="clip-toolbar"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 px-3 py-1.5 border-t border-white/5 bg-zinc-900/90 backdrop-blur-sm overflow-x-auto"
          data-ocid="clip.panel"
        >
          {/* Mute toggle */}
          <button
            type="button"
            onClick={() =>
              updateClipMuted(selectedClip.id, !selectedClip.muted)
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
              selectedClip.muted
                ? "bg-red-600/20 text-red-400"
                : "hover:bg-white/5 text-muted-foreground"
            }`}
            data-ocid="clip.toggle"
          >
            {selectedClip.muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {selectedClip.muted ? "Unmute" : "Mute"}
          </button>

          {/* Speed */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors shrink-0"
                data-ocid="clip.button"
              >
                <Gauge className="w-4 h-4" />
                Speed
                {selectedClip.speed !== 1 && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] bg-primary text-primary-foreground rounded-full w-3 h-3 flex items-center justify-center leading-none">
                    {selectedClip.speed}x
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className="w-auto p-1.5 bg-zinc-900 border-white/10"
              data-ocid="clip.popover"
            >
              <div className="flex gap-1">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateClipSpeed(selectedClip.id, s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedClip.speed === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Volume */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors shrink-0"
                data-ocid="clip.secondary_button"
              >
                {selectedClip.volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : selectedClip.volume < 50 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                Vol {selectedClip.volume}%
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className="w-40 p-3 bg-zinc-900 border-white/10"
              data-ocid="clip.popover"
            >
              <p className="text-[10px] text-muted-foreground mb-2">
                Clip Volume
              </p>
              <Slider
                value={[selectedClip.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => updateClipVolume(selectedClip.id, v[0])}
                data-ocid="clip.input"
              />
            </PopoverContent>
          </Popover>

          {/* Split */}
          <Popover
            onOpenChange={(open) => {
              if (open) setSplitTime(null);
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors shrink-0"
                data-ocid="clip.button"
              >
                <Scissors className="w-4 h-4" />
                Split
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className="w-56 p-3 bg-zinc-900 border-white/10"
              data-ocid="clip.popover"
            >
              <p className="text-[10px] text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Split Clip
              </p>
              <p className="text-xs text-foreground mb-2">
                Split at:{" "}
                <span className="text-primary font-semibold">
                  {resolvedSplit.toFixed(1)}s
                </span>
              </p>
              <Slider
                value={[resolvedSplit]}
                min={0}
                max={clipDuration}
                step={0.1}
                onValueChange={(v) => setSplitTime(v[0])}
                className="mb-3"
                data-ocid="clip.input"
              />
              {/* Visual split indicator */}
              <div className="relative h-6 bg-white/10 rounded mb-3 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-primary/40"
                  style={{
                    width: `${(resolvedSplit / Math.max(clipDuration, 0.01)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary"
                  style={{
                    left: `${(resolvedSplit / Math.max(clipDuration, 0.01)) * 100}%`,
                  }}
                />
              </div>
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => splitClip(selectedClip.id, resolvedSplit)}
                data-ocid="clip.confirm_button"
              >
                <Scissors className="w-3 h-3 mr-1" /> Split Here
              </Button>
            </PopoverContent>
          </Popover>

          {/* Trim */}
          <Popover
            onOpenChange={(open) => {
              if (open) {
                setTrimStart(null);
                setTrimEnd(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors shrink-0"
                data-ocid="clip.button"
              >
                <Crop className="w-4 h-4" />
                Trim
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className="w-60 p-3 bg-zinc-900 border-white/10"
              data-ocid="clip.popover"
            >
              <p className="text-[10px] text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Trim Clip
              </p>

              {/* Range visual bar */}
              <div className="relative h-6 bg-white/10 rounded mb-3 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-primary/30"
                  style={{
                    left: `${(resolvedTrimStart / Math.max(clipDuration, 0.01)) * 100}%`,
                    width: `${((resolvedTrimEnd - resolvedTrimStart) / Math.max(clipDuration, 0.01)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-green-400 rounded"
                  style={{
                    left: `${(resolvedTrimStart / Math.max(clipDuration, 0.01)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-red-400 rounded"
                  style={{
                    left: `${(resolvedTrimEnd / Math.max(clipDuration, 0.01)) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Start:{" "}
                    <span className="text-green-400 font-semibold">
                      {resolvedTrimStart.toFixed(1)}s
                    </span>
                  </p>
                  <Slider
                    value={[resolvedTrimStart]}
                    min={0}
                    max={resolvedTrimEnd - 0.1}
                    step={0.1}
                    onValueChange={(v) => setTrimStart(v[0])}
                    data-ocid="clip.input"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    End:{" "}
                    <span className="text-red-400 font-semibold">
                      {resolvedTrimEnd.toFixed(1)}s
                    </span>
                  </p>
                  <Slider
                    value={[resolvedTrimEnd]}
                    min={resolvedTrimStart + 0.1}
                    max={clipDuration}
                    step={0.1}
                    onValueChange={(v) => setTrimEnd(v[0])}
                    data-ocid="clip.input"
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-2">
                Duration: {(resolvedTrimEnd - resolvedTrimStart).toFixed(1)}s
              </p>

              <Button
                size="sm"
                className="w-full h-7 text-xs mt-3"
                onClick={() =>
                  trimClip(selectedClip.id, resolvedTrimStart, resolvedTrimEnd)
                }
                data-ocid="clip.save_button"
              >
                <Crop className="w-3 h-3 mr-1" /> Apply Trim
              </Button>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          {/* Delete */}
          <button
            type="button"
            onClick={() => removeClip(selectedClip.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-red-600/20 text-muted-foreground hover:text-red-400 transition-colors shrink-0"
            data-ocid="clip.delete_button"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
