import type { LaundryService, ServiceCategory } from "./types";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  wash: "Wash & Fold",
  dryclean: "Dry Cleaning",
  iron: "Iron Press",
  saree: "Saree Care",
};

export const SERVICES: LaundryService[] = [
  {
    slug: "wash-fold",
    name: "Wash & Fold",
    category: "wash",
    tagline: "Everyday laundry, hotel-neat",
    description:
      "Machine wash in soft water with pH-balanced detergent, tumble dried and folded into fresh packs. Charged by weight.",
    price: 40,
    unit: "piece",
    turnaround: "48 hours",
    highlights: ["Soft water wash", "Separate load per family", "Fabric softener finish"],
  },
  {
    slug: "wash-iron",
    name: "Wash & Iron",
    category: "wash",
    tagline: "Wardrobe-ready daily wear",
    description:
      "Everything in Wash & Fold, plus a full steam press so shirts and trousers come back hanger-ready.",
    price: 40,
    unit: "piece",
    turnaround: "48 hours",
    highlights: ["Steam pressed", "Collar & cuff detailing", "Hanger packed"],
  },
  {
    slug: "dry-cleaning",
    name: "Premium Dry Cleaning",
    category: "dryclean",
    tagline: "For suits, silks and sherwanis",
    description:
      "Solvent-based cleaning for delicate and structured garments, with spot treatment and shape-preserving finishing.",
    price: 199,
    unit: "pair of pieces",
    turnaround: "72 hours",
    highlights: ["Stain pre-treatment", "Shape retention", "Breathable garment cover"],
  },
  {
    slug: "iron-press",
    name: "Iron Press Only",
    category: "iron",
    tagline: "Crisp creases, zero effort",
    description:
      "Professional steam pressing for clothes you have already washed at home. Ideal for weekly office wear.",
    price: 10,
    unit: "piece",
    turnaround: "24 hours",
    highlights: ["24-hour turnaround", "Temperature-matched to fabric", "Crease-guard folding"],
  },
  {
    slug: "saree-roll-polish",
    name: "Saree Roll Polish",
    category: "saree",
    tagline: "Showroom shine for your sarees",
    description:
      "Traditional roll polish that restores stiffness, fall and lustre to cotton and silk sarees without harming zari work.",
    price: 149,
    unit: "piece",
    turnaround: "72 hours",
    highlights: ["Zari-safe process", "Restores fall & body", "Rolled, not folded"],
  },
  {
    slug: "saree-dryclean",
    name: "Saree Dry Clean & Fall Fix",
    category: "saree",
    tagline: "Heritage silks handled by hand",
    description:
      "Gentle hand-finished dry cleaning for heavy silk and bridal sarees, with optional fall stitching and pico work.",
    price: 299,
    unit: "piece",
    turnaround: "96 hours",
    highlights: ["Hand finishing", "Bridal-grade care", "Fall stitching available"],
  },
];

export function getService(slug: string): LaundryService | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export const DELIVERY_FEE = 0;
export const FREE_PICKUP_MIN = 199;

export const PICKUP_SLOTS = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "16:00 – 18:00",
  "18:00 – 20:00",
] as const;

export const SERVICE_PINCODES = [
  "360001",
  "360002",
  "360003",
  "360004",
  "360005",
  "360006",
  "360007",
  "360020",
];
