import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { TextOverlay, VideoEditorHook } from "@/hooks/useVideoEditor";
import { Pause, Play, SkipBack, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
  mobile?: boolean;
}

const stickerAnimationMap: Record<string, string> = {
  bounce: "sticker-bounce 0.8s ease-in-out infinite",
  pulse: "sticker-pulse 1s ease-in-out infinite",
  spin: "sticker-spin 2s linear infinite",
  shake: "sticker-shake 0.5s ease-in-out infinite",
  float: "sticker-float 2s ease-in-out infinite",
  none: "none",
};

const textAnimationMap: Record<TextOverlay["animation"], string> = {
  none: "none",
  fadeIn: "text-fadeIn 1s ease forwards",
  slideUp: "text-slideUp 0.8s ease forwards",
  slideDown: "text-slideDown 0.8s ease forwards",
  bounce: "text-bounce 1s infinite",
  zoomIn: "text-zoomIn 0.6s ease forwards",
  typewriter: "text-typewriter 2s steps(20, end) forwards",
};

function buildFilterStyle(clip: VideoEditorHook["selectedClip"]): string {
  if (!clip) return "";
  const { filters } = clip;
  const parts = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `blur(${filters.blur}px)`,
    `hue-rotate(${filters.hue}deg)`,
  ];
  if (filters.temperature !== 0) {
    parts.push(`sepia(${Math.abs(filters.temperature) * 0.3}%)`);
    parts.push(`saturate(${100 + filters.temperature}%)`);
  }
  if (filters.highlights !== 0) {
    parts.push(`brightness(${100 + filters.highlights * 0.3}%)`);
  }
  return parts.join(" ");
}

function buildCropStyle(
  clip: VideoEditorHook["selectedClip"],
): React.CSSProperties {
  if (!clip) return {};
  const { crop } = clip;
  if (
    crop.top === 0 &&
    crop.left === 0 &&
    crop.right === 0 &&
    crop.bottom === 0
  )
    return {};
  return {
    clipPath: `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`,
  };
}

function buildTextStyle(t: TextOverlay): React.CSSProperties {
  const style: React.CSSProperties = {
    left: `${t.x}%`,
    top: `${t.y}%`,
    transform: "translate(-50%, -50%)",
    fontSize: `${t.fontSize}px`,
    color: t.color,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: t.fontWeight,
    fontStyle: t.fontStyle,
    whiteSpace: "nowrap",
    animation: textAnimationMap[t.animation] ?? "none",
  };

  if (t.animation === "typewriter") {
    style.overflow = "hidden";
    style.display = "inline-block";
    style.maxWidth = "90%";
    style.whiteSpace = "nowrap";
  }

  if (t.shadow) {
    style.textShadow = "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)";
  }

  if (t.background) {
    style.backgroundColor = "rgba(0,0,0,0.55)";
    style.padding = "2px 8px";
    style.borderRadius = "4px";
  }

  if (t.outline) {
    // @ts-ignore webkit property
    (style as any).WebkitTextStroke =
      `1px ${t.color === "#ffffff" ? "#000000" : "#ffffff"}`;
  }

  return style;
}

function getKenBurnsStyle(
  kenBurns: string | undefined,
  duration: number,
): React.CSSProperties {
  if (!kenBurns || kenBurns === "none") return {};
  const animDuration = `${duration}s`;
  const animMap: Record<string, string> = {
    zoomIn: `kb-zoomIn ${animDuration} ease-in-out forwards`,
    zoomOut: `kb-zoomOut ${animDuration} ease-in-out forwards`,
    panLeft: `kb-panLeft ${animDuration} linear forwards`,
    panRight: `kb-panRight ${animDuration} linear forwards`,
  };
  return { animation: animMap[kenBurns] ?? "none" };
}

function ClipMedia({
  selectedClip,
  videoRef,
  filterStyle,
  cropStyle,
  onTimeUpdate,
  onEnded,
  isPlaying,
}: {
  selectedClip: NonNullable<VideoEditorHook["selectedClip"]>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  filterStyle: string;
  cropStyle: React.CSSProperties;
  onTimeUpdate: () => void;
  onEnded: () => void;
  isPlaying: boolean;
}) {
  const kenBurnsStyle =
    selectedClip.type === "image"
      ? getKenBurnsStyle(selectedClip.kenBurns, selectedClip.duration)
      : {};

  if (selectedClip.type === "image") {
    return (
      <div className="w-full h-full overflow-hidden relative">
        <img
          src={selectedClip.url}
          alt={selectedClip.name}
          key={`${selectedClip.id}-${isPlaying}`}
          className="w-full h-full object-cover"
          style={{
            filter: filterStyle,
            ...cropStyle,
            ...(isPlaying ? kenBurnsStyle : {}),
            transformOrigin: "center center",
          }}
        />
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
    <video
      ref={videoRef}
      src={selectedClip.url}
      className="w-full h-full object-contain"
      style={{ filter: filterStyle, ...cropStyle }}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      playsInline
    />
  );
}

export function VideoPreview({ editor, mobile = false }: Props) {
  const {
    state,
    selectedClip,
    videoRef,
    audioRef,
    setIsPlaying,
    setCurrentTime,
    updateClipMuted,
    advanceToNextClip,
  } = editor;
  const progressRef = useRef<number>(0);
  const imageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filterStyle = buildFilterStyle(selectedClip);
  const cropStyle = buildCropStyle(selectedClip);

  function clearImageTimer() {
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }
    if (imageIntervalRef.current) {
      clearInterval(imageIntervalRef.current);
      imageIntervalRef.current = null;
    }
  }

  function togglePlay() {
    if (selectedClip?.type === "image") {
      if (state.isPlaying) {
        audioRef.current?.pause();
        clearImageTimer();
      } else {
        audioRef.current?.play();
        // Start image timer for auto-advance
        const remaining = (selectedClip.duration - state.currentTime) * 1000;
        const startTime = Date.now();
        const startCurrentTime = state.currentTime;
        imageIntervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          setCurrentTime(
            Math.min(startCurrentTime + elapsed, selectedClip.duration),
          );
        }, 100);
        imageTimerRef.current = setTimeout(() => {
          clearImageTimer();
          advanceToNextClip();
        }, remaining);
      }
      setIsPlaying(!state.isPlaying);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (state.isPlaying) {
      video.pause();
      audioRef.current?.pause();
    } else {
      video.play();
      audioRef.current?.play();
    }
    setIsPlaying(!state.isPlaying);
  }

  function handleRestart() {
    clearImageTimer();
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    progressRef.current = v.currentTime;
  }

  function handleEnded() {
    // Auto-advance to next clip
    advanceToNextClip();
  }

  const clipId = selectedClip?.id ?? null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: clipId is the intentional trigger
  useEffect(() => {
    const video = videoRef.current;
    clearImageTimer();

    if (selectedClip?.type === "image" && state.isPlaying) {
      // Resume timer for new image clip
      const duration = selectedClip.duration * 1000;
      const startTime = Date.now();
      imageIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(Math.min(elapsed, selectedClip.duration));
      }, 100);
      imageTimerRef.current = setTimeout(() => {
        clearImageTimer();
        advanceToNextClip();
      }, duration);
    } else if (selectedClip?.type === "video" && state.isPlaying && video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      if (video) video.pause();
      setCurrentTime(0);
      if (!state.isPlaying) setIsPlaying(false);
    }

    return () => clearImageTimer();
  }, [clipId]);

  // Apply speed and volume to video element when clip or values change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedClip || selectedClip.type === "image") return;
    video.playbackRate = selectedClip.speed;
    video.volume = selectedClip.volume / 100;
    video.muted = selectedClip.muted;
  }, [selectedClip?.speed, selectedClip?.volume, selectedClip?.muted, clipId]);

  const duration = selectedClip?.duration ?? 0;
  const progress = duration > 0 ? (state.currentTime / duration) * 100 : 0;

  function handleSeek(val: number[]) {
    const newTime = (val[0] / 100) * duration;
    if (videoRef.current && selectedClip?.type !== "image")
      videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const overlays = (
    <>
      {state.textOverlays.map((t) => (
        <div
          key={t.id}
          className="absolute pointer-events-none select-none"
          style={buildTextStyle(t)}
        >
          {t.text}
        </div>
      ))}
      {state.stickerOverlays.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: "translate(-50%, -50%)",
            fontSize: `${s.size}px`,
            lineHeight: 1,
            animation: stickerAnimationMap[s.animation] ?? "none",
          }}
        >
          {s.emoji}
        </div>
      ))}
    </>
  );

  const keyframes = `
    @keyframes text-fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes text-slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 24px) ) } to { opacity: 1; transform: translate(-50%, -50%) } }
    @keyframes text-slideDown { from { opacity: 0; transform: translate(-50%, calc(-50% - 24px) ) } to { opacity: 1; transform: translate(-50%, -50%) } }
    @keyframes text-bounce {
      0%, 100% { transform: translate(-50%, -50%) }
      50% { transform: translate(-50%, calc(-50% - 10px)) }
    }
    @keyframes text-zoomIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.4) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
    @keyframes text-typewriter { from { max-width: 0 } to { max-width: 90% } }
    @keyframes kb-zoomIn { from { transform: scale(1); } to { transform: scale(1.25); } }
    @keyframes kb-zoomOut { from { transform: scale(1.25); } to { transform: scale(1); } }
    @keyframes kb-panLeft { from { transform: scale(1.15) translateX(8%); } to { transform: scale(1.15) translateX(-8%); } }
    @keyframes kb-panRight { from { transform: scale(1.15) translateX(-8%); } to { transform: scale(1.15) translateX(8%); } }
  `;

  if (mobile) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        <style>{keyframes}</style>

        {/* Video/Image area */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          {selectedClip ? (
            <>
              <ClipMedia
                selectedClip={selectedClip}
                videoRef={videoRef}
                filterStyle={filterStyle}
                cropStyle={cropStyle}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                isPlaying={state.isPlaying}
              />
              {overlays}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <Play className="w-7 h-7 ml-1 opacity-30" />
              </div>
              <p className="text-sm text-white/40">Upload a video to start</p>
            </div>
          )}
        </div>

        {/* Hidden audio */}
        {state.audioTrack && (
          // biome-ignore lint/a11y/useMediaCaption: background music
          <audio ref={audioRef} src={state.audioTrack.url} loop />
        )}

        {/* Controls overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8">
          {/* Seek bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/70 w-9 text-right tabular-nums">
              {formatTime(state.currentTime)}
            </span>
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={!selectedClip}
              className="flex-1 h-1"
              data-ocid="preview.progress"
            />
            <span className="text-[11px] text-white/70 w-9 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Playback buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleRestart}
              disabled={!selectedClip}
              className="w-10 h-10 flex items-center justify-center text-white/70 disabled:opacity-30 active:scale-90 transition-transform"
              data-ocid="preview.restart_button"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!selectedClip}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-30 active:scale-90 transition-transform"
              data-ocid="preview.toggle_button"
            >
              {state.isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-0.5" />
              )}
            </button>
            <button
              type="button"
              disabled={!selectedClip}
              onClick={() => {
                if (selectedClip)
                  updateClipMuted(selectedClip.id, !selectedClip.muted);
              }}
              className="w-10 h-10 flex items-center justify-center text-white/70 disabled:opacity-30 active:scale-90 transition-transform"
              data-ocid="preview.mute_toggle"
            >
              {selectedClip?.muted ? (
                <VolumeX className="w-5 h-5 text-red-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop fallback
  return (
    <div className="flex flex-col h-full bg-black rounded-xl overflow-hidden border border-white/10">
      <style>{keyframes}</style>
      <div className="relative flex-1 flex items-center justify-center bg-zinc-950 min-h-0">
        {selectedClip ? (
          <>
            <ClipMedia
              selectedClip={selectedClip}
              videoRef={videoRef}
              filterStyle={filterStyle}
              cropStyle={cropStyle}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              isPlaying={state.isPlaying}
            />
            {overlays}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
              <Play className="w-6 h-6 ml-1 opacity-40" />
            </div>
            <p className="text-sm">Upload a video clip to start editing</p>
          </div>
        )}
        {state.audioTrack && (
          // biome-ignore lint/a11y/useMediaCaption: background music
          <audio ref={audioRef} src={state.audioTrack.url} loop />
        )}
      </div>
      <div className="p-3 bg-zinc-900/80 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-10 text-right">
            {formatTime(state.currentTime)}
          </span>
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!selectedClip}
            className="flex-1"
            data-ocid="preview.progress"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            disabled={!selectedClip}
            className="h-8 w-8"
            data-ocid="preview.restart_button"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!selectedClip}
            className="h-10 w-10 bg-primary text-primary-foreground rounded-full"
            data-ocid="preview.toggle_button"
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!selectedClip}
            onClick={() => {
              if (selectedClip)
                updateClipMuted(selectedClip.id, !selectedClip.muted);
            }}
            data-ocid="preview.mute_toggle"
          >
            {selectedClip?.muted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
