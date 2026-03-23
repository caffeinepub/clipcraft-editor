import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Gauge, Trash2, Volume1, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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
  } = editor;

  return (
    <AnimatePresence>
      {selectedClip && (
        <motion.div
          key="clip-toolbar"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 px-3 py-1.5 border-t border-white/5 bg-zinc-900/90 backdrop-blur-sm"
          data-ocid="clip.panel"
        >
          {/* Mute toggle */}
          <button
            type="button"
            onClick={() =>
              updateClipMuted(selectedClip.id, !selectedClip.muted)
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
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
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors"
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
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-white/5 text-muted-foreground transition-colors"
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

          <div className="flex-1" />

          {/* Delete */}
          <button
            type="button"
            onClick={() => removeClip(selectedClip.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium hover:bg-red-600/20 text-muted-foreground hover:text-red-400 transition-colors"
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
