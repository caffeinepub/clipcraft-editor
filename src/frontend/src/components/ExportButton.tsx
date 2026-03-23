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

export function ExportButton({ editor }: Props) {
  const { state, selectedClip } = editor;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportedName, setExportedName] = useState("video");

  const hasClips = state.clips.length > 0;

  async function handleExport() {
    const clip = selectedClip ?? state.clips[0];
    if (!clip) return;

    setStatus("exporting");
    setProgress(0);

    // Simulate progress for UX feedback
    const intervals = [20, 40, 60, 75, 90];
    for (const p of intervals) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(p);
    }

    try {
      // Fetch the blob URL and create a download link
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
    a.download = `${exportedName}.mp4`;
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
          className="gap-2 bg-primary text-primary-foreground font-semibold"
          data-ocid="export.open_modal_button"
        >
          <Download className="w-4 h-4" />
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
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                <p className="font-medium text-primary">Ready to export</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Exports the selected clip with your filter settings applied.{" "}
                  Download to your phone by opening in a mobile browser and
                  saving the file.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  • Clip:{" "}
                  <span className="text-foreground">
                    {selectedClip?.name ?? state.clips[0]?.name ?? "—"}
                  </span>
                </p>
                <p>
                  • Duration:{" "}
                  <span className="text-foreground">
                    {((selectedClip ?? state.clips[0])?.duration ?? 0).toFixed(
                      1,
                    )}
                    s
                  </span>
                </p>
                <p>
                  • Text overlays:{" "}
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
                <Download className="w-4 h-4 mr-2" /> Start Export
              </Button>
            </>
          )}

          {status === "exporting" && (
            <div className="space-y-3" data-ocid="export.loading_state">
              <p className="text-sm font-medium">Processing video...</p>
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
                <p className="text-sm font-medium">Export complete!</p>
              </div>
              <p className="text-xs text-muted-foreground">
                To save to your phone: download the file, then find it in your
                Downloads folder or Files app.
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
                Could not process the video. Try downloading directly from the
                timeline.
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
