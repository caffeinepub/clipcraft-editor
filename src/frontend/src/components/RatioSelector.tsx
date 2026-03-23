import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export interface RatioOption {
  id: string;
  label: string;
  subtitle: string;
  w: number;
  h: number;
  desc: string;
}

export const RATIOS: RatioOption[] = [
  {
    id: "9:16",
    label: "9:16",
    subtitle: "Portrait",
    w: 9,
    h: 16,
    desc: "1080×1920",
  },
  {
    id: "16:9",
    label: "16:9",
    subtitle: "Landscape",
    w: 16,
    h: 9,
    desc: "1920×1080",
  },
  {
    id: "1:1",
    label: "1:1",
    subtitle: "Square",
    w: 1,
    h: 1,
    desc: "1080×1080",
  },
  {
    id: "4:3",
    label: "4:3",
    subtitle: "Standard",
    w: 4,
    h: 3,
    desc: "1440×1080",
  },
  {
    id: "3:4",
    label: "3:4",
    subtitle: "Portrait",
    w: 3,
    h: 4,
    desc: "1080×1440",
  },
];

const MAX_BOX_H = 72; // px — container height inside card
const MAX_BOX_W = 80; // px — max width inside card

function RatioVisual({ w, h }: { w: number; h: number }) {
  const aspect = w / h;
  let boxW: number;
  let boxH: number;
  if (aspect >= 1) {
    // wider than tall
    boxW = Math.min(MAX_BOX_W, MAX_BOX_H * aspect);
    boxH = boxW / aspect;
  } else {
    // taller than wide
    boxH = MAX_BOX_H;
    boxW = boxH * aspect;
  }
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: MAX_BOX_W, height: MAX_BOX_H }}
    >
      <div
        className="rounded-md bg-primary/20 border-2 border-primary/40 relative overflow-hidden"
        style={{ width: boxW, height: boxH }}
      >
        {/* inner grid lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/3 top-0 bottom-0 border-l border-primary/50" />
          <div className="absolute left-2/3 top-0 bottom-0 border-l border-primary/50" />
          <div className="absolute top-1/3 left-0 right-0 border-t border-primary/50" />
          <div className="absolute top-2/3 left-0 right-0 border-t border-primary/50" />
        </div>
        {/* center play dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary/60" />
        </div>
      </div>
    </div>
  );
}

interface RatioSelectorProps {
  onBack: () => void;
  onCreate: (ratio: RatioOption) => void;
}

export function RatioSelector({ onBack, onCreate }: RatioSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedRatio = RATIOS.find((r) => r.id === selected) ?? null;

  return (
    <motion.div
      className="h-[100dvh] flex flex-col bg-background text-foreground max-w-[480px] mx-auto overflow-hidden"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-card/90 backdrop-blur-sm flex-shrink-0">
        <button
          type="button"
          data-ocid="ratio.back.button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-base tracking-tight">
            Select Ratio
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Choose canvas size for your video
          </p>
        </div>
      </header>

      {/* Ratio grid */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          {RATIOS.map((ratio, i) => {
            const isSelected = selected === ratio.id;
            return (
              <motion.button
                key={ratio.id}
                type="button"
                data-ocid={`ratio.item.${i + 1}`}
                onClick={() => setSelected(ratio.id)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.28,
                  ease: "easeOut",
                }}
                className={[
                  "relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left active:scale-95",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-amber"
                    : "bg-card border-white/8 hover:border-white/20",
                ].join(" ")}
              >
                {/* Check badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}

                <RatioVisual w={ratio.w} h={ratio.h} />

                <div className="text-center">
                  <div className="font-display font-bold text-sm text-foreground">
                    {ratio.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {ratio.subtitle}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {ratio.desc}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-white/5 bg-card/60 backdrop-blur-sm">
        <Button
          data-ocid="ratio.create.button"
          onClick={() => selectedRatio && onCreate(selectedRatio)}
          disabled={!selected}
          className="w-full h-13 text-base font-bold rounded-2xl tracking-wide disabled:opacity-40"
          size="lg"
        >
          {selected ? `Create ${selected} Video` : "Select a ratio first"}
        </Button>
      </div>
    </motion.div>
  );
}
