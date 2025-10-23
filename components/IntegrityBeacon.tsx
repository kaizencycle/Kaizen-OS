import Script from "next/script";

type BeaconInput = {
  id: string;
  type?: "CreativeWork" | "Dataset" | "SoftwareSourceCode";
  url: string;
  name: string;
  description?: string;
  dateModified?: string;
  keywords?: string[];
  oaa: {
    kind: "pulse" | "ledger" | "memory" | "page";
    gicScore: number;
    accordsScore: number;
    freshnessScore: number;
    integrityScore: number;
    sha256?: string;
    cycle?: string;
    companion?: string;
  };
};

export default function IntegrityBeacon(props: BeaconInput) {
  const jsonld = {
    "@context": "https://schema.org",
    "@type": props.type || "CreativeWork",
    id: props.id,
    url: props.url,
    name: props.name,
    description: props.description || "",
    dateModified: props.dateModified || new Date().toISOString(),
    isAccessibleForFree: true,
    keywords: props.keywords || ["OAA","Integrity","GIC","Virtue Accords"],
    oaa: props.oaa
  };
  return (
    <Script
      id="oaa-integrity-beacon"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
    />
  );
}
