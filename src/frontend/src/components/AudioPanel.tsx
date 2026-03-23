import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Music, Trash2, Upload, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
}

export function AudioPanel({ editor }: Props) {
  const { state, setAudioTrack, updateAudioVolume, removeAudioTrack } = editor;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open file picker on mount when no track exists
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only, intentional
  useEffect(() => {
    if (!state.audioTrack) {
      const t = setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
      return () => clearTimeout(t);
    }
  }, []);

  function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setAudioTrack(files[0]);
  }

  const track = state.audioTrack;

  function VolumeIcon() {
    if (!track || track.volume === 0) return <VolumeX className="w-4 h-4" />;
    if (track.volume < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {!track ? (
        <div
          className="flex flex-col items-center gap-2 py-4 text-muted-foreground"
          data-ocid="audio.empty_state"
        >
          <Music className="w-7 h-7 opacity-25" />
          <p className="text-xs text-center text-muted-foreground/60">
            No music added yet
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-card border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{track.name}</p>
              <p className="text-xs text-muted-foreground">Audio track</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={removeAudioTrack}
              data-ocid="audio.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <VolumeIcon /> Volume
              </Label>
              <span className="text-xs font-mono text-primary">
                {track.volume}%
              </span>
            </div>
            <Slider
              value={[track.volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => updateAudioVolume(v[0])}
              data-ocid="audio.volume_slider"
            />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/aac,audio/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        data-ocid="audio.secondary_button"
      >
        <Upload className="w-3 h-3" />
        {track ? "Replace audio" : "Browse files..."}
      </button>
    </div>
  );
}
