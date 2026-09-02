import type { Metadata } from "next";
import { getDestinations, getPackages, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/site/primitives";
import { DestinationTile } from "@/components/site/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Destinations",
    description:
      "Every destination Bhancer plans trips to, with the packages and lead-in prices for each.",
    path: "/destinations",
    settings,
  });
}

export default async function DestinationsPage() {
  const [destinations, packages] = await Promise.all([
    getDestinations(),
    getPackages(),
  ]);

  // Group by region so the page reads like an atlas rather than a flat grid.
  const byRegion = destinations.reduce<Record<string, typeof destinations>>(
    (acc, destination) => {
      (acc[destination.region] ??= []).push(destination);
      return acc;
    },
    {},
  );

  const regions = Object.keys(byRegion).sort();

  return (
    <div className="pt-20 sm:pt-24">
      <Container size="wide">
        <header className="py-5 sm:py-7">
          <h1 className="font-[family-name:var(--font-display)] text-xl leading-tight text-ink sm:text-3xl">
            Where we go
          </h1>
          <p className="mt-1 text-sm text-body">
            {destinations.length} destinations across {regions.length} regions.
            Places our team has walked, costed and delivered in.
          </p>
        </header>

        <div className="flex flex-col gap-8 pb-12 sm:gap-10">
          {regions.map((region) => (
            <section key={region}>
              <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand">
                {region}
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                {byRegion[region].map((destination) => (
                  <DestinationTile
                    key={destination._id}
                    destination={destination}
                    packages={packages}
                    href={`/destinations/${
                      destination.slug ??
                      destination.name.toLowerCase().replace(/\s+/g, "-")
                    }`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
