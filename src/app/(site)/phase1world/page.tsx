import type { Metadata } from "next";
import { CalendarDays, MapPin, Phone } from "lucide-react";
import { getInsights, getOfferingBySlug, getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import {
  Container,
  Section,
  SectionHeading,
  CTA,
  TextLink,
} from "@/components/site/primitives";
import { ImageHero } from "@/components/site/heroes";
import { InsightCard } from "@/components/site/cards";
import { TwoUp } from "@/components/site/HScroll";
import Reveal from "@/components/site/Reveal";
import Blocks from "@/components/site/Blocks";
import {
  CtaBand,
  Faq,
  ImageMosaic,
  Marquee,
  PeopleGrid,
  PillarGrid,
  SplitFeature,
  StatBand,
  Testimonials,
  unsplash,
} from "@/components/site/landing";
import { TabbedSchedule, PricingPlans } from "@/components/site/LandingClient";
import type { Plan, ScheduleTab } from "@/components/site/LandingClient";

/* --------------------------------------------------------------------- */
/* Page content                                                          */
/*                                                                       */
/* Copy lives here rather than in the CMS because this is a brand landing */
/* page with a fixed narrative. The hero image, summary and any extra     */
/* blocks are still read from the `phase1world` offering when one exists. */
/* --------------------------------------------------------------------- */

const HERO_IMAGE = unsplash("1492684223066-81342ee5ff30", 2400);
/* Delegate travel — the section is about flights, so the picture is one. */
const FEATURE_IMAGE = unsplash("1436491865332-7a61a109cc05", 1600);
const FLOOR_IMAGE = unsplash("1521737604893-d14cc237f11d", 1400);
const STAT_IMAGE = unsplash("1550525811-e5869dd03032", 1400);
const CTA_IMAGE = unsplash("1512453979798-5ea266f8880c", 2000);

/* Host cities. These double as the mosaic and as the CTA backdrop. */
const CITIES = [
  { image: unsplash("1512453979798-5ea266f8880c", 1400), title: "Dubai", note: "2026 host city" },
  { image: unsplash("1525625293386-3f8f99389edd"), title: "Singapore", note: "2025 edition" },
  { image: unsplash("1467269204594-9661b134dd2b"), title: "Lisbon", note: "2024 edition" },
  { image: unsplash("1524492412937-b28074a5d7da"), title: "Jaipur", note: "2023 edition" },
  { image: unsplash("1518684079-3c830dcef090"), title: "Abu Dhabi", note: "Private editions" },
];

const STATS = [
  {
    value: 42,
    suffix: "K+",
    label: "Delegates hosted",
    note: "Across 11 editions and four continents",
  },
  {
    value: 380,
    suffix: "+",
    label: "Speakers on stage",
    note: "Founders, operators and policy makers",
  },
  {
    value: 27,
    suffix: "",
    label: "Host cities",
    note: "From Dubai and Singapore to Lisbon",
  },
  {
    value: 96,
    suffix: "%",
    label: "Would return",
    note: "Post-event delegate survey, 2025",
  },
];

const PILLARS = [
  {
    title: "One curator, one standard",
    body: "Every session is commissioned rather than sold. Nobody buys their way onto the Phase1World stage.",
  },
  {
    title: "Built end to end",
    body: "Concept, content, production, delegate travel and the film crew all sit under one contract.",
  },
  {
    title: "Rooms sized for conversation",
    body: "Plenary for the headline, then breakouts capped at sixty so people actually speak.",
  },
  {
    title: "Content with a second life",
    body: "Talks are filmed, cut and delivered as a library you publish over the following year.",
  },
  {
    title: "Measured, not guessed",
    body: "Attendance, dwell time, meetings booked and pipeline influenced, reported inside ten days.",
  },
];

const SCHEDULE: ScheduleTab[] = [
  {
    id: "day-1",
    label: "Day 1",
    sub: "12 March",
    image: unsplash("1512453979798-5ea266f8880c", 1000),
    imageCaption: "Opening day, Madinat Jumeirah",
    slots: [
      {
        time: "09:00 – 10:30",
        title: "Opening plenary: the next phase",
        body: "The year ahead read through capital, talent and regulation, with the three signals worth planning around.",
        location: "Main auditorium",
        people: ["Ananya Rao", "Marcus Feld"],
      },
      {
        time: "11:00 – 12:30",
        title: "Category leadership workshops",
        body: "Six parallel rooms, sixty seats each, run as working sessions rather than panels.",
        location: "Breakout wing",
        people: ["Priya Nair", "Tomas Lindqvist"],
      },
      {
        time: "14:00 – 15:30",
        title: "The buyer on stage",
        body: "Enterprise buyers describe what actually moves a decision, then take unfiltered questions.",
        location: "Studio stage",
        people: ["Helena Vosloo"],
      },
      {
        time: "16:00 – 18:00",
        title: "Curated introductions",
        body: "Pre-matched meetings from the delegate list, scheduled in advance and hosted on the floor.",
        location: "Meeting terrace",
      },
    ],
  },
  {
    id: "day-2",
    label: "Day 2",
    sub: "13 March",
    image: unsplash("1492684223066-81342ee5ff30", 1000),
    imageCaption: "Working rooms, then the awards night",
    slots: [
      {
        time: "09:00 – 10:30",
        title: "Operators only",
        body: "Closed-door session for people who carry a number, under the Chatham House rule.",
        location: "Forum room",
        people: ["Marcus Feld"],
      },
      {
        time: "11:00 – 12:30",
        title: "Building for the second market",
        body: "What changes when a product crosses into a market it was not designed for.",
        location: "Main auditorium",
        people: ["Priya Nair", "Daniel Okoye"],
      },
      {
        time: "14:00 – 15:30",
        title: "Live teardowns",
        body: "Four teams put their launch in front of the room and take the critique on stage.",
        location: "Studio stage",
        people: ["Helena Vosloo", "Tomas Lindqvist"],
      },
      {
        time: "19:30 – late",
        title: "Recognition dinner",
        body: "The awards night, produced end to end by Experia at an off-site venue.",
        location: "Waterfront venue",
      },
    ],
  },
  {
    id: "day-3",
    label: "Day 3",
    sub: "14 March",
    image: unsplash("1518684079-3c830dcef090", 1000),
    imageCaption: "Field visits and the closing keynote",
    slots: [
      {
        time: "09:30 – 11:00",
        title: "Field visits",
        body: "Small groups head out to host-city businesses and come back with something to use.",
        location: "City-wide",
      },
      {
        time: "11:30 – 13:00",
        title: "Closing keynote",
        body: "One argument, thirty minutes, no slides — the talk the year gets remembered by.",
        location: "Main auditorium",
        people: ["Ananya Rao"],
      },
      {
        time: "14:00 – 17:00",
        title: "Optional city programme",
        body: "A half-day cultural or adventure track for delegates staying the weekend.",
        location: "Host city",
      },
    ],
  },
];

const SPEAKERS = [
  {
    name: "Ananya Rao",
    image: unsplash("1494790108377-be9c29b29330", 700),
    role: "Group CEO, consumer tech",
    note: "Opens and closes the summit. Fifteen years scaling across South and South-East Asia.",
  },
  {
    name: "Marcus Feld",
    image: unsplash("1472099645785-5658abf4ff4e", 700),
    role: "Partner, growth capital",
    note: "Runs the operators-only room and the closed capital briefing.",
  },
  {
    name: "Priya Nair",
    image: unsplash("1550525811-e5869dd03032", 700),
    role: "Chief product officer",
    note: "Leads the category workshops on building for a second market.",
  },
  {
    name: "Tomas Lindqvist",
    image: unsplash("1500648767791-00dcc994a43e", 700),
    role: "Head of design",
    note: "Hosts the live teardowns, and is unusually direct about it.",
  },
  {
    name: "Helena Vosloo",
    image: unsplash("1487412720507-e7ab37603c6f", 700),
    role: "Enterprise buyer, financial services",
    note: "Sits on the buyer panel and takes questions without a script.",
  },
  {
    name: "Daniel Okoye",
    image: unsplash("1506794778202-cad84cf45f1d", 700),
    role: "Founder, logistics",
    note: "Case study session on entering a market the product was not built for.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The only conference we send people to where the follow-up meetings were booked before the flight home. The curated introductions alone justified the budget.",
    name: "Rahul Menon",
    avatar: unsplash("1531427186611-ecfd6d936c79", 200),
    role: "VP Marketing, enterprise software",
  },
  {
    quote:
      "We took a delegation of twenty-two. Phase1World handled visas, flights, hotel and the on-floor schedule. Our team turned up and worked.",
    name: "Sarah Whitmore",
    avatar: unsplash("1438761681033-6461ffad8d80", 200),
    role: "Head of Events, global bank",
  },
  {
    quote:
      "Sixty-seat breakouts change the conversation completely. People stop performing and start being useful.",
    name: "Ibrahim Al Suwaidi",
    avatar: unsplash("1491528323818-fdd1faba62cc", 200),
    role: "Managing Director, family office",
  },
  {
    quote:
      "The film library we got back was the surprise. We published from that summit for eight months afterwards.",
    name: "Lena Fischer",
    avatar: unsplash("1517841905240-472988babdf9", 200),
    role: "Brand Director, mobility",
  },
];

const PLANS: Plan[] = [
  {
    name: "Delegate",
    blurb: "Full access for one, for people attending on their own account.",
    prices: {
      single: { amount: "₹34,000", unit: "per delegate", was: "₹42,000" },
      season: { amount: "₹89,000", unit: "per year", was: "₹1,26,000" },
    },
    features: [
      "All plenary and breakout sessions",
      "Curated introductions matching",
      "Delegate app and attendee list",
      "Welcome kit and lunches",
      "Session films, published post-event",
    ],
    ctaLabel: "Book a delegate pass",
    ctaHref: "/contact",
  },
  {
    name: "Delegation",
    blurb: "Five or more from one organisation, travelling and briefed together.",
    featured: true,
    prices: {
      single: { amount: "₹28,500", unit: "per delegate", was: "₹34,000" },
      season: { amount: "₹74,000", unit: "per year", was: "₹89,000" },
    },
    features: [
      "Everything in Delegate",
      "Flights, visas and hotels handled",
      "Airport transfers by Cabexperiences",
      "Reserved seating and a private meeting room",
      "Named account manager on the floor",
    ],
    ctaLabel: "Plan a delegation",
    ctaHref: "/contact",
  },
  {
    name: "Partner",
    blurb: "For brands that want a presence rather than a badge.",
    prices: {
      single: { amount: "On brief", unit: "per edition" },
      season: { amount: "On brief", unit: "per year" },
    },
    features: [
      "Ten delegate passes",
      "A commissioned session or stage moment",
      "Branded space designed by Experia",
      "Film and photography rights",
      "Post-event reporting on pipeline influenced",
    ],
    ctaLabel: "Request the partner deck",
    ctaHref: "/contact",
  },
];

const FAQS = [
  {
    q: "Who is Phase1World actually for?",
    a: "Operators — founders, functional heads and enterprise buyers with a budget and a decision in front of them. It is deliberately not a beginner conference, and the delegate list is curated to keep it that way.",
  },
  {
    q: "Can you handle travel for our whole team?",
    a: "Yes. Flights, visas, hotels and ground movement are booked by the same team that runs the summit, so there is one point of contact rather than four suppliers.",
  },
  {
    q: "Are passes transferable or refundable?",
    a: "Passes are non-refundable but freely transferable to a colleague up to seven days before the opening plenary. Tell your account manager and we reissue the badge.",
  },
  {
    q: "What do we get after the event?",
    a: "Edited session films, photography, the attendee list you consented to share with, and a report covering attendance, meetings booked and pipeline influenced — all inside ten working days.",
  },
  {
    q: "Can Phase1World run a private edition for us?",
    a: "It is the fastest growing part of the business. Same curation and production standard, your guest list, your city. Start with the contact form and ask for a private edition.",
  },
];

const MARQUEE = [
  "Curated, never sold",
  "Operators on stage",
  "Travel handled end to end",
  "Filmed for the year ahead",
];

export async function generateMetadata(): Promise<Metadata> {
  const [settings, offering] = await Promise.all([
    getSettings(),
    getOfferingBySlug("phase1world"),
  ]);

  return buildMetadata({
    seo: offering?.seo,
    title: "Phase1World — Global Business Summits & Conferences",
    description:
      "Phase1World is the summit arm of Bhancer: curated business conferences with operators on stage, delegate travel handled end to end and the content filmed for the year ahead.",
    path: "/phase1world",
    image: offering?.heroImage ?? HERO_IMAGE,
    settings,
  });
}

export default async function Phase1WorldPage() {
  const [offering, insights] = await Promise.all([
    getOfferingBySlug("phase1world"),
    getInsights(),
  ]);

  const stories = insights.slice(0, 3);

  return (
    <>
      <ImageHero
        image={offering?.heroImage ?? HERO_IMAGE}
        video={offering?.heroVideo}
        eyebrow="Phase1World"
        title="Where the next phase starts."
        lead={
          offering?.summary ||
          "A curated business summit for the people who carry a number. Three days, one host city, and a delegate list built rather than sold."
        }
        actions={
          <>
            <CTA href="/contact">Get passes</CTA>
            <CTA href="#programme" variant="light">
              See the programme
            </CTA>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-white/50" aria-hidden />
              12 – 14 March, 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-white/50" aria-hidden />
              Madinat Jumeirah, Dubai
            </span>
            <a
              href="tel:+911234567890"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Phone className="size-4 text-white/50" aria-hidden />
              +91 12345 67890
            </a>
          </div>
        }
      />

      <StatBand
        eyebrow="The summit"
        title="Eleven editions. One standard."
        lead="Phase1World started as a room of forty operators who were tired of panels. It is now the summit our clients plan their year around — and the reason is still the curation, not the venue."
        stats={STATS}
        image={STAT_IMAGE}
      />

      <Marquee items={MARQUEE} />

      <PillarGrid
        eyebrow="Why attend"
        title="What makes this one different."
        lead="Six things we hold to, edition after edition, whatever the host city costs us."
        action={<TextLink href="/work">See the work</TextLink>}
        items={PILLARS}
        media={{ image: FLOOR_IMAGE, caption: "Sixty seats, no panel." }}
      />

      <Section id="programme" className="scroll-mt-20 border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading
            eyebrow="Programme"
            title="Three days, agenda in full."
            lead="Plenary in the morning, working rooms after lunch, and the evenings kept for the reason people really travel."
          />
          <div className="mt-10 sm:mt-14">
            <TabbedSchedule tabs={SCHEDULE} />
          </div>
        </Container>
      </Section>

      <PeopleGrid
        eyebrow="On stage"
        title="Speakers who have done the job."
        lead="Commissioned, not sold. Every name below was invited because of what they have run, not what they have paid."
        people={SPEAKERS}
      />

      <ImageMosaic
        eyebrow="Where we go"
        title="Eleven editions, eleven cities."
        lead="One host city a year, chosen for the businesses in it rather than the conference centre."
        items={CITIES}
      />

      <SplitFeature
        image={FEATURE_IMAGE}
        eyebrow="Delegate travel"
        title="Turn up and work. We move everything else."
        body="Most summits end at the door of the venue. Phase1World is run by a travel company, so the flights, the visas, the hotel block and the cars are ours to get right."
        points={[
          {
            title: "One contract, one contact",
            body: "Group flights, visa paperwork, hotels and ground movement on a single invoice.",
          },
          {
            title: "Arrivals that hold up",
            body: "Airport meet-and-greet and chauffeured transfers run by Cabexperiences, tracked flight by flight.",
          },
          {
            title: "A programme around the programme",
            body: "Optional city tracks, partner activities and an extension for delegates staying the weekend.",
          },
        ]}
        action={<CTA href="/contact">Plan a delegation</CTA>}
        reverse
      />

      {offering?.blocks?.length ? <Blocks blocks={offering.blocks} /> : null}

      <Testimonials
        eyebrow="Feedback"
        title="What delegates say afterwards."
        items={TESTIMONIALS}
        trustLine="Rated 4.8 / 5 across 2,400+ post-event surveys"
      />

      <Section className="border-y border-line bg-tint">
        <Container size="wide">
          <SectionHeading
            eyebrow="Passes"
            title="Choose the right pass."
            lead="Prices are per person and include every session, the delegate app and the films afterwards."
            align="center"
          />
          <div className="mt-10 sm:mt-14">
            <PricingPlans
              plans={PLANS}
              modes={[
                { id: "single", label: "Single edition" },
                { id: "season", label: "Season pass", note: "−20%" },
              ]}
            />
          </div>
        </Container>
      </Section>

      <Faq
        eyebrow="Answers"
        title="Do you have more questions?"
        lead="A specific brief, an unusual delegation size or a private edition? Say so and we will come back with a plan rather than a brochure."
        action={<CTA href="/contact">Ask a question</CTA>}
        items={FAQS}
      />

      {stories.length > 0 && (
        <Section>
          <Container size="wide">
            <SectionHeading
              eyebrow="Insights"
              title="Latest thinking on events."
              action={<TextLink href="/insights">All insights</TextLink>}
            />
            <TwoUp className="mt-10 sm:mt-14 lg:grid-cols-3">
              {stories.map((insight, index) => (
                <Reveal key={insight._id} delay={index * 80}>
                  <InsightCard insight={insight} />
                </Reveal>
              ))}
            </TwoUp>
          </Container>
        </Section>
      )}

      <CtaBand
        eyebrow="Join the next edition"
        title="Dubai, 12 – 14 March 2026."
        lead="Tell us who is travelling and what you need out of the three days. We will come back with passes, travel and a number."
        primary={{ label: "Get passes", href: "/contact" }}
        secondary={{ label: "Talk to the team", href: "/contact" }}
        image={CTA_IMAGE}
      />
    </>
  );
}
