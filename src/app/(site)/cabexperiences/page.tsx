import type { Metadata } from "next";
import { Clock3, MapPin, Phone } from "lucide-react";
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
  Marquee,
  PeopleGrid,
  PillarGrid,
  SplitFeature,
  StatBand,
  Testimonials,
} from "@/components/site/landing";
import { TabbedSchedule, PricingPlans } from "@/components/site/LandingClient";
import type { Plan, ScheduleTab } from "@/components/site/LandingClient";

/* --------------------------------------------------------------------- */
/* Page content                                                          */
/*                                                                       */
/* Same structure as the Phase1World landing page, re-pointed at ground   */
/* transport: the schedule tabs carry service types instead of days, and  */
/* the people grid carries chauffeurs instead of speakers.                */
/* --------------------------------------------------------------------- */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=2400&q=80";
const FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80";

const STATS = [
  {
    value: 610,
    suffix: "+",
    label: "Vehicles on call",
    note: "Sedans, SUVs, vans and coaches",
  },
  {
    value: 38,
    suffix: "",
    label: "Cities covered",
    note: "India, the GCC and South-East Asia",
  },
  {
    value: 240,
    prefix: "",
    suffix: "K+",
    label: "Transfers completed",
    note: "Airport, city and event movement",
  },
  {
    value: 99,
    suffix: "%",
    label: "On-time arrivals",
    note: "Measured against booked pickup time",
  },
];

const PILLARS = [
  {
    title: "Chauffeurs, not drivers",
    body: "Uniformed, background-checked and trained on protocol before they carry a single guest.",
  },
  {
    title: "Flights watched, not assumed",
    body: "Every airport pickup is tracked against the live flight, so a delay moves the car, not the guest.",
  },
  {
    title: "One fare, agreed upfront",
    body: "Tolls, parking, waiting time and night charges quoted before you book. No surge, ever.",
  },
  {
    title: "Fleet movement at scale",
    body: "Forty cars against a conference schedule, dispatched from one control room with one contact.",
  },
  {
    title: "Cars that match the occasion",
    body: "An executive sedan for a board visit, a coach for the delegation, an SUV for the hill road.",
  },
  {
    title: "Accountable after the ride",
    body: "GPS trail, driver rating and a consolidated monthly statement your finance team can reconcile.",
  },
];

const SERVICES: ScheduleTab[] = [
  {
    id: "airport",
    label: "Airport transfers",
    sub: "Meet & greet",
    slots: [
      {
        time: "T−24h",
        title: "Booking confirmed with flight number",
        body: "We attach the booking to the live flight, so the car moves with the aircraft rather than the schedule you sent last week.",
        location: "Anywhere we operate",
      },
      {
        time: "T−60m",
        title: "Chauffeur details sent to the guest",
        body: "Name, photo, vehicle and registration by SMS and email, plus a live tracking link.",
      },
      {
        time: "On landing",
        title: "Meet and greet inside the terminal",
        body: "Named placard at arrivals, help with baggage, and 60 minutes of complimentary waiting on international arrivals.",
        location: "Arrivals hall",
      },
      {
        time: "After the ride",
        title: "Receipt and trip record",
        body: "Fare, route and duration filed against your cost centre the same day.",
      },
    ],
  },
  {
    id: "hourly",
    label: "City by the hour",
    sub: "Car at disposal",
    slots: [
      {
        time: "4 hours",
        title: "Half-day disposal",
        body: "A car and chauffeur held for the morning of meetings, with 40 km included and a clear per-km rate after that.",
        location: "Within city limits",
      },
      {
        time: "8 hours",
        title: "Full-day disposal",
        body: "The standard for visiting executives: 80 km included, driver breaks planned around your diary, not against it.",
      },
      {
        time: "12 hours",
        title: "Extended day",
        body: "For days that run into a dinner. A second chauffeur takes over rather than one working past the legal limit.",
      },
    ],
  },
  {
    id: "intercity",
    label: "Intercity",
    sub: "Point to point",
    slots: [
      {
        time: "Under 300 km",
        title: "Single-driver run",
        body: "Fixed one-way fare including tolls and state permits, quoted before you commit.",
      },
      {
        time: "Over 300 km",
        title: "Relay or overnight",
        body: "Either a driver change en route or a night halt, priced honestly and never left to the chauffeur to absorb.",
      },
      {
        time: "Return same day",
        title: "Wait and return",
        body: "The car stays with you at the destination. Waiting time is included in the quoted fare.",
      },
    ],
  },
  {
    id: "events",
    label: "Event fleets",
    sub: "MICE & conferences",
    slots: [
      {
        time: "Pre-event",
        title: "Movement plan built with your agenda",
        body: "Arrival waves, hotel-to-venue shuttles and VIP cars mapped against the programme before anyone lands.",
        location: "Planning desk",
      },
      {
        time: "On site",
        title: "Control room and marshals",
        body: "A dispatcher and ground marshals on the venue forecourt, so delegates never queue for a car.",
        location: "Venue forecourt",
      },
      {
        time: "Departures",
        title: "Staggered airport runs",
        body: "Departure transfers sequenced by flight, with a spare vehicle held for the ones that change.",
      },
      {
        time: "Post-event",
        title: "One reconciled invoice",
        body: "Every vehicle, hour and kilometre on a single statement, split by cost centre if you need it.",
      },
    ],
  },
];

const CHAUFFEURS = [
  {
    name: "Rajesh Kumar",
    role: "Lead chauffeur, Delhi NCR",
    note: "Nineteen years, 1.2 million kilometres, and not one at-fault claim.",
  },
  {
    name: "Sunil Pawar",
    role: "Executive fleet, Mumbai",
    note: "Runs the board-visit cars. Trained on close protection protocol.",
  },
  {
    name: "Ahmed Farouk",
    role: "Airport desk, Dubai",
    note: "Handles arrivals at DXB and DWC, including the flights nobody planned for.",
  },
  {
    name: "Meera Iyer",
    role: "Dispatch controller",
    note: "Holds the control room during event weeks. Sixty cars, one screen.",
  },
  {
    name: "Kiran Shetty",
    role: "Intercity specialist, South",
    note: "Bengaluru to the coast and back, on ghat roads, in the monsoon.",
  },
  {
    name: "Farhan Sheikh",
    role: "Training lead",
    note: "Every new chauffeur spends two weeks with him before a first guest.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Forty cars, three hotels and a conference schedule that moved twice. The control room absorbed all of it and our delegates never knew.",
    name: "Nikhil Bansal",
    role: "Events Lead, pharmaceutical major",
  },
  {
    quote:
      "Our chairman lands at odd hours. The car is there, the chauffeur is the same one each time, and nobody has ever had to call me about it.",
    name: "Grace Fernandes",
    role: "Executive Assistant to the Chair",
  },
  {
    quote:
      "We moved our whole ground transport account across after one quarter. The monthly statement alone saved my team two days a month.",
    name: "Vikram Sethi",
    role: "Head of Admin, IT services",
  },
  {
    quote:
      "Fares quoted upfront, tolls included, no arguing at the end of the trip. That is the entire pitch and they actually keep to it.",
    name: "Ayesha Rahman",
    role: "Travel Manager, consulting firm",
  },
];

const PLANS: Plan[] = [
  {
    name: "Ride",
    blurb: "One-off transfers, booked as and when you need them.",
    prices: {
      ride: { amount: "₹1,499", unit: "per transfer" },
      account: { amount: "₹1,499", unit: "per transfer" },
    },
    features: [
      "Airport meet and greet included",
      "Flight tracking and 60 min free waiting",
      "Executive sedan or SUV",
      "Tolls and parking in the quoted fare",
      "Live tracking link for the guest",
    ],
    ctaLabel: "Book a transfer",
    ctaHref: "/contact",
  },
  {
    name: "Corporate account",
    blurb: "For companies moving people every week rather than every quarter.",
    featured: true,
    prices: {
      ride: { amount: "₹1,199", unit: "per transfer", was: "₹1,499" },
      account: { amount: "₹34,999", unit: "per month", was: "₹44,000" },
    },
    features: [
      "Everything in Ride",
      "Priority dispatch and a named controller",
      "Preferred chauffeurs for repeat guests",
      "Cost centre tagging and GST invoicing",
      "One consolidated monthly statement",
    ],
    ctaLabel: "Open an account",
    ctaHref: "/contact",
  },
  {
    name: "Event fleet",
    blurb: "Conferences, incentives and roadshows that need a fleet, not a car.",
    prices: {
      ride: { amount: "On brief", unit: "per programme" },
      account: { amount: "On brief", unit: "per programme" },
    },
    features: [
      "Movement plan built against your agenda",
      "On-site control room and ground marshals",
      "Branded vehicle livery on request",
      "Standby vehicles held through the event",
      "Post-event reconciliation by cost centre",
    ],
    ctaLabel: "Brief our fleet team",
    ctaHref: "/contact",
  },
];

const FAQS = [
  {
    q: "How far in advance should we book?",
    a: "Twelve hours is comfortable for a single transfer and we will usually take a booking at four. Event fleets need two to three weeks so the movement plan can be built properly against your agenda.",
  },
  {
    q: "What happens if the flight is delayed?",
    a: "Nothing you need to do. Airport bookings are attached to the live flight, the chauffeur is re-dispatched automatically, and international arrivals carry 60 minutes of complimentary waiting from actual landing time.",
  },
  {
    q: "Is the fare really fixed?",
    a: "Yes. Tolls, parking, driver allowance, waiting time and night charges are in the quote you approve. There is no surge pricing and no end-of-trip negotiation.",
  },
  {
    q: "Can we get one invoice for the whole company?",
    a: "That is what the corporate account is for: rides tagged to cost centres through the month and settled on one GST invoice, with the full trip record attached.",
  },
  {
    q: "Do you cover cities outside India?",
    a: "We operate our own fleet across India and the GCC, and work through vetted partners in South-East Asia under the same service standard and the same single invoice.",
  },
];

const MARQUEE = [
  "Flights tracked",
  "Fares fixed upfront",
  "Chauffeurs, not drivers",
  "One invoice, every city",
];

export async function generateMetadata(): Promise<Metadata> {
  const [settings, offering] = await Promise.all([
    getSettings(),
    getOfferingBySlug("cabexperiences"),
  ]);

  return buildMetadata({
    seo: offering?.seo,
    title: "Cabexperiences — Chauffeur Transfers & Corporate Ground Transport",
    description:
      "Cabexperiences is the ground transport arm of Bhancer: chauffeur-driven airport transfers, cars at disposal, intercity runs and full event fleets, with fares fixed upfront and one invoice per account.",
    path: "/cabexperiences",
    image: offering?.heroImage ?? HERO_IMAGE,
    settings,
  });
}

export default async function CabexperiencesPage() {
  const [offering, insights] = await Promise.all([
    getOfferingBySlug("cabexperiences"),
    getInsights(),
  ]);

  const stories = insights.slice(0, 3);

  return (
    <>
      <ImageHero
        image={offering?.heroImage ?? HERO_IMAGE}
        video={offering?.heroVideo}
        eyebrow="Cabexperiences"
        title="The car is already waiting."
        lead={
          offering?.summary ||
          "Chauffeur-driven transfers, cars at disposal and full event fleets across 38 cities — with the fare agreed before you book and the flight watched before you land."
        }
        actions={
          <>
            <CTA href="/contact">Book a ride</CTA>
            <CTA href="#services" variant="light">
              See what we run
            </CTA>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-white/50" aria-hidden />
              Dispatch desk, 24 / 7
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-white/50" aria-hidden />
              38 cities · India, GCC, SE Asia
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
        eyebrow="The fleet"
        title="Ground transport, run like an airline."
        lead="Cabexperiences began as the transfer desk behind our corporate travel programmes. It runs as its own brand now, on the same principle: the car is the first and last thing a guest experiences, so it is not the part to leave to chance."
        stats={STATS}
      />

      <Marquee items={MARQUEE} />

      <PillarGrid
        eyebrow="Why us"
        title="What you actually get."
        lead="Six commitments that sit behind every booking, from a single airport pickup to a sixty-car conference fleet."
        items={PILLARS}
      />

      <Section id="services" className="scroll-mt-20 border-y border-line bg-surface">
        <Container size="wide">
          <SectionHeading
            eyebrow="Services"
            title="Four ways we move people."
            lead="Pick the one that matches the day. The chauffeur standard, the fare discipline and the after-ride record are identical across all four."
          />
          <div className="mt-10 sm:mt-14">
            <TabbedSchedule tabs={SERVICES} />
          </div>
        </Container>
      </Section>

      <PeopleGrid
        eyebrow="Behind the wheel"
        title="The people who make it work."
        lead="Directly employed, uniformed, background-checked and trained on protocol — not an aggregated pool of whoever accepted the ping."
        people={CHAUFFEURS}
      />

      <SplitFeature
        image={offering?.heroImage ?? FEATURE_IMAGE}
        eyebrow="Event fleets"
        title="Sixty cars, one schedule, nobody waiting."
        body="When a conference moves, ground transport is where it visibly succeeds or fails. We plan the movement before anyone lands and hold a control room on site while it runs."
        points={[
          {
            title: "Planned against your agenda",
            body: "Arrival waves, shuttle loops and VIP cars mapped to the programme, not improvised on the day.",
          },
          {
            title: "A control room, on site",
            body: "One dispatcher, ground marshals on the forecourt and standby vehicles held through the event.",
          },
          {
            title: "Reconciled afterwards",
            body: "Every vehicle, hour and kilometre on one statement, split by cost centre if your finance team needs it.",
          },
        ]}
        action={<CTA href="/contact">Brief our fleet team</CTA>}
        reverse
      />

      {offering?.blocks?.length ? <Blocks blocks={offering.blocks} /> : null}

      <Testimonials
        eyebrow="Feedback"
        title="What clients say after the ride."
        items={TESTIMONIALS}
        trustLine="Rated 4.9 / 5 across 18,000+ completed trips"
      />

      <Section className="border-y border-line bg-tint">
        <Container size="wide">
          <SectionHeading
            eyebrow="Fares"
            title="Pick how you want to pay."
            lead="Indicative fares for an executive sedan on a city airport transfer. Your quote is confirmed before anything is booked."
            align="center"
          />
          <div className="mt-10 sm:mt-14">
            <PricingPlans
              plans={PLANS}
              modes={[
                { id: "ride", label: "Pay per ride" },
                { id: "account", label: "Monthly account", note: "−20%" },
              ]}
              badge="Most booked"
            />
          </div>
        </Container>
      </Section>

      <Faq
        eyebrow="Answers"
        title="Do you have more questions?"
        lead="Unusual hours, a fleet requirement or a city we have not listed? Tell us the movement you need and we will price it properly."
        action={<CTA href="/contact">Ask a question</CTA>}
        items={FAQS}
      />

      {stories.length > 0 && (
        <Section>
          <Container size="wide">
            <SectionHeading
              eyebrow="Insights"
              title="Latest from the road."
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
        eyebrow="Book Cabexperiences"
        title="Tell us where and when."
        lead="One transfer or a fleet for the week — send the movement and we will come back with a chauffeur, a vehicle and a fixed fare."
        primary={{ label: "Book a ride", href: "/contact" }}
        secondary={{ label: "Open a corporate account", href: "/contact" }}
      />
    </>
  );
}
