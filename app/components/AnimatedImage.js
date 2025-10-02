'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedImage({ src, alt, direction = 'horizontal', speed = 0.5, style, className }) {
  const imageRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleImageLoad = () => {
      const container = img.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;

      let maxScrollPx;

      if (direction === 'horizontal') {
        const scaledImgWidth = (imgNaturalWidth / imgNaturalHeight) * containerHeight;
        maxScrollPx = scaledImgWidth - containerWidth;
      } else {
        const scaledImgHeight = (imgNaturalHeight / imgNaturalWidth) * containerWidth;
        maxScrollPx = scaledImgHeight - containerHeight;
      }

      let position = 0;
      let dir = 1;

      const animate = () => {
        position += speed * dir;

        if (position >= 0) {
          position = 0;
          dir = -1;
        } else if (position <= -maxScrollPx) {
          position = -maxScrollPx;
          dir = 1;
        }

        if (direction === 'horizontal') {
          img.style.transform = `translateX(${position}px)`;
        } else {
          img.style.transform = `translateY(${position}px)`;
        }

        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return animationId;
    };

    if (img.complete) {
      const animationId = handleImageLoad();
      return () => cancelAnimationFrame(animationId);
    } else {
      img.addEventListener('load', handleImageLoad);
      return () => img.removeEventListener('load', handleImageLoad);
    }
  }, [direction, speed]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
