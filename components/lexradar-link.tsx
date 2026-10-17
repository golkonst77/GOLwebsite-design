"use client";

import Link from "next/link";
import { collectUtm } from "@/lib/lexradar-constants";
import { useEffect, useState, type ComponentProps } from "react";

// Carry only campaign tags, never arbitrary query parameters or personal data.
export default function LexradarLink(
  props: Omit<ComponentProps<typeof Link>, "href">,
) {
  const [href, setHref] = useState("/lexradar");
  useEffect(() => {
    const tags = new URLSearchParams(collectUtm(window.location.search));
    if (tags.size) setHref(`/lexradar?${tags}`);
  }, []);
  return <Link {...props} href={href} />;
}
