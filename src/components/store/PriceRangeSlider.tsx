"use client";

import { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  currency = "PHP",
}: PriceRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (type: "min" | "max") => {
    setIsDragging(type);
  };

  useEffect(() => {
    if (!isDragging || !sliderRef.current) return;

    const handleMove = (clientX: number) => {
      const rect = sliderRef.current!.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = Math.round(min + percentage * (max - min));

      if (isDragging === "min") {
        const newMin = Math.min(newValue, value[1] - 1);
        onChange([newMin, value[1]]);
      } else {
        const newMax = Math.max(newValue, value[0] + 1);
        onChange([value[0], newMax]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    const handleTouchEnd = () => {
      setIsDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, value, min, max, onChange]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className="space-y-4">
      {/* Slider Track - Line Range */}
      <div
        ref={sliderRef}
        className="relative h-3 w-full rounded-full bg-grey-200 cursor-pointer"
      >
        {/* Active Range Line */}
        <div
          className="absolute h-3 rounded-full bg-pink-600 transition-all"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        {/* Min Handle */}
        <button
          type="button"
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1.5 rounded-full border-[3px] border-pink-600 bg-white shadow-lg transition-all hover:scale-125 active:scale-110 touch-none z-10"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={() => handleMouseDown("min")}
          onTouchStart={() => handleMouseDown("min")}
          aria-label="Minimum price"
        />
        {/* Max Handle */}
        <button
          type="button"
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1.5 rounded-full border-[3px] border-pink-600 bg-white shadow-lg transition-all hover:scale-125 active:scale-110 touch-none z-10"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={() => handleMouseDown("max")}
          onTouchStart={() => handleMouseDown("max")}
          aria-label="Maximum price"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-grey-600">
            {currency === "PHP" ? "₱" : "₩"}
          </span>
          <input
            type="number"
            value={value[0]}
            onChange={(e) => {
              const newMin = Math.min(Number(e.target.value), value[1] - 1);
              onChange([Math.max(min, newMin), value[1]]);
            }}
            className="w-24 rounded-lg border border-grey-300 bg-white pl-7 pr-3 py-2 text-sm text-grey-700 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            min={min}
            max={value[1] - 1}
          />
        </div>
        <span className="text-sm text-grey-600">to</span>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-grey-600">
            {currency === "PHP" ? "₱" : "₩"}
          </span>
          <input
            type="number"
            value={value[1]}
            onChange={(e) => {
              const newMax = Math.max(Number(e.target.value), value[0] + 1);
              onChange([value[0], Math.min(max, newMax)]);
            }}
            className="w-24 rounded-lg border border-grey-300 bg-white pl-7 pr-3 py-2 text-sm text-grey-700 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            min={value[0] + 1}
            max={max}
          />
        </div>
      </div>
    </div>
  );
}
