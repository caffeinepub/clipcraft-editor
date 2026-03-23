import type { Clip, VideoEditorHook } from "@/hooks/useVideoEditor";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  editor: VideoEditorHook;
}

type TransitionId = Clip["transition"];

const TRANSITIONS: {
  id: TransitionId;
  label: string;
  icon: React.ElementType | null;
  color: string;
  preview: string;
}[] = [
  {
    id: "none",
    label: "Cut",
    icon: X,
    color: "bg-zinc-700",
    preview: "border-r-2 border-white/40",
  },
  {
    id: "fade",
    label: "Fade",
    icon: Layers,
    color: "bg-blue-600",
    preview: "",
  },
  {
    id: "slideLeft",
    label: "Slide ←",
    icon: ArrowLeft,
    color: "bg-violet-600",
    preview: "",
  },
  {
    id: "slideRight",
    label: "Slide →",
    icon: ArrowRight,
    color: "bg-violet-500",
    preview: "",
  },
  {
    id: "zoomIn",
    label: "Zoom In",
    icon: Expand,
    color: "bg-amber-600",
    preview: "",
  },
  {
    id: "dissolve",
    label: "Dissolve",
    icon: Sparkles,
    color: "bg-rose-600",
    preview: "",
  },
];

export function TransitionPanel({ editor }: Props) {
  const { selectedClip, updateClipTransition } = editor;

  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center mb-1">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground/80">
          No clip selected
        </p>
        <p className="text-xs text-muted-foreground">
          Tap a clip in the timeline, then pick a transition
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Transition out of{" "}
        <span className="text-primary font-medium">{selectedClip.name}</span>
      </p>

      <div className="grid grid-cols-3 gap-2">
        {TRANSITIONS.map((t, i) => {
          const isActive = selectedClip.transition === t.id;
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              type="button"
              data-ocid={`transitions.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => updateClipTransition(selectedClip.id, t.id)}
              className={[
                "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all active:scale-95",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-card hover:border-white/25",
              ].join(" ")}
            >
              {/* Mini preview box */}
              <div className="w-full h-10 rounded-lg overflow-hidden relative bg-zinc-900 flex">
                <div className="flex-1 bg-zinc-700 rounded-l-lg" />
                <TransitionPreviewBox transitionId={t.id} color={t.color} />
                <div className="flex-1 bg-zinc-600 rounded-r-lg" />
              </div>

              <div className="flex items-center gap-1">
                {Icon && (
                  <Icon
                    className={`w-3 h-3 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                )}
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function TransitionPreviewBox({
  transitionId,
  color,
}: {
  transitionId: TransitionId;
  color: string;
}) {
  // Render a small animated visual for the transition type
  if (transitionId === "none") {
    return <div className="w-0.5 bg-white/40 self-stretch" />;
  }
  if (transitionId === "fade") {
    return (
      <div
        className="w-4 self-stretch"
        style={{
          background:
            "linear-gradient(to right, oklch(0.35 0 0 / 0%), oklch(0.55 0.18 240 / 80%), oklch(0.35 0 0 / 0%))",
        }}
      />
    );
  }
  if (transitionId === "slideLeft" || transitionId === "slideRight") {
    const dir = transitionId === "slideLeft" ? "←" : "→";
    return (
      <div
        className={`w-4 self-stretch flex items-center justify-center text-[8px] text-white/80 font-bold ${color} opacity-70`}
      >
        {dir}
      </div>
    );
  }
  if (transitionId === "zoomIn") {
    return (
      <div
        className={`w-4 self-stretch flex items-center justify-center ${color} opacity-70`}
      >
        <div
          className="w-2 h-2 border border-white/70 rounded-sm"
          style={{ transform: "scale(1.3)" }}
        />
      </div>
    );
  }
  if (transitionId === "dissolve") {
    return (
      <div
        className="w-4 self-stretch"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(0.6 0.2 10 / 70%), transparent)",
        }}
      />
    );
  }
  return null;
}
