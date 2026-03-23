import { AudioPanel } from "@/components/AudioPanel";
import { ClipToolbar } from "@/components/ClipToolbar";
import { CropPanel } from "@/components/CropPanel";
import { ExportButton } from "@/components/ExportButton";
import { FilterPanel } from "@/components/FilterPanel";
import { MediaLibrary } from "@/components/MediaLibrary";
import { OnboardingHome } from "@/components/OnboardingHome";
import { type RatioOption, RatioSelector } from "@/components/RatioSelector";
import { StickerPanel } from "@/components/StickerPanel";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { TextEditor } from "@/components/TextEditor";
import { Timeline } from "@/components/Timeline";
import { TransitionPanel } from "@/components/TransitionPanel";
import { VideoPreview } from "@/components/VideoPreview";
import { VoiceoverPanel } from "@/components/VoiceoverPanel";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import {
  ArrowLeftRight,
  Crop as CropIcon,
  Film,
  LayoutTemplate,
  Mic,
  Music,
  Redo2,
  Sliders,
  Smile,
  Type,
  Undo2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const YEAR = new Date().getFullYear();

type Step = "home" | "ratio" | "editor";
type TabId =
  | "media"
  | "text"
  | "filters"
  | "crop"
  | "audio"
  | "voice"
  | "stickers"
  | "transitions"
  | "templates";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "media", label: "Media", Icon: Upload },
  { id: "text", label: "Text", Icon: Type },
  { id: "filters", label: "Filters", Icon: Sliders },
  { id: "crop", label: "Crop", Icon: CropIcon },
  { id: "audio", label: "Audio", Icon: Music },
  { id: "voice", label: "Voice", Icon: Mic },
  { id: "stickers", label: "Stickers", Icon: Smile },
  { id: "transitions", label: "Trans", Icon: ArrowLeftRight },
  { id: "templates", label: "Template", Icon: LayoutTemplate },
];

export default function App() {
  const editor = useVideoEditor();
  const [activeTab, setActiveTab] = useState<TabId>("media");
  const [panelOpen, setPanelOpen] = useState(true);
  const [step, setStep] = useState<Step>("home");
  const [selectedRatio, setSelectedRatio] = useState<RatioOption | null>(null);

  function handleTabPress(id: TabId) {
    if (activeTab === id) {
      setPanelOpen((o) => !o);
    } else {
      setActiveTab(id);
      setPanelOpen(true);
    }
  }

  function handleCreate(ratio: RatioOption) {
    setSelectedRatio(ratio);
    setStep("editor");
  }

  return (
    <>
      <Toaster position="top-center" />
      <AnimatePresence mode="wait">
        {step === "home" && (
          <OnboardingHome key="home" onCreateVideo={() => setStep("ratio")} />
        )}

        {step === "ratio" && (
          <RatioSelector
            key="ratio"
            onBack={() => setStep("home")}
            onCreate={handleCreate}
          />
        )}

        {step === "editor" && (
          <motion.div
            key="editor"
            className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden max-w-[480px] mx-auto relative"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-card/90 backdrop-blur-sm flex-shrink-0 h-12">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Film className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-base tracking-tight">
                  VibeEdit
                </span>
                {selectedRatio && (
                  <span className="text-[10px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded-full">
                    {selectedRatio.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Undo / Redo */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-25"
                  disabled={!editor.canUndo}
                  onClick={editor.undo}
                  data-ocid="header.undo_button"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-25"
                  disabled={!editor.canRedo}
                  onClick={editor.redo}
                  data-ocid="header.redo_button"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <ExportButton editor={editor} />
              </div>
            </header>

            {/* ── Video Preview ── ~40% of screen */}
            <motion.div
              className="flex-shrink-0 bg-black"
              style={{ height: "40dvh" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <VideoPreview editor={editor} mobile />
            </motion.div>

            {/* ── Timeline strip ── */}
            <div
              className="flex-shrink-0 border-t border-white/5 bg-card/60"
              style={{ height: "72px" }}
              data-ocid="timeline.panel"
            >
              <Timeline editor={editor} />
            </div>

            {/* ── Clip Toolbar (selected clip actions) — overlaid, compact ── */}
            <AnimatePresence>
              {editor.selectedClip && (
                <motion.div
                  key="clip-toolbar"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex-shrink-0 border-t border-white/5 overflow-hidden"
                  style={{ maxHeight: "48px" }}
                >
                  <ClipToolbar editor={editor} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Panel area — flex-1 fills remaining space ── */}
            <AnimatePresence initial={false}>
              {panelOpen && (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex-1 min-h-[120px] max-h-[240px] border-t border-white/5 bg-card/80 overflow-hidden"
                >
                  <div className="h-full overflow-y-auto p-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18 }}
                        className="h-full"
                      >
                        {activeTab === "media" && (
                          <MediaLibrary editor={editor} />
                        )}
                        {activeTab === "text" && <TextEditor editor={editor} />}
                        {activeTab === "filters" && (
                          <FilterPanel editor={editor} />
                        )}
                        {activeTab === "crop" && <CropPanel editor={editor} />}
                        {activeTab === "audio" && (
                          <AudioPanel editor={editor} />
                        )}
                        {activeTab === "voice" && (
                          <VoiceoverPanel editor={editor} />
                        )}
                        {activeTab === "stickers" && (
                          <StickerPanel editor={editor} />
                        )}
                        {activeTab === "transitions" && (
                          <TransitionPanel editor={editor} />
                        )}
                        {activeTab === "templates" && (
                          <TemplatesPanel editor={editor} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Footer credit ── */}
            <div className="flex-shrink-0 text-center py-0.5 bg-background border-t border-white/5">
              <p className="text-[9px] text-muted-foreground/50">
                © {YEAR}.{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary/70 transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>

            {/* ── Bottom Tab Bar — horizontally scrollable for 9 tabs ── */}
            <nav
              className="flex-shrink-0 border-t border-white/10 bg-card/95 backdrop-blur-md safe-area-bottom"
              style={{ minHeight: "56px" }}
            >
              <div
                className="flex overflow-x-auto h-full"
                style={{ scrollbarWidth: "none" }}
              >
                {TABS.map(({ id, label, Icon }) => {
                  const isActive = activeTab === id && panelOpen;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-ocid={`nav.${id}.tab`}
                      onClick={() => handleTabPress(id)}
                      className={[
                        "flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-150 min-h-[56px] min-w-[56px] flex-shrink-0 active:scale-95 relative",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground/80",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-7 h-7 rounded-xl flex items-center justify-center transition-colors duration-150",
                          isActive ? "bg-primary/20" : "",
                        ].join(" ")}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-medium leading-none">
                        {label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
