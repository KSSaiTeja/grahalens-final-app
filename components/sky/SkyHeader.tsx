import React from "react";
import { useRouter } from "expo-router";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

type Props = {
  title: string;
  /** Optional meta line under title. */
  subtitle?: string;
  onBack?: () => void;
};

/**
 * Stack chrome for Sky nested screens — back + title, no default header.
 */
export function SkyHeader({ title, subtitle, onBack }: Props) {
  const router = useRouter();

  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack ?? (() => router.back())}
    />
  );
}
