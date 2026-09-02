import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import { getPackageBySlug, getPackageSlugs, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/site/primitives";
import BookingForm from "@/components/site/BookingForm";

export async function generateStaticParams() {
  const slugs = await getPackageSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/book/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [pkg, settings] = await Promise.all([getPackageBySlug(slug), getSettings()]);
  if (!pkg) return { title: "Package not found" };

  return {
    ...(await buildMetadata({
      title: `Book ${pkg.title}`,
      description: pkg.summary,
      path: `/book/${pkg.slug}`,
      settings,
    })),
    // A booking form has no business appearing in search results.
    robots: { index: false, follow: true },
  };
}

export default async function BookPage({ params }: PageProps<"/book/[slug]">) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  return (
    <div className="bg-elevated pb-12 pt-20 sm:pt-24">
      <Container size="wide">
        <Link
          href={`/travelxl/${pkg.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-body transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to the package
        </Link>

        <div className="mt-4 flex items-center gap-4">
          {pkg.heroImage && (
            <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-lg sm:block">
              <Image
                src={pkg.heroImage}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl leading-tight text-ink sm:text-2xl">
              Request to book
            </h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-body">
              {pkg.title}
              {pkg.rating ? (
                <span className="inline-flex items-center gap-1 text-xs">
                  <Star className="size-3.5 fill-gold text-gold" />
                  {pkg.rating.toFixed(1)}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <BookingForm pkg={pkg} />
        </div>
      </Container>
    </div>
  );
}
