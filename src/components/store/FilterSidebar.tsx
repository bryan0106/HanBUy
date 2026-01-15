"use client";

import { useState } from "react";
import { PriceRangeSlider } from "@/components/store/PriceRangeSlider";
import type { Category } from "@/types";

interface FilterSidebarProps {
  // Selected values
  selectedCategory: string;
  selectedBrand: string;
  selectedArtist: string;
  priceRange: [number, number];
  
  // Change handlers
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onArtistChange: (artist: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  
  // Available options
  categories: Category[];
  brands: string[];
  artists: string[];
  maxPrice: number;
  
  // Optional: initial accordion states
  defaultCategoryOpen?: boolean;
  defaultArtistOpen?: boolean;
  defaultPriceOpen?: boolean;
}

export function FilterSidebar({
  selectedCategory,
  selectedBrand,
  selectedArtist,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onArtistChange,
  onPriceRangeChange,
  categories,
  brands,
  artists,
  maxPrice,
  defaultCategoryOpen = true,
  defaultArtistOpen = false,
  defaultPriceOpen = true,
}: FilterSidebarProps) {
  const [categoryOpen, setCategoryOpen] = useState(defaultCategoryOpen);
  const [artistOpen, setArtistOpen] = useState(defaultArtistOpen);
  const [priceOpen, setPriceOpen] = useState(defaultPriceOpen);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Filters</h2>

      {/* Category Filter - Accordion */}
      <div className="mb-6 border-b border-border pb-4">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
        >
          <span>Category</span>
          <svg
            className={`h-4 w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {categoryOpen && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="all"
                checked={selectedCategory === "all"}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="mr-2"
              />
              All Products
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={selectedCategory === cat.slug}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="mr-2"
                />
                {cat.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="mb-6 border-b border-border pb-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Brand
          </h3>
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Artist Filter - Accordion */}
      <div className="mb-6 border-b border-border pb-4">
        <button
          onClick={() => setArtistOpen(!artistOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
        >
          <span>Artists</span>
          <svg
            className={`h-4 w-4 transition-transform ${artistOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {artistOpen && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            <label className="flex items-center">
              <input
                type="radio"
                name="artist"
                value="all"
                checked={selectedArtist === "all"}
                onChange={(e) => onArtistChange(e.target.value)}
                className="mr-2"
              />
              All Artists
            </label>
            {artists.map((artist) => (
              <label key={artist} className="flex items-center">
                <input
                  type="radio"
                  name="artist"
                  value={artist}
                  checked={selectedArtist === artist}
                  onChange={(e) => onArtistChange(e.target.value)}
                  className="mr-2"
                />
                {artist}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range - Adjustable Slider (Accordion) */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
        >
          <span>Price</span>
          <svg
            className={`h-4 w-4 transition-transform ${priceOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {priceOpen && (
          <div className="mt-3">
            <PriceRangeSlider
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={onPriceRangeChange}
              currency="PHP"
            />
          </div>
        )}
      </div>
    </div>
  );
}
