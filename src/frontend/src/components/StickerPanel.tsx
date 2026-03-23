import { Slider } from "@/components/ui/slider";
import type { StickerOverlay, VideoEditorHook } from "@/hooks/useVideoEditor";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  editor: VideoEditorHook;
}

const CATEGORIES = [
  {
    label: "😄 Expressions",
    emojis: [
      "😂",
      "😍",
      "🥰",
      "😎",
      "🤩",
      "😜",
      "🤣",
      "😇",
      "🥳",
      "😤",
      "😱",
      "🤯",
      "😴",
      "🤑",
    ],
  },
  {
    label: "❤️ Love",
    emojis: [
      "❤️",
      "💕",
      "💖",
      "💗",
      "💓",
      "💞",
      "💘",
      "🖤",
      "🤍",
      "💛",
      "💚",
      "💙",
      "💜",
      "🧡",
    ],
  },
  {
    label: "🎉 Party",
    emojis: [
      "🎉",
      "🎊",
      "🥂",
      "🎈",
      "🎆",
      "🎇",
      "🎁",
      "🏆",
      "🥇",
      "👑",
      "✨",
      "🌟",
      "💫",
      "⭐",
    ],
  },
  {
    label: "🔥 Trending",
    emojis: [
      "🔥",
      "💯",
      "🚀",
      "👀",
      "💀",
      "🤌",
      "👊",
      "🙌",
      "🤙",
      "✌️",
      "👍",
      "🫶",
      "💪",
      "🤷",
    ],
  },
  {
    label: "🌸 Nature",
    emojis: [
      "🌸",
      "🌺",
      "🌻",
      "🌹",
      "🍀",
      "🌈",
      "⭐",
      "🌙",
      "☀️",
      "🌊",
      "🌴",
      "🦋",
      "🌿",
      "🍃",
    ],
  },
  {
    label: "🎵 Vibes",
    emojis: [
      "🎵",
      "🎶",
      "🎸",
      "🎤",
      "🎬",
      "📸",
      "💃",
      "🕺",
      "🎮",
      "🏄",
      "⚡",
      "🌀",
      "💎",
      "👾",
    ],
  },
];

type AnimationType = StickerOverlay["animation"];

const ANIMATIONS: { value: AnimationType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bounce", label: "Bounce" },
  { value: "pulse", label: "Pulse" },
  { value: "spin", label: "Spin" },
  { value: "shake", label: "Shake" },
  { value: "float", label: "Float" },
];

export function StickerPanel({ editor }: Props) {
  const {
    state,
    addStickerOverlay,
    updateStickerOverlay,
    removeStickerOverlay,
  } = editor;
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            data-ocid="stickers.tab"
            onClick={() => setActiveCat(i)}
            className={[
              "flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-150",
              activeCat === i
                ? "bg-primary text-primary-foreground border-primary"
                : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground/80",
            ].join(" ")}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-7 gap-1 flex-shrink-0">
        {CATEGORIES[activeCat].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            data-ocid="stickers.button"
            onClick={() => addStickerOverlay(emoji)}
            className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-white/10 active:scale-90 transition-all duration-100 border border-transparent hover:border-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Placed stickers */}
      {state.stickerOverlays.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-2 overflow-y-auto flex-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            Placed Stickers
          </p>
          {state.stickerOverlays.map((s, idx) => (
            <div
              key={s.id}
              data-ocid={`stickers.item.${idx + 1}`}
              className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-2.5 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.emoji}</span>
                <button
                  type="button"
                  data-ocid={`stickers.delete_button.${idx + 1}`}
                  onClick={() => removeStickerOverlay(s.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-90 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Animation selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground">Anim</span>
                <div className="flex flex-wrap gap-1">
                  {ANIMATIONS.map((anim) => (
                    <button
                      key={anim.value}
                      type="button"
                      onClick={() =>
                        updateStickerOverlay(s.id, { animation: anim.value })
                      }
                      className={[
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all duration-150 active:scale-90",
                        s.animation === anim.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground/80",
                      ].join(" ")}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8">
                    Size
                  </span>
                  <Slider
                    value={[s.size]}
                    min={20}
                    max={100}
                    step={2}
                    onValueChange={(v) =>
                      updateStickerOverlay(s.id, { size: v[0] })
                    }
                    className="flex-1 h-1"
                    data-ocid={`stickers.size_slider.${idx + 1}`}
                  />
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {s.size}px
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8">
                    X
                  </span>
                  <Slider
                    value={[s.x]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) =>
                      updateStickerOverlay(s.id, { x: v[0] })
                    }
                    className="flex-1 h-1"
                    data-ocid={`stickers.x_slider.${idx + 1}`}
                  />
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {s.x}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8">
                    Y
                  </span>
                  <Slider
                    value={[s.y]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) =>
                      updateStickerOverlay(s.id, { y: v[0] })
                    }
                    className="flex-1 h-1"
                    data-ocid={`stickers.y_slider.${idx + 1}`}
                  />
                  <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {s.y}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.stickerOverlays.length === 0 && (
        <p
          className="text-[11px] text-muted-foreground/60 text-center py-1"
          data-ocid="stickers.empty_state"
        >
          Tap an emoji to add it to your video
        </p>
      )}
    </div>
  );
}
