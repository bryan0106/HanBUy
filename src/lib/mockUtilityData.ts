// Mock Utility Data (Box Types, Couriers, etc.)
import type { BoxType, Courier } from "@/services/utilityService";

// Re-export types for convenience
export type { BoxType, Courier };

// Mock Box Types
export const mockBoxTypes: BoxType[] = [
  {
    code: "small",
    name: "Small Box",
    description: "For small items (up to 2kg)",
    color: "#3B82F6",
  },
  {
    code: "medium",
    name: "Medium Box",
    description: "For medium items (2-5kg)",
    color: "#10B981",
  },
  {
    code: "large",
    name: "Large Box",
    description: "For large items (5-10kg)",
    color: "#F59E0B",
  },
];

// Mock Couriers
export const mockCouriers: Courier[] = [
  {
    id: "jnt",
    code: "JNT",
    name: "J&T Express",
    description: "Fast and reliable delivery",
    estimatedDays: 2,
  },
  {
    id: "lbc",
    code: "LBC",
    name: "LBC Express",
    description: "Nationwide coverage",
    estimatedDays: 3,
  },
  {
    id: "2go",
    code: "2GO",
    name: "2GO Express",
    description: "Reliable shipping service",
    estimatedDays: 3,
  },
  {
    id: "grab",
    code: "GRAB",
    name: "Grab Express",
    description: "Same-day delivery available",
    estimatedDays: 1,
  },
  {
    id: "lalamove",
    code: "LALAMOVE",
    name: "Lalamove",
    description: "On-demand delivery",
    estimatedDays: 1,
  },
  {
    id: "flash",
    code: "FLASH",
    name: "Flash Express",
    description: "Quick delivery service",
    estimatedDays: 2,
  },
];

// Mock Utility Service
export const mockUtilityService = {
  getBoxTypes: (): Promise<BoxType[]> => {
    return Promise.resolve(mockBoxTypes);
  },
  getCouriers: (): Promise<Courier[]> => {
    return Promise.resolve(mockCouriers);
  },
};

