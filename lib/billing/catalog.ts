/**
 * Static product catalog — display prices (soft paywall + offerings fallback).
 */

export type PlanId = "yearly" | "monthly";

export type PlanOffer = {
  id: PlanId;
  productId: string;
  title: string;
  priceLabel: string;
  periodLabel: string;
  badge?: string;
  detail: string;
};

export const PRIVATE_PLANS: PlanOffer[] = [
  {
    id: "yearly",
    productId: "grahalens_private_yearly",
    title: "Yearly",
    priceLabel: "$49.99",
    periodLabel: "per year",
    badge: "3-day trial",
    detail: "Grahalens Private · billed annually after trial",
  },
  {
    id: "monthly",
    productId: "grahalens_private_monthly",
    title: "Monthly",
    priceLabel: "$7.99",
    periodLabel: "per month",
    detail: "Grahalens Private · auto-renews monthly",
  },
];

export const PAYWALL_HEADLINE = "Grahalens Private — the full observatory.";
export const PAYWALL_SUB =
  "Unlimited Lens, every Bond, Soul Cartography, and the Pattern Thread — still quiet, still precise.";

export const LEGAL_FOOTER =
  "Payment will be charged to your Apple ID / Google Play account at confirmation. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your store account settings.";
