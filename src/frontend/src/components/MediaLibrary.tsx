import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Film, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
}

export function MediaLibrary({ editor }: Props) {
  const { state, addClips, selectClip } = editor;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-open file picker on first mount when no clips
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only
  useEffect(() => {
    if (state.clips.length === 0) {
      const t = setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
      return () => clearTimeout(t);
    }
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    addClips(files);
  }

  function formatDuration(d: number) {
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return m > 0
      ? `${m}:${s.toString().padStart(2, "0")}`
      : `0:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Media
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center hover:bg-primary/25 active:scale-90 transition-all"
          data-ocid="media.upload_button"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Clips grid */}
      {state.clips.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {state.clips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all aspect-video ${
                state.selectedClipId === clip.id
                  ? "border-primary"
                  : "border-transparent hover:border-white/20"
              }`}
              onClick={() => selectClip(clip.id)}
              data-ocid={`media.item.${index + 1}`}
            >
              {clip.thumbnailUrl ? (
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Film className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-1 left-1.5 right-1.5">
                <p className="text-[10px] text-white truncate">{clip.name}</p>
                <p className="text-[9px] text-white/50">
                  {formatDuration(clip.duration)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p
          className="text-xs text-muted-foreground/50 text-center py-4"
          data-ocid="media.empty_state"
        >
          Tap + to add videos
        </p>
      )}
    </div>
  );
}
