"use client";
import { useSearchParams } from "next/navigation";

/**
 * Renders a <meta name="robots" content="noindex,nofollow" /> tag
 * when the current URL contains any search parameters.
 * Use this on routes like /swap to avoid indexing endless query combos.
 */
export default function NoIndexOnQuery() {
    const params = useSearchParams();
    if (!params || params.toString().length === 0) return null;
    return <meta name="robots" content="noindex,nofollow" />;
} 