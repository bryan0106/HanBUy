"use client";

import { useState, useEffect } from "react";
import type { Box, TrackingEvent } from "@/types";

export function useBoxTracking(boxId?: string) {
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boxId) return;

    // TODO: Implement API call to fetch box tracking data
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      setLoading(false);
      // setBox(mockBox);
    }, 1000);
  }, [boxId]);

  return { box, loading, error };
}

