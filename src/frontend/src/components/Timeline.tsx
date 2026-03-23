import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

interface Props {
  editor: VideoEditorHook;
}

const PIXELS_PER_SECOND = 80;

export function Timeline({ editor }: Props) {
  const { state, selectClip, removeClip } = editor;
  const scrollRef = useRef<HTMLDivElement>(null);

  function formatDuration(d: number) {
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return m > 0 ? `${m}m${s}s` : `${s}s`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Timeline
        </span>
        <span className="text-xs text-muted-foreground">
          {state.clips.length} clip{state.clips.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-3 py-2 gap-1"
        style={{ minHeight: 0 }}
      >
        {state.clips.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
            Upload clips to build your timeline
          </div>
        ) : (
          <div className="flex items-center gap-1 h-14">
            <AnimatePresence>
              {state.clips.map((clip, index) => (
                <motion.div
                  key={clip.id}
                  initial={{ opacity: 0, scaleX: 0.7 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.7 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: Math.max(80, clip.duration * PIXELS_PER_SECOND),
                  }}
                  className={`relative h-full rounded-md overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                    state.selectedClipId === clip.id
                      ? "border-primary shadow-amber"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => selectClip(clip.id)}
                  data-ocid={`timeline.item.${index + 1}`}
                >
                  {/* Thumbnail bg */}
                  {clip.thumbnailUrl ? (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-800" />
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Mute badge top-left */}
                  {clip.muted && (
                    <div className="absolute top-1 left-1 p-0.5 rounded-sm bg-red-600/80">
                      <VolumeX className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}

                  {/* Speed badge top-center */}
                  {clip.speed !== 1 && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-sm bg-amber-500/80 text-[9px] font-bold text-black leading-none">
                      {clip.speed}x
                    </div>
                  )}

                  {/* Label */}
                  <div className="absolute bottom-1 left-1.5 right-6 flex items-center gap-1">
                    <span className="text-[10px] text-white/90 truncate font-medium">
                      {clip.name}
                    </span>
                    <span className="text-[9px] text-white/50 flex-shrink-0">
                      {formatDuration(clip.duration)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClip(clip.id);
                    }}
                    className="absolute top-1 right-1 p-0.5 rounded-sm bg-black/50 hover:bg-red-600/80 transition-colors"
                    data-ocid={`timeline.delete_button.${index + 1}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* End cap */}
            <div className="h-full w-16 flex-shrink-0 border-2 border-dashed border-white/10 rounded-md flex items-center justify-center">
              <span className="text-[10px] text-white/20">+</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
