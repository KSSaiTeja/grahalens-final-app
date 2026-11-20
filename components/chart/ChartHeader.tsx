import React from "react";
import { useRouter } from "expo-router";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

/**
 * Stack chrome for Chart nested screens — mirrors SkyHeader.
 */
export function ChartHeader({ title, subtitle, onBack }: Props) {
  const router = useRouter();

  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack ?? (() => router.back())}
    />
  );
}
