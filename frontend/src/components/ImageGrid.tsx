import { useState } from 'react';

interface ImageGridProps {
  images: string[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [preview, setPreview] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const count = images.length;

  // 根据图片数量决定布局
  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1 max-w-[280px]';
    if (count === 2) return 'grid-cols-2 max-w-[360px]';
    if (count === 4) return 'grid-cols-2 max-w-[360px]';
    return 'grid-cols-3 max-w-[360px]';
  };

  return (
    <>
      <div className={`grid ${getGridClass()} gap-1 mt-2`}>
        {images.map((url, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded cursor-pointer bg-gray-100"
            onClick={() => setPreview(i)}
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* 图片预览 */}
      {preview !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setPreview(null)}
        >
          <img
            src={images[preview]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <div className="absolute bottom-6 text-white/60 text-sm">
            {preview + 1} / {count}
          </div>
        </div>
      )}
    </>
  );
}
