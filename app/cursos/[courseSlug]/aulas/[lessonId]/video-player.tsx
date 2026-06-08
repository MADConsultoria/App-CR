"use client";

import { useState } from "react";

type VideoPlayerProps = {
  title: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

export function VideoPlayer({ title, videoUrl, thumbnailUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumb = thumbnailUrl || "/assets/thumb.jpg";

  if (videoUrl && isPlaying) {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        src={videoUrl}
        title={title}
      />
    );
  }

  return (
    <button className="videoThumb" onClick={() => videoUrl && setIsPlaying(true)} type="button">
      <img alt={`Capa da aula ${title}`} src={thumb} />
      <span className="videoShade" />
      <span className="videoPlay">
        <span className="material-symbols-outlined">play_arrow</span>
      </span>
      <span className="videoCaption">
        <strong>{videoUrl ? "Assistir aula" : "Vídeo em preparação"}</strong>
        {!videoUrl ? <small>Quando o link do vídeo for cadastrado, o player aparecerá aqui.</small> : null}
      </span>
    </button>
  );
}
