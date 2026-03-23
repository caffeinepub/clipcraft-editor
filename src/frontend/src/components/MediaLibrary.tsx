import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { Film, FolderOpen, Image, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Props {
  editor: VideoEditorHook;
}

export function MediaLibrary({ editor }: Props) {
  const { state, addClips, selectClip, removeClip } = editor;
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

  function formatDuration(d: number) {
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return m > 0
      ? `${m}:${s.toString().padStart(2, "0")}`
      : `0:${s.toString().padStart(2, "0")}`;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    addClips(files);
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

      {/* Single file input: video + image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Media grid */}
      {state.clips.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-6 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all active:scale-95"
          data-ocid="media.empty_state"
        >
          <FolderOpen className="w-7 h-7" />
          <p className="text-xs font-medium">Video ya Image add karo</p>
          <p className="text-[10px] opacity-60">
            Dono ek saath select ho sakte hain
          </p>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {state.clips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
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
                  {clip.type === "image" ? (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <Film className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-1 left-1 px-1 py-0.5 rounded-sm bg-black/60 text-[8px] text-white/80 font-medium">
                {clip.type === "image" ? "IMG" : "VID"}
              </div>
              <div className="absolute bottom-1 left-1.5 right-6">
                <p className="text-[10px] text-white truncate">{clip.name}</p>
                <p className="text-[9px] text-white/50">
                  {clip.type === "image" ? "5s" : formatDuration(clip.duration)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeClip(clip.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                data-ocid={`media.delete_button.${index + 1}`}
              >
                <span className="text-white text-[9px] font-bold">✕</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
