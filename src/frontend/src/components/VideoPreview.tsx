import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Pause, Play, SkipBack, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
  mobile?: boolean;
}

const animationMap: Record<string, string> = {
  bounce: "sticker-bounce 0.8s ease-in-out infinite",
  pulse: "sticker-pulse 1s ease-in-out infinite",
  spin: "sticker-spin 2s linear infinite",
  shake: "sticker-shake 0.5s ease-in-out infinite",
  float: "sticker-float 2s ease-in-out infinite",
  none: "none",
};

export function VideoPreview({ editor, mobile = false }: Props) {
  const {
    state,
    selectedClip,
    videoRef,
    audioRef,
    setIsPlaying,
    setCurrentTime,
    updateClipMuted,
  } = editor;
  const progressRef = useRef<number>(0);

  const filterStyle = selectedClip
    ? `brightness(${selectedClip.filters.brightness}%) contrast(${selectedClip.filters.contrast}%) saturate(${selectedClip.filters.saturation}%) blur(${selectedClip.filters.blur}px)`
    : undefined;

  function togglePlay() {
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
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    progressRef.current = v.currentTime;
  }

  function handleEnded() {
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  const clipId = selectedClip?.id ?? null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: clipId is the intentional trigger
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [clipId, videoRef, setIsPlaying, setCurrentTime]);

  // Apply speed and volume to video element when clip or values change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedClip) return;
    video.playbackRate = selectedClip.speed;
    video.volume = selectedClip.volume / 100;
    video.muted = selectedClip.muted;
  }, [selectedClip?.speed, selectedClip?.volume, selectedClip?.muted, clipId]);

  const duration = selectedClip?.duration ?? 0;
  const progress = duration > 0 ? (state.currentTime / duration) * 100 : 0;

  function handleSeek(val: number[]) {
    const newTime = (val[0] / 100) * duration;
    if (videoRef.current) videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (mobile) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* Video area */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          {selectedClip ? (
            <>
              {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded content */}
              <video
                ref={videoRef}
                src={selectedClip.url}
                className="w-full h-full object-contain"
                style={{ filter: filterStyle }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                playsInline
              />
              {state.textOverlays.map((t) => (
                <div
                  key={t.id}
                  className="absolute pointer-events-none select-none"
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: `${t.fontSize}px`,
                    color: t.color,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
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
                    animation: animationMap[s.animation] ?? "none",
                  }}
                >
                  {s.emoji}
                </div>
              ))}
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
      <div className="relative flex-1 flex items-center justify-center bg-zinc-950 min-h-0">
        {selectedClip ? (
          <>
            {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded content */}
            <video
              ref={videoRef}
              src={selectedClip.url}
              className="max-h-full max-w-full object-contain"
              style={{ filter: filterStyle }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              playsInline
            />
            {state.textOverlays.map((t) => (
              <div
                key={t.id}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${t.fontSize}px`,
                  color: t.color,
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
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
                  animation: animationMap[s.animation] ?? "none",
                }}
              >
                {s.emoji}
              </div>
            ))}
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
