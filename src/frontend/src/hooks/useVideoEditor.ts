import { useCallback, useRef, useState } from "react";

export interface Clip {
  id: string;
  name: string;
  url: string;
  file: File;
  duration: number;
  thumbnailUrl?: string;
  muted: boolean;
  speed: number;
  volume: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const addClips = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newClips = await Promise.all(
      fileArray.map(async (file) => {
        const url = URL.createObjectURL(file);
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
          thumbnailUrl,
          muted: false,
          speed: 1,
          volume: 100,
          filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0 },
        } satisfies Clip;
      }),
    );
    setState((prev) => ({
      ...prev,
      clips: [...prev.clips, ...newClips],
      selectedClipId: prev.selectedClipId ?? newClips[0]?.id ?? null,
    }));
  }, []);

  const selectClip = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedClipId: id }));
  }, []);

  const removeClip = useCallback((id: string) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === id);
      if (clip) URL.revokeObjectURL(clip.url);
      const clips = prev.clips.filter((c) => c.id !== id);
      return {
        ...prev,
        clips,
        selectedClipId:
          prev.selectedClipId === id
            ? (clips[0]?.id ?? null)
            : prev.selectedClipId,
      };
    });
  }, []);

  const updateClipFilters = useCallback(
    (id: string, filters: Partial<Clip["filters"]>) => {
      setState((prev) => ({
        ...prev,
        clips: prev.clips.map((c) =>
          c.id === id ? { ...c, filters: { ...c.filters, ...filters } } : c,
        ),
      }));
    },
    [],
  );

  const updateClipMuted = useCallback((id: string, muted: boolean) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === id ? { ...c, muted } : c)),
    }));
  }, []);

  const updateClipSpeed = useCallback((id: string, speed: number) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === id ? { ...c, speed } : c)),
    }));
  }, []);

  const updateClipVolume = useCallback((id: string, volume: number) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === id ? { ...c, volume } : c)),
    }));
  }, []);

  const addTextOverlay = useCallback(() => {
    const overlay: TextOverlay = {
      id: generateId(),
      text: "Add text here",
      fontSize: 24,
      color: "#ffffff",
      x: 50,
      y: 80,
    };
    setState((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, overlay],
    }));
  }, []);

  const updateTextOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay>) => {
      setState((prev) => ({
        ...prev,
        textOverlays: prev.textOverlays.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
      }));
    },
    [],
  );

  const removeTextOverlay = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.filter((t) => t.id !== id),
    }));
  }, []);

  const addStickerOverlay = useCallback((emoji: string) => {
    const sticker: StickerOverlay = {
      id: generateId(),
      emoji,
      x: 50,
      y: 50,
      size: 48,
      animation: "none",
    };
    setState((prev) => ({
      ...prev,
      stickerOverlays: [...prev.stickerOverlays, sticker],
    }));
  }, []);

  const updateStickerOverlay = useCallback(
    (id: string, updates: Partial<StickerOverlay>) => {
      setState((prev) => ({
        ...prev,
        stickerOverlays: prev.stickerOverlays.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      }));
    },
    [],
  );

  const removeStickerOverlay = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      stickerOverlays: prev.stickerOverlays.filter((s) => s.id !== id),
    }));
  }, []);

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
    addClips,
    selectClip,
    removeClip,
    updateClipFilters,
    updateClipMuted,
    updateClipSpeed,
    updateClipVolume,
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
