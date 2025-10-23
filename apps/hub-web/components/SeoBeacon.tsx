import React from "react";
import Head from "next/head";
import { makeBeacon, toLD, BeaconOpts } from "../lib/seo/beacon";
import { getSiteBaseUrl } from "../lib/seo/site";

export default function SeoBeacon(props: BeaconOpts){
  const baseUrl = getSiteBaseUrl();
  const beacon  = makeBeacon(
    {
      ...props,
      url: props.url || (typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : baseUrl + (props.id || "")),
    },
    { baseUrl, defaultName: "OAA • Integrity Beacon" }
  );
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toLD(beacon) }} />
      {/* Helpful meta for classic SEO as well */}
      {beacon.name && <meta name="title" content={beacon.name} />}
      {beacon.description && <meta name="description" content={beacon.description} />}
      <meta name="keywords" content={(beacon.keywords||[]).join(",")} />
    </Head>
  );
}
