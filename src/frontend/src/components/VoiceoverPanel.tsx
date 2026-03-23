import { Button } from "@/components/ui/button";
import type { VideoEditorHook, VoiceoverTrack } from "@/hooks/useVideoEditor";
import {
  AlertCircle,
  Mic,
  MicOff,
  Music,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  editor: VideoEditorHook;
}

export function VoiceoverPanel({ editor }: Props) {
  const {
    state,
    startVoiceoverRecording,
    stopVoiceoverRecording,
    removeVoiceover,
    useVoiceoverAsAudio: setVoiceoverAsAudio,
  } = editor;
  const [micError, setMicError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (state.isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRecording]);

  async function handleRecordToggle() {
    setMicError(null);
    if (state.isRecording) {
      await stopVoiceoverRecording();
    } else {
      try {
        await startVoiceoverRecording();
      } catch {
        setMicError(
          "Microphone permission denied. Please allow mic access in your browser settings.",
        );
      }
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function togglePlay(vo: VoiceoverTrack) {
    if (playingId === vo.id) {
      audioElsRef.current.get(vo.id)?.pause();
      setPlayingId(null);
    } else {
      for (const [id, el] of audioElsRef.current) {
        el.pause();
        el.currentTime = 0;
        if (id !== vo.id) setPlayingId(null);
      }
      let el = audioElsRef.current.get(vo.id);
      if (!el) {
        el = new Audio(vo.url);
        el.onended = () => setPlayingId(null);
        audioElsRef.current.set(vo.id, el);
      }
      el.play();
      setPlayingId(vo.id);
    }
  }

  function handleRemove(id: string) {
    audioElsRef.current.get(id)?.pause();
    audioElsRef.current.delete(id);
    if (playingId === id) setPlayingId(null);
    removeVoiceover(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Voiceover
      </p>

      {/* Record button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleRecordToggle}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            state.isRecording
              ? "bg-red-600 shadow-[0_0_24px_rgba(239,68,68,0.6)]"
              : "bg-zinc-800 hover:bg-zinc-700 border border-white/10"
          }`}
          data-ocid="voiceover.toggle"
        >
          {state.isRecording ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              <MicOff className="w-8 h-8 text-white relative z-10" />
            </>
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>

        {state.isRecording ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-red-400">
              Recording... {formatTime(recordingTime)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Tap to record a voiceover
          </p>
        )}
      </div>

      {/* Mic error */}
      {micError && (
        <div
          className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
          data-ocid="voiceover.error_state"
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{micError}</p>
        </div>
      )}

      {/* Voiceover list */}
      {state.voiceovers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Recordings
          </p>
          {state.voiceovers.map((vo, index) => (
            <div
              key={vo.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/60 border border-white/5"
              data-ocid={`voiceover.item.${index + 1}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={() => togglePlay(vo)}
                data-ocid={`voiceover.toggle.${index + 1}`}
              >
                {playingId === vo.id ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </Button>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{vo.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatTime(Math.round(vo.duration))}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-primary hover:text-primary"
                onClick={() => setVoiceoverAsAudio(vo.id)}
                data-ocid={`voiceover.use_button.${index + 1}`}
              >
                <Music className="w-3 h-3 mr-1" />
                Use
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-red-400"
                onClick={() => handleRemove(vo.id)}
                data-ocid={`voiceover.delete_button.${index + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {state.voiceovers.length === 0 && !state.isRecording && (
        <div
          className="text-center py-4 text-muted-foreground"
          data-ocid="voiceover.empty_state"
        >
          <p className="text-xs">No recordings yet</p>
        </div>
      )}
    </div>
  );
}
