"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface LikeButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LikeButton({ productId, className = "", size = "md" }: LikeButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load liked status from localStorage on mount and when storage changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const updateLikedStatus = () => {
        const likedItems = getLikedItems();
        setIsLiked(likedItems.some((item) => item.productId === productId));
      };
      
      updateLikedStatus();
      
      // Listen for storage changes (when items are liked/unliked from other tabs/pages)
      window.addEventListener("storage", updateLikedStatus);
      
      // Also listen for custom storage events (same-tab updates)
      window.addEventListener("likedItemsUpdated", updateLikedStatus);
      
      return () => {
        window.removeEventListener("storage", updateLikedStatus);
        window.removeEventListener("likedItemsUpdated", updateLikedStatus);
      };
    }
  }, [productId, isAuthenticated, user?.id]);

  const getLikedItems = (): Array<{ productId: string; likedAt: string }> => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`hanbuy_liked_${user?.id || "guest"}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLikedItems = (items: Array<{ productId: string; likedAt: string }>): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`hanbuy_liked_${user?.id || "guest"}`, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving liked items:", error);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could redirect to login or show a toast
      return;
    }

    setIsLoading(true);
    try {
      const likedItems = getLikedItems();
      
      if (isLiked) {
        // Remove from liked items
        const updated = likedItems.filter((item) => item.productId !== productId);
        saveLikedItems(updated);
        setIsLiked(false);
        
        // TODO: Call API to remove from liked items
      } else {
        // Add to liked items
        const newItem = {
          productId,
          likedAt: new Date().toISOString(),
        };
        const updated = [...likedItems, newItem];
        saveLikedItems(updated);
        setIsLiked(true);
        
        // TODO: Call API to add to liked items
      }
      
      // Dispatch custom event to update other LikeButton components in the same tab
      window.dispatchEvent(new Event("likedItemsUpdated"));
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-10 w-10 p-2",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading || !isAuthenticated}
      className={`absolute right-2 top-2 z-10 rounded-[4px] bg-white border border-[#FCE4EC] p-1.5 transition-all hover:bg-[#FFF5F7] ${
        isLiked ? "text-[#FF85A2]" : "text-[#6b7280] hover:text-[#FF85A2]"
      } ${sizeClasses[size]} ${className}`}
      aria-label={isLiked ? "Remove from liked items" : "Add to liked items"}
      title={isLiked ? "Remove from liked items" : "Add to liked items"}
    >
      <svg
        className={iconSizes[size]}
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

