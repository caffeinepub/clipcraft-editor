import { Button } from "@/components/ui/button";
import { Film, Scissors, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";

interface OnboardingHomeProps {
  onCreateVideo: () => void;
}

const features = [
  { icon: Scissors, label: "Trim & Split" },
  { icon: Sparkles, label: "Filters & FX" },
  { icon: Zap, label: "Fast Export" },
];

export function OnboardingHome({ onCreateVideo }: OnboardingHomeProps) {
  return (
    <motion.div
      className="h-[100dvh] flex flex-col items-center justify-between bg-background text-foreground max-w-[480px] mx-auto px-6 pt-16 pb-10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 30%, oklch(0.72 0.19 55 / 12%) 0%, transparent 70%)",
        }}
      />

      {/* Top: branding */}
      <motion.div
        className="flex flex-col items-center gap-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
      >
        {/* Logo mark with pulsing glow */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-amber"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Film className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            VibeEdit
          </h1>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            Professional video editing
            <br />
            right in your browser
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex items-center gap-3 mt-2">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-card border border-white/8 rounded-full px-3 py-1.5"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Center: visual illustration */}
      <motion.div
        className="z-10 w-full flex justify-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative w-52 h-36">
          <div
            className="absolute left-8 top-4 w-36 h-24 rounded-xl bg-card border border-white/10 shadow-lg"
            style={{ transform: "rotate(-6deg)" }}
          />
          <div
            className="absolute left-5 top-2 w-36 h-24 rounded-xl bg-secondary border border-white/10"
            style={{ transform: "rotate(-2deg)" }}
          />
          <div className="absolute left-3 top-0 w-36 h-24 rounded-xl bg-card border border-primary/25 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-background/80 flex items-center px-2 gap-1.5">
              <div className="h-4 w-10 rounded bg-primary/60 flex-shrink-0" />
              <div className="h-4 w-14 rounded bg-primary/40 flex-shrink-0" />
              <div className="h-4 w-8 rounded bg-primary/50 flex-shrink-0" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pb-7">
              <div className="w-8 h-8 rounded-full bg-primary/25 border border-primary/50 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-primary ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom: CTA */}
      <motion.div
        className="z-10 w-full flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
      >
        <Button
          data-ocid="home.primary_button"
          onClick={onCreateVideo}
          className="w-full h-14 text-base font-bold rounded-2xl shadow-amber tracking-wide"
          size="lg"
        >
          + Create Video
        </Button>
        <p className="text-[11px] text-muted-foreground/60">
          No sign-up required • Export directly to your device
        </p>
      </motion.div>
    </motion.div>
  );
}
