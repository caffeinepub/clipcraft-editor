import { useCallback, useRef, useState } from "react";

export interface Clip {
  id: string;
  name: string;
  url: string;
  file: File;
  duration: number;
  startOffset: number;
  endOffset: number;
  thumbnailUrl?: string;
  muted: boolean;
  speed: number;
  volume: number;
  type: "video" | "image";
  transition:
    | "none"
    | "fade"
    | "slideLeft"
    | "slideRight"
    | "zoomIn"
    | "dissolve";
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    hue: number;
    temperature: number;
    highlights: number;
    shadows: number;
  };
  crop: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  kenBurns?: "zoomIn" | "zoomOut" | "panLeft" | "panRight" | "none";
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  shadow: boolean;
  background: boolean;
  outline: boolean;
  animation:
    | "none"
    | "fadeIn"
    | "slideUp"
    | "slideDown"
    | "bounce"
    | "zoomIn"
    | "typewriter";
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  animation: "none" | "bounce" | "pulse" | "spin" | "shake" | "float";
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  file: File;
  volume: number;
}

export interface VoiceoverTrack {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  duration: number;
}

export interface EditorState {
  clips: Clip[];
  selectedClipId: string | null;
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  audioTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  voiceovers: VoiceoverTrack[];
  isRecording: boolean;
}

type ContentState = Omit<EditorState, "isPlaying" | "currentTime">;

const MAX_HISTORY = 50;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.currentTime = 1;
    const url = URL.createObjectURL(file);
    video.src = url;
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0, 160, 90);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
  });
}

const KEN_BURNS_OPTIONS: Clip["kenBurns"][] = [
  "zoomIn",
  "zoomOut",
  "panLeft",
  "panRight",
];

const DEFAULT_FILTERS: Clip["filters"] = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hue: 0,
  temperature: 0,
  highlights: 0,
  shadows: 0,
};

const DEFAULT_CROP: Clip["crop"] = { top: 0, left: 0, right: 0, bottom: 0 };

function extractContentState(s: EditorState): ContentState {
  const { isPlaying: _p, currentTime: _t, ...content } = s;
  return content;
}

export function useVideoEditor() {
  const [state, setState] = useState<EditorState>({
    clips: [],
    selectedClipId: null,
    textOverlays: [],
    stickerOverlays: [],
    audioTrack: null,
    isPlaying: false,
    currentTime: 0,
    voiceovers: [],
    isRecording: false,
  });

  // History stored in refs to avoid re-renders
  const historyRef = useRef<ContentState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [historyVersion, setHistoryVersion] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  // Save a content snapshot to history
  const saveSnapshot = useCallback((newState: EditorState) => {
    const snap = extractContentState(newState);
    const idx = historyIndexRef.current;
    // Discard redo entries beyond current index
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(snap);
    // Keep max history
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(
        historyRef.current.length - MAX_HISTORY,
      );
    }
    historyIndexRef.current = historyRef.current.length - 1;
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    historyIndexRef.current = idx - 1;
    const snap = historyRef.current[historyIndexRef.current];
    setState((prev) => ({ ...prev, ...snap }));
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIndexRef.current = idx + 1;
    const snap = historyRef.current[historyIndexRef.current];
    setState((prev) => ({ ...prev, ...snap }));
    setHistoryVersion((v) => v + 1);
  }, []);

  // historyVersion in deps ensures canUndo/canRedo recompute
  const canUndo = historyVersion >= 0 && historyIndexRef.current > 0;
  const canRedo =
    historyVersion >= 0 &&
    historyIndexRef.current < historyRef.current.length - 1;

  const addClips = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      let kenBurnsIndex = 0;
      const newClips = await Promise.all(
        fileArray.map(async (file) => {
          const isImage = file.type.startsWith("image/");
          const url = URL.createObjectURL(file);

          if (isImage) {
            const kb =
              KEN_BURNS_OPTIONS[kenBurnsIndex % KEN_BURNS_OPTIONS.length];
            kenBurnsIndex++;
            return {
              id: generateId(),
              name: file.name.replace(/\.[^.]+$/, ""),
              url,
              file,
              duration: 5,
              startOffset: 0,
              endOffset: 5,
              thumbnailUrl: url,
              muted: true,
              speed: 1,
              volume: 100,
              type: "image" as const,
              transition: "none" as const,
              filters: { ...DEFAULT_FILTERS },
              crop: { ...DEFAULT_CROP },
              kenBurns: kb,
            } satisfies Clip;
          }

          const [duration, thumbnailUrl] = await Promise.all([
            getVideoDuration(file),
            generateThumbnail(file),
          ]);
          return {
            id: generateId(),
            name: file.name.replace(/\.[^.]+$/, ""),
            url,
            file,
            duration,
            startOffset: 0,
            endOffset: duration,
            thumbnailUrl,
            muted: false,
            speed: 1,
            volume: 100,
            type: "video" as const,
            transition: "none" as const,
            filters: { ...DEFAULT_FILTERS },
            crop: { ...DEFAULT_CROP },
          } satisfies Clip;
        }),
      );
      setState((prev) => {
        const next = {
          ...prev,
          clips: [...prev.clips, ...newClips],
          selectedClipId: prev.selectedClipId ?? newClips[0]?.id ?? null,
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const selectClip = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedClipId: id }));
  }, []);

  const removeClip = useCallback(
    (id: string) => {
      setState((prev) => {
        const clip = prev.clips.find((c) => c.id === id);
        if (clip) URL.revokeObjectURL(clip.url);
        const clips = prev.clips.filter((c) => c.id !== id);
        const next = {
          ...prev,
          clips,
          selectedClipId:
            prev.selectedClipId === id
              ? (clips[0]?.id ?? null)
              : prev.selectedClipId,
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const advanceToNextClip = useCallback(() => {
    setState((prev) => {
      const idx = prev.clips.findIndex((c) => c.id === prev.selectedClipId);
      if (idx === -1 || idx >= prev.clips.length - 1) {
        // No next clip - stop playback
        return { ...prev, isPlaying: false, currentTime: 0 };
      }
      const nextClip = prev.clips[idx + 1];
      return { ...prev, selectedClipId: nextClip.id, currentTime: 0 };
    });
  }, []);

  const updateClipFilters = useCallback(
    (id: string, filters: Partial<Clip["filters"]>) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === id ? { ...c, filters: { ...c.filters, ...filters } } : c,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipCrop = useCallback(
    (id: string, crop: Partial<Clip["crop"]>) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === id ? { ...c, crop: { ...c.crop, ...crop } } : c,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipMuted = useCallback(
    (id: string, muted: boolean) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) => (c.id === id ? { ...c, muted } : c)),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipSpeed = useCallback(
    (id: string, speed: number) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) => (c.id === id ? { ...c, speed } : c)),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipVolume = useCallback(
    (id: string, volume: number) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) => (c.id === id ? { ...c, volume } : c)),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipTransition = useCallback(
    (id: string, transition: Clip["transition"]) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === id ? { ...c, transition } : c,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateClipKenBurns = useCallback(
    (id: string, kenBurns: Clip["kenBurns"]) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) => (c.id === id ? { ...c, kenBurns } : c)),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const splitClip = useCallback(
    (id: string, atTime: number) => {
      setState((prev) => {
        const idx = prev.clips.findIndex((c) => c.id === id);
        if (idx === -1) return prev;
        const clip = prev.clips[idx];
        const clampedAt = Math.max(0.1, Math.min(atTime, clip.duration - 0.1));

        const clip1: Clip = {
          ...clip,
          id: generateId(),
          name: `${clip.name} (1)`,
          url: URL.createObjectURL(clip.file),
          startOffset: clip.startOffset,
          endOffset: clip.startOffset + clampedAt,
          duration: clampedAt,
        };
        const clip2: Clip = {
          ...clip,
          id: generateId(),
          name: `${clip.name} (2)`,
          url: URL.createObjectURL(clip.file),
          startOffset: clip.startOffset + clampedAt,
          endOffset: clip.endOffset,
          duration: clip.duration - clampedAt,
        };

        URL.revokeObjectURL(clip.url);

        const clips = [
          ...prev.clips.slice(0, idx),
          clip1,
          clip2,
          ...prev.clips.slice(idx + 1),
        ];

        const next = { ...prev, clips, selectedClipId: clip1.id };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const trimClip = useCallback(
    (id: string, startOffset: number, endOffset: number) => {
      setState((prev) => {
        const next = {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === id
              ? {
                  ...c,
                  startOffset,
                  endOffset,
                  duration: endOffset - startOffset,
                }
              : c,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const addTextOverlay = useCallback(() => {
    const overlay: TextOverlay = {
      id: generateId(),
      text: "Add text here",
      fontSize: 24,
      color: "#ffffff",
      x: 50,
      y: 80,
      fontWeight: "normal",
      fontStyle: "normal",
      shadow: false,
      background: false,
      outline: false,
      animation: "none",
    };
    setState((prev) => {
      const next = {
        ...prev,
        textOverlays: [...prev.textOverlays, overlay],
      };
      saveSnapshot(next);
      return next;
    });
  }, [saveSnapshot]);

  const updateTextOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay>) => {
      setState((prev) => {
        const next = {
          ...prev,
          textOverlays: prev.textOverlays.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const removeTextOverlay = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = {
          ...prev,
          textOverlays: prev.textOverlays.filter((t) => t.id !== id),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const addStickerOverlay = useCallback(
    (emoji: string) => {
      const sticker: StickerOverlay = {
        id: generateId(),
        emoji,
        x: 50,
        y: 50,
        size: 48,
        animation: "none",
      };
      setState((prev) => {
        const next = {
          ...prev,
          stickerOverlays: [...prev.stickerOverlays, sticker],
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const updateStickerOverlay = useCallback(
    (id: string, updates: Partial<StickerOverlay>) => {
      setState((prev) => {
        const next = {
          ...prev,
          stickerOverlays: prev.stickerOverlays.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const removeStickerOverlay = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = {
          ...prev,
          stickerOverlays: prev.stickerOverlays.filter((s) => s.id !== id),
        };
        saveSnapshot(next);
        return next;
      });
    },
    [saveSnapshot],
  );

  const setAudioTrack = useCallback(async (file: File) => {
    setState((prev) => {
      if (prev.audioTrack) URL.revokeObjectURL(prev.audioTrack.url);
      return {
        ...prev,
        audioTrack: {
          id: generateId(),
          name: file.name.replace(/\.[^.]+$/, ""),
          url: URL.createObjectURL(file),
          file,
          volume: 80,
        },
      };
    });
  }, []);

  const updateAudioVolume = useCallback((volume: number) => {
    setState((prev) => {
      if (!prev.audioTrack) return prev;
      if (audioRef.current) audioRef.current.volume = volume / 100;
      return { ...prev, audioTrack: { ...prev.audioTrack, volume } };
    });
  }, []);

  const removeAudioTrack = useCallback(() => {
    setState((prev) => {
      if (prev.audioTrack) URL.revokeObjectURL(prev.audioTrack.url);
      return { ...prev, audioTrack: null };
    });
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, isPlaying: playing }));
  }, []);

  const setCurrentTime = useCallback((t: number) => {
    setState((prev) => ({ ...prev, currentTime: t }));
  }, []);

  const startVoiceoverRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunksRef.current = [];
      recordingStartRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setState((prev) => ({ ...prev, isRecording: true }));
    } catch {
      throw new Error("Microphone permission denied");
    }
  }, []);

  const stopVoiceoverRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - recordingStartRef.current) / 1000;

        setState((prev) => {
          const count = prev.voiceovers.length + 1;
          return {
            ...prev,
            isRecording: false,
            voiceovers: [
              ...prev.voiceovers,
              {
                id: generateId(),
                name: `Voiceover ${count}`,
                url,
                blob,
                duration,
              },
            ],
          };
        });

        for (const track of mediaRecorder.stream.getTracks()) {
          track.stop();
        }
        mediaRecorderRef.current = null;
        resolve();
      };

      mediaRecorder.stop();
    });
  }, []);

  const removeVoiceover = useCallback((id: string) => {
    setState((prev) => {
      const vo = prev.voiceovers.find((v) => v.id === id);
      if (vo) URL.revokeObjectURL(vo.url);
      return {
        ...prev,
        voiceovers: prev.voiceovers.filter((v) => v.id !== id),
      };
    });
  }, []);

  const useVoiceoverAsAudio = useCallback((id: string) => {
    setState((prev) => {
      const vo = prev.voiceovers.find((v) => v.id === id);
      if (!vo) return prev;
      if (prev.audioTrack) URL.revokeObjectURL(prev.audioTrack.url);
      const newUrl = URL.createObjectURL(vo.blob);
      return {
        ...prev,
        audioTrack: {
          id: generateId(),
          name: vo.name,
          url: newUrl,
          file: new File([vo.blob], `${vo.name}.webm`, { type: "audio/webm" }),
          volume: 80,
        },
      };
    });
  }, []);

  const selectedClip =
    state.clips.find((c) => c.id === state.selectedClipId) ?? null;

  return {
    state,
    selectedClip,
    videoRef,
    audioRef,
    canUndo,
    canRedo,
    undo,
    redo,
    addClips,
    selectClip,
    removeClip,
    advanceToNextClip,
    updateClipFilters,
    updateClipCrop,
    updateClipMuted,
    updateClipSpeed,
    updateClipVolume,
    updateClipTransition,
    updateClipKenBurns,
    splitClip,
    trimClip,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    addStickerOverlay,
    updateStickerOverlay,
    removeStickerOverlay,
    setAudioTrack,
    updateAudioVolume,
    removeAudioTrack,
    setIsPlaying,
    setCurrentTime,
    startVoiceoverRecording,
    stopVoiceoverRecording,
    removeVoiceover,
    useVoiceoverAsAudio,
  };
}

export type VideoEditorHook = ReturnType<typeof useVideoEditor>;
