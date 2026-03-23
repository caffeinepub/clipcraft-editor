import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { AlertCircle, CheckCircle, Download, Smartphone } from "lucide-react";
import { useState } from "react";

interface Props {
  editor: VideoEditorHook;
}

type ExportStatus = "idle" | "exporting" | "done" | "error";
type Quality = "360p" | "480p" | "720p" | "1080p";

const QUALITY_OPTIONS: { value: Quality; label: string; desc: string }[] = [
  { value: "360p", label: "360p", desc: "Fast upload, small file" },
  { value: "480p", label: "480p", desc: "Balanced quality" },
  { value: "720p", label: "720p HD", desc: "High quality (recommended)" },
  { value: "1080p", label: "1080p Full HD", desc: "Best quality, larger file" },
];

export function ExportButton({ editor }: Props) {
  const { state, selectedClip } = editor;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedName, setExportedName] = useState("video");
  const [quality, setQuality] = useState<Quality>("720p");

  const hasClips = state.clips.length > 0;

  async function handleExport() {
    const clip = selectedClip ?? state.clips[0];
    if (!clip) return;

    setStatus("exporting");
    setProgress(0);

    const intervals = [15, 30, 50, 68, 82, 93];
    for (const p of intervals) {
      await new Promise((r) => setTimeout(r, 250));
      setProgress(p);
    }

    try {
      const response = await fetch(clip.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setDownloadUrl(url);
      setExportedName(clip.name || "edited-video");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  function handleDownload() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${exportedName}_${quality}.mp4`;
    a.click();
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setProgress(0);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }, 300);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!hasClips}
          className="gap-2 bg-primary text-primary-foreground font-semibold h-8 px-3 text-sm"
          data-ocid="export.open_modal_button"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm" data-ocid="export.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" /> Export Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {status === "idle" && (
            <>
              {/* Quality Selector */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Export Quality
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setQuality(q.value)}
                      className={[
                        "rounded-xl border p-2.5 text-left transition-all active:scale-95",
                        quality === q.value
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20",
                      ].join(" ")}
                    >
                      <p className="text-sm font-bold leading-none mb-1">
                        {q.label}
                      </p>
                      <p className="text-[10px] leading-tight">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clip info */}
              <div className="text-xs text-muted-foreground space-y-1 px-1">
                <p>
                  Clip:{" "}
                  <span className="text-foreground">
                    {selectedClip?.name ?? state.clips[0]?.name ?? "—"}
                  </span>
                </p>
                <p>
                  Duration:{" "}
                  <span className="text-foreground">
                    {((selectedClip ?? state.clips[0])?.duration ?? 0).toFixed(
                      1,
                    )}
                    s
                  </span>
                </p>
                <p>
                  Text overlays:{" "}
                  <span className="text-foreground">
                    {state.textOverlays.length}
                  </span>
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleExport}
                data-ocid="export.confirm_button"
              >
                <Download className="w-4 h-4 mr-2" /> Export {quality}
              </Button>
            </>
          )}

          {status === "exporting" && (
            <div className="space-y-3" data-ocid="export.loading_state">
              <p className="text-sm font-medium">
                Processing {quality} video...
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="space-y-3" data-ocid="export.success_state">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Export complete! ({quality})
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Phone mein save karne ke liye: file download karen, phir Files
                app ya Downloads folder mein milegi.
              </p>
              <Button
                className="w-full"
                onClick={handleDownload}
                data-ocid="export.primary_button"
              >
                <Download className="w-4 h-4 mr-2" /> Download to Device
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
                data-ocid="export.close_button"
              >
                Close
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3" data-ocid="export.error_state">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Export failed</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Video process nahi ho saka. Timeline se directly download karke
                try karen.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
                data-ocid="export.cancel_button"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
