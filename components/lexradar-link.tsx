"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";

// Carry only campaign tags, never arbitrary query parameters or personal data.
export default function LexradarLink(
  props: Omit<ComponentProps<typeof Link>, "href">,
) {
  const [href, setHref] = useState("/lexradar");
  useEffect(() => {
    const tags = new URLSearchParams();
    new URLSearchParams(window.location.search).forEach((value, key) => {
      if (/^utm_(source|medium|campaign|term|content)$/.test(key))
        tags.set(key, value.slice(0, 200));
    });
    if (tags.size) setHref(`/lexradar?${tags}`);
  }, []);
  return <Link {...props} href={href} />;
}
