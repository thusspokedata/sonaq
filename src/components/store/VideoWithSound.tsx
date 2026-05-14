"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── YouTube IFrame Player API (tipos mínimos) ────────────────────────────────
interface YTPlayer {
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  playVideo(): void;
  destroy(): void;
}

declare global {
  interface Window {
    YT: { Player: new (el: string | HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_ID = "P5aeAu4qlJo";

function SoundOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

export function VideoWithSound() {
  const playerRef = useRef<YTPlayer | null>(null);
  const playerElRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function initPlayer() {
      if (!playerElRef.current) return;
      playerRef.current = new window.YT.Player(playerElRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: VIDEO_ID,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (e: { target: { getIframe(): HTMLIFrameElement } }) => {
            // Sacar el iframe del tab order — es decorativo, la interacción
            // es solo el botón de sonido
            const iframe = e.target.getIframe();
            iframe.setAttribute("tabindex", "-1");
            iframe.setAttribute("aria-hidden", "true");
            setReady(true);
          },
          // Reiniciar cuando termina el video (estado 0) para evitar
          // que YouTube muestre la pantalla de "ver más videos"
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) playerRef.current?.playVideo();
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  const toggleSound = useCallback(() => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(80);
    } else {
      playerRef.current.mute();
    }
    setMuted((m) => !m);
  }, [muted]);

  return (
    <div className="relative w-full h-full">
      {/* Div reemplazado por el iframe de YouTube vía IFrame Player API */}
      <div
        ref={playerElRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          aspectRatio: "9 / 16",
          border: 0,
        }}
      />

      {/* Toggle de sonido — aparece cuando el player está listo */}
      {ready && (
        <button
          onClick={toggleSound}
          aria-label={muted ? "Activar sonido del video" : "Silenciar video"}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "rgba(26,15,0,0.65)",
            color: "#f5f0e8",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.12em",
          }}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          {muted ? "Sonido" : "Silenciar"}
        </button>
      )}
    </div>
  );
}
