import type { MetadataRoute } from "next";
import { PRIVACY_POLICY_PATH, SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}${PRIVACY_POLICY_PATH}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
