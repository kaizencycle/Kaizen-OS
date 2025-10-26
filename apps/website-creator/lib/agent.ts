export async function scaffoldProfile(input: { name: string; bio?: string; links?: {title:string;href:string}[] }) {
  return {
    "@context": ["https://schema.org","https://gic.schema.org"],
    name: input.name,
    identifier: "did:gic:pending",
    bio: input.bio || "Citizen of the HIVE.",
    links: input.links || [],
    badges: [],
    proof: {}
  };
}

