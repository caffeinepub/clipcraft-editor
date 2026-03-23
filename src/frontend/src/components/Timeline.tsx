import type { Clip, VideoEditorHook } from "@/hooks/useVideoEditor";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Layers,
  Sparkles,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
}

const PIXELS_PER_SECOND = 80;
const GAP_PX = 4; // gap between clips in px (gap-1 = 4px)

function TransitionBadge({
  transition,
  onClick,
}: {
  transition: Clip["transition"];
  onClick: () => void;
}) {
  if (transition === "none") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex-shrink-0 w-2 flex items-center justify-center cursor-pointer"
        title="Cut (tap to change)"
      >
        <div className="w-px h-8 bg-white/15" />
      </button>
    );
  }

  const iconMap: Record<Clip["transition"], React.ElementType> = {
    none: X,
    fade: Layers,
    slideLeft: ArrowLeft,
    slideRight: ArrowRight,
    zoomIn: Expand,
    dissolve: Sparkles,
  };
  const colorMap: Record<Clip["transition"], string> = {
    none: "bg-zinc-700",
    fade: "bg-blue-600",
    slideLeft: "bg-violet-600",
    slideRight: "bg-violet-500",
    zoomIn: "bg-amber-600",
    dissolve: "bg-rose-600",
  };

  const Icon = iconMap[transition];
  const color = colorMap[transition];

  return (
    <motion.button
      type="button"
      initial={{ scale: 0.7 }}
      animate={{ scale: 1 }}
      onClick={onClick}
      className={`flex-shrink-0 w-6 h-6 rounded-full ${color} flex items-center justify-center shadow-md cursor-pointer active:scale-90 transition-transform`}
      title={`${transition} (tap to change)`}
    >
      <Icon className="w-3 h-3 text-white" />
    </motion.button>
  );
}

/** Calculate playhead x offset (in px) from the left of the clips container */
function calcPlayheadX(
  clips: Clip[],
  selectedClipId: string | null,
  currentTime: number,
): number {
  let offsetX = 0;
  for (const clip of clips) {
    const clipWidth = Math.max(80, clip.duration * PIXELS_PER_SECOND);
    if (clip.id === selectedClipId) {
      const progress = clip.duration > 0 ? currentTime / clip.duration : 0;
      offsetX += clipWidth * progress;
      return offsetX;
    }
    // add clip width + gap between clips (transition badge ~8px for none, ~24px for others)
    const badgeWidth = clip.transition === "none" ? 8 : 24;
    offsetX += clipWidth + badgeWidth + GAP_PX;
  }
  return offsetX;
}

export function Timeline({ editor }: Props) {
  const {
    state,
    selectClip,
    removeClip,
    videoRef,
    setCurrentTime,
    setIsPlaying,
  } = editor;
  const scrollRef = useRef<HTMLDivElement>(null);
  const clipsRowRef = useRef<HTMLDivElement>(null);

  function formatDuration(d: number) {
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return m > 0 ? `${m}m${s}s` : `${s}s`;
  }

  const playheadX = calcPlayheadX(
    state.clips,
    state.selectedClipId,
    state.currentTime,
  );

  // Auto-scroll timeline to keep playhead visible while playing
  useEffect(() => {
    if (!state.isPlaying || !scrollRef.current) return;
    const container = scrollRef.current;
    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;
    // 12px is left padding
    const absX = playheadX + 12;
    if (absX > containerRight - 20) {
      container.scrollTo({
        left: absX - container.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [playheadX, state.isPlaying]);

  function handleClipClick(clipId: string) {
    selectClip(clipId);
    // Seek video to beginning of this clip and start playing
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setCurrentTime(0);
      video.play().catch(() => {});
      setIsPlaying(true);
    }
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
          <div className="relative flex items-center h-14" ref={clipsRowRef}>
            {/* Playhead */}
            {state.clips.length > 0 && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{
                  left: `${playheadX}px`,
                  transform: "translateX(-50%)",
                }}
              >
                {/* Knob */}
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg mx-auto -mt-1 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                {/* Line */}
                <div className="w-0.5 bg-primary mx-auto h-full opacity-90" />
              </div>
            )}

            <AnimatePresence>
              {state.clips.map((clip, index) => (
                <div key={clip.id} className="flex items-center">
                  <motion.div
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
                    onClick={() => handleClipClick(clip.id)}
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

                    {/* Progress fill overlay for playing clip */}
                    {state.selectedClipId === clip.id && clip.duration > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/20 pointer-events-none"
                        style={{
                          width: `${Math.min(100, (state.currentTime / clip.duration) * 100)}%`,
                          transition: "width 0.1s linear",
                        }}
                      />
                    )}

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

                  {/* Transition badge between clips */}
                  {index < state.clips.length - 1 && (
                    <TransitionBadge
                      transition={clip.transition}
                      onClick={() => selectClip(clip.id)}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>

            {/* End cap */}
            <div className="h-full w-16 flex-shrink-0 border-2 border-dashed border-white/10 rounded-md flex items-center justify-center ml-1">
              <span className="text-[10px] text-white/20">+</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
