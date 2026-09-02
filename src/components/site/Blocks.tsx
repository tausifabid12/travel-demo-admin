import Image from "next/image";
import {
  Container,
  Display,
  Eyebrow,
  Lead,
  RichText,
  Rule,
  CTA,
} from "@/components/site/primitives";
import Reveal from "@/components/site/Reveal";
import { Gallery } from "@/components/site/Gallery";
import type { PublicBlock } from "@/lib/queries";

/**
 * Renders the modular content blocks an offering is composed of in the admin.
 * Unknown block types are skipped rather than throwing, so adding a type to the
 * editor can never break a live page.
 */
export default function Blocks({ blocks }: { blocks: PublicBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
    </>
  );
}

function BlockRenderer({ block, index }: { block: PublicBlock; index: number }) {
  const alternate = index % 2 === 1;

  switch (block.type) {
    case "richText":
      return (
        <section className="py-14 sm:py-20">
          <Container size="wide">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-4">
                {block.heading && (
                  <Reveal>
                    <Display size="sm" className="lg:sticky lg:top-32">
                      {block.heading}
                    </Display>
                  </Reveal>
                )}
              </div>
              <div className="lg:col-span-8">
                <Reveal delay={80}>
                  <RichText html={block.body} />
                </Reveal>
              </div>
            </div>
          </Container>
        </section>
      );

    case "imageText":
      return (
        <section className="py-14 sm:py-20">
          <Container size="wide">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              {block.image && (
                <Reveal className={alternate ? "lg:order-2" : undefined}>
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={block.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              )}
              <Reveal delay={80}>
                {block.heading && <Display size="sm">{block.heading}</Display>}
                <div className="mt-6">
                  <RichText html={block.body} />
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      );

    case "cards":
      return (
        <section className="border-y border-line bg-surface py-14 sm:py-24">
          <Container size="wide">
            {block.heading && (
              <Reveal>
                <Display size="sm">{block.heading}</Display>
              </Reveal>
            )}
            <div className="mt-10 grid gap-x-10 gap-y-9 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
              {block.items.map((item, i) => (
                <Reveal key={i} delay={(i % 3) * 70}>
                  <Rule className="mb-4 sm:mb-5" />
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-ink sm:text-2xl">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2.5 text-sm leading-relaxed text-body">
                      {item.description}
                    </p>
                  )}
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      );

    case "stats":
      return (
        <section className="bg-ink py-14 sm:py-24">
          <Container size="wide">
            {block.heading && (
              <Reveal>
                <Eyebrow>{block.heading}</Eyebrow>
              </Reveal>
            )}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
              {block.items.map((item, i) => (
                <Reveal key={i} delay={i * 70}>
                  <p className="font-[family-name:var(--font-display)] text-4xl leading-none tabular-nums text-white sm:text-6xl">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm text-white/60">{item.title}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      );

    case "timeline":
      return (
        <section className="py-14 sm:py-20">
          <Container size="wide">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-4">
                {block.heading && (
                  <Reveal>
                    <Display size="sm" className="lg:sticky lg:top-32">
                      {block.heading}
                    </Display>
                  </Reveal>
                )}
              </div>
              <ol className="lg:col-span-8">
                {block.items.map((item, i) => (
                  <Reveal key={i} delay={i * 60} as="li">
                    <div className="grid grid-cols-[2.5rem_1fr] gap-5 border-t border-line py-7 sm:grid-cols-[4rem_1fr] sm:gap-8">
                      <span className="font-[family-name:var(--font-display)] text-xl leading-none tabular-nums text-gold sm:text-2xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg text-ink sm:text-2xl">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-2.5 leading-relaxed text-body">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      );

    case "gallery": {
      const images = block.items.map((i) => i.image).filter(Boolean) as string[];
      if (!images.length) return null;
      return (
        <section className="py-14 sm:py-20">
          <Container size="wide">
            {block.heading && (
              <Reveal>
                <Display size="sm" className="mb-8 sm:mb-12">
                  {block.heading}
                </Display>
              </Reveal>
            )}
            <Reveal>
              <Gallery images={images} alt={block.heading ?? "Gallery"} />
            </Reveal>
          </Container>
        </section>
      );
    }

    case "quote":
      return (
        <section className="bg-ink py-16 sm:py-28">
          <Container size="narrow" className="text-center">
            <Reveal>
              <blockquote>
                <Display size="sm" className="text-balance text-white">
                  &ldquo;{block.body}&rdquo;
                </Display>
                {block.heading && (
                  <footer className="mt-8 text-sm text-white/60">
                    {block.heading}
                  </footer>
                )}
              </blockquote>
            </Reveal>
          </Container>
        </section>
      );

    case "cta":
      return (
        <section className="py-14 sm:py-24">
          <Container size="narrow" className="text-center">
            <Reveal>
              {block.heading && <Display size="sm">{block.heading}</Display>}
              {block.body && <Lead className="mx-auto mt-6 max-w-xl">{block.body}</Lead>}
              <div className="mt-9 flex justify-center">
                <CTA href="/contact">Start a conversation</CTA>
              </div>
            </Reveal>
          </Container>
        </section>
      );

    default:
      return null;
  }
}
