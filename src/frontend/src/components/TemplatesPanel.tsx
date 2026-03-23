import type { VideoEditorHook } from "@/hooks/useVideoEditor";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Props {
  editor: VideoEditorHook;
}

interface Template {
  id: string;
  name: string;
  description: string;
  gradient: string;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
  transition:
    | "none"
    | "fade"
    | "slideLeft"
    | "slideRight"
    | "zoomIn"
    | "dissolve";
  emoji: string;
}

const TEMPLATES: Template[] = [
  {
    id: "travel",
    name: "Travel Vlog",
    description: "Warm · Fade · Bold text",
    gradient:
      "linear-gradient(135deg, oklch(0.62 0.18 55), oklch(0.52 0.16 30))",
    filters: { brightness: 110, contrast: 105, saturation: 115, blur: 0 },
    transition: "fade",
    emoji: "✈️",
  },
  {
    id: "birthday",
    name: "Birthday",
    description: "Vibrant · Zoom · Colorful",
    gradient:
      "linear-gradient(135deg, oklch(0.68 0.22 340), oklch(0.62 0.20 280))",
    filters: { brightness: 115, contrast: 110, saturation: 140, blur: 0 },
    transition: "zoomIn",
    emoji: "🎉",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Dark · Dissolve · Minimal",
    gradient:
      "linear-gradient(135deg, oklch(0.25 0.02 240), oklch(0.18 0.01 220))",
    filters: { brightness: 90, contrast: 125, saturation: 75, blur: 0 },
    transition: "dissolve",
    emoji: "🎬",
  },
  {
    id: "aesthetic",
    name: "Aesthetic",
    description: "Soft · Slide · Italic",
    gradient:
      "linear-gradient(135deg, oklch(0.78 0.08 330), oklch(0.72 0.06 300))",
    filters: { brightness: 105, contrast: 95, saturation: 70, blur: 0 },
    transition: "slideLeft",
    emoji: "🌸",
  },
  {
    id: "story",
    name: "Story",
    description: "Portrait · Fade · Clean",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 200), oklch(0.48 0.18 220))",
    filters: { brightness: 108, contrast: 102, saturation: 105, blur: 0 },
    transition: "fade",
    emoji: "📱",
  },
  {
    id: "slideshow",
    name: "Slideshow",
    description: "Balanced · Slide → · Clean",
    gradient:
      "linear-gradient(135deg, oklch(0.45 0.12 160), oklch(0.38 0.10 180))",
    filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0 },
    transition: "slideRight",
    emoji: "🖼️",
  },
];

export function TemplatesPanel({ editor }: Props) {
  function applyTemplate(template: Template) {
    const { state, updateClipFilters, updateClipTransition } = editor;
    for (const clip of state.clips) {
      updateClipFilters(clip.id, template.filters);
      updateClipTransition(clip.id, template.transition);
    }
    toast.success(`✨ ${template.name} template applied!`);
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Apply a style to all clips instantly
      </p>

      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((template, i) => (
          <motion.div
            key={template.id}
            data-ocid={`templates.item.${i + 1}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="relative rounded-xl overflow-hidden border border-white/10 hover:border-white/25 transition-colors group"
          >
            {/* Gradient background */}
            <div
              className="h-16 w-full flex items-center justify-center"
              style={{ background: template.gradient }}
            >
              <span className="text-2xl">{template.emoji}</span>
            </div>

            {/* Info + use button */}
            <div className="bg-card px-2 pt-1.5 pb-2">
              <p className="text-[11px] font-semibold text-foreground leading-none">
                {template.name}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {template.description}
              </p>
              <button
                type="button"
                data-ocid={`templates.primary_button.${i + 1}`}
                onClick={() => applyTemplate(template)}
                className="mt-1.5 w-full text-[10px] font-bold py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors active:scale-95"
              >
                Use
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
