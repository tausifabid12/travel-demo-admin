import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Destination from "../src/lib/models/Destination";
import Package from "../src/lib/models/Package";
import Enquiry from "../src/lib/models/Enquiry";
import Employee from "../src/lib/models/Employee";
import CaseStudy from "../src/lib/models/CaseStudy";
import Insight from "../src/lib/models/Insight";
import Career from "../src/lib/models/Career";
import Offering from "../src/lib/models/Offering";
import Setting from "../src/lib/models/Setting";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bhancer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bhancer.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

async function seed() {
  console.log("Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log("Clearing content collections...");
  await Promise.all([
    Destination.deleteMany({}),
    Package.deleteMany({}),
    Enquiry.deleteMany({}),
    CaseStudy.deleteMany({}),
    Insight.deleteMany({}),
    Career.deleteMany({}),
    Offering.deleteMany({}),
  ]);

  /* ---------- Admin user (idempotent, never wiped) ---------- */
  const existing = await Employee.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    await Employee.create({
      name: "Bhancer Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "SuperAdmin",
      isActive: true,
    });
    console.log(`Created SuperAdmin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  /* ---------- Destinations ---------- */
  console.log("Seeding destinations...");
  const [dubai, bali, singapore, thailand, europe, india] =
    await Destination.create([
    {
      name: "Dubai",
      slug: "dubai",
      region: "Middle East",
      description:
        "Skyline theatre, desert spectacle and world-class conference infrastructure — the Gulf's headline act for corporate travel.",
      heroImage: img("1512453979798-5ea266f8880c"),
      gallery: [img("1512453979798-5ea266f8880c"), img("1518684079-3c830dcef090")],
      isFeatured: true,
      order: 0,
    },
    {
      name: "Bali",
      slug: "bali",
      region: "Southeast Asia",
      description:
        "Cliff-edge resorts and rice-terrace calm. Bali turns an executive retreat into something people talk about for years.",
      heroImage: img("1537996194471-e657df975ab4"),
      gallery: [img("1537996194471-e657df975ab4")],
      isFeatured: true,
      order: 1,
    },
    {
      name: "Singapore",
      slug: "singapore",
      region: "Southeast Asia",
      description:
        "The most frictionless MICE city in Asia — precision logistics, and a skyline that photographs itself.",
      heroImage: img("1525625293386-3f8f99389edd"),
      isFeatured: true,
      order: 2,
    },
    {
      name: "Thailand",
      slug: "thailand",
      region: "Southeast Asia",
      description:
        "Beach-side incentive programmes and Bangkok conference capacity, at a cost base that stretches a budget further.",
      heroImage: img("1528181304800-259b08848526"),
      isFeatured: true,
      order: 3,
    },
    {
      name: "Europe",
      slug: "europe",
      region: "Europe",
      description:
        "Alpine offsites, Mediterranean incentives and city conferences, with rail links that make multi-city programmes practical.",
      heroImage: img("1467269204594-9661b134dd2b"),
      isFeatured: true,
      order: 4,
    },
    {
      name: "India",
      slug: "india",
      region: "India",
      description:
        "Palace venues in Rajasthan, backwater retreats in Kerala and metro conference capacity, without a single visa application.",
      heroImage: img("1524492412937-b28074a5d7da"),
      isFeatured: true,
      order: 5,
    },
  ]);

  /* ---------- Packages ---------- */
  console.log("Seeding packages...");
  await Package.create([
    {
      title: "Dubai Luxury MICE Experience",
      slug: "dubai-luxury-mice-experience",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 4,
      rating: 4.9,
      reviewCount: 64,
      badge: "Bestseller",
      summary:
        "Five days of conference-grade infrastructure wrapped in desert spectacle, built for leadership offsites of 40 to 200.",
      destinationId: dubai._id,
      category: "MICE",
      heroImage: img("1512453979798-5ea266f8880c"),
      gallery: [img("1512453979798-5ea266f8880c"), img("1518684079-3c830dcef090")],
      highlights: [
        "Beachfront five-star conference venue on The Palm",
        "Private desert gala with Emirati hospitality",
        "Burj Khalifa private-floor reception",
        "Dedicated on-ground event manager throughout",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival and welcome reception",
          description:
            "Private airport transfers, hotel check-in, and an evening welcome reception on the terrace.",
        },
        {
          day: 2,
          title: "Conference day one",
          description:
            "Full-day plenary with breakout rooms, AV production and catering managed end to end.",
        },
        {
          day: 3,
          title: "Desert experience",
          description:
            "Afternoon dune convoy followed by a private gala dinner under the stars.",
        },
        {
          day: 4,
          title: "Conference day two and awards",
          description:
            "Closing sessions, then an awards night at a Burj Khalifa private floor.",
        },
        {
          day: 5,
          title: "Departure",
          description: "Late checkout and staggered transfers to DXB.",
        },
      ],
      inclusions: [
        "Five-star accommodation, four nights",
        "All internal transfers",
        "Conference venue and AV production",
        "Daily breakfast, two gala dinners",
        "On-ground event management",
      ],
      exclusions: [
        "International flights",
        "Visa fees",
        "Personal expenses",
        "Travel insurance",
      ],
      durationDays: 5,
      isFeatured: true,
      order: 0,
      status: "published",
      seo: {
        metaTitle: "Dubai Luxury MICE Experience | Bhancer",
        metaDescription:
          "A five-day corporate MICE programme in Dubai: conference production, desert gala and Burj Khalifa awards night.",
      },
    },
    {
      title: "Bali Executive Retreat",
      slug: "bali-executive-retreat",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 3,
      rating: 4.8,
      reviewCount: 41,
      summary:
        "A four-day leadership reset in Ubud and Uluwatu — strategy sessions in the morning, restoration in the afternoon.",
      destinationId: bali._id,
      category: "Offsite",
      heroImage: img("1537996194471-e657df975ab4"),
      gallery: [img("1537996194471-e657df975ab4")],
      highlights: [
        "Cliff-edge villa buyout in Uluwatu",
        "Facilitated strategy sessions overlooking the ocean",
        "Rice-terrace team experience in Ubud",
        "Private chef and wellness programme",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Uluwatu",
          description: "Transfers, villa check-in and a sunset welcome dinner.",
        },
        {
          day: 2,
          title: "Strategy day",
          description:
            "Facilitated leadership sessions, breakout work and an evening beach barbecue.",
        },
        {
          day: 3,
          title: "Ubud experience day",
          description:
            "Rice-terrace trek, a local craft workshop and a long-table dinner.",
        },
        {
          day: 4,
          title: "Close and departure",
          description: "Morning wrap-up session and transfers to DPS.",
        },
      ],
      inclusions: [
        "Private villa buyout, three nights",
        "All meals with a private chef",
        "Facilitation and session materials",
        "Airport and internal transfers",
      ],
      exclusions: ["International flights", "Visa on arrival", "Spa extras"],
      durationDays: 4,
      isFeatured: true,
      order: 1,
      status: "published",
    },
    {
      title: "Singapore Incentive Programme",
      slug: "singapore-incentive-programme",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 2,
      rating: 4.7,
      reviewCount: 28,
      summary:
        "Three days rewarding top performers in Asia's most efficient city — Marina Bay, Sentosa and a Michelin closing dinner.",
      destinationId: singapore._id,
      category: "Incentive",
      heroImage: img("1525625293386-3f8f99389edd"),
      highlights: [
        "Marina Bay skyline accommodation",
        "Gardens by the Bay private evening",
        "Sentosa team challenge",
        "Michelin-starred closing dinner",
      ],
      itinerary: [
        { day: 1, title: "Arrival and Marina Bay evening", description: "Transfers, check-in and a rooftop reception." },
        { day: 2, title: "Sentosa challenge", description: "Full-day team competition followed by a beach club evening." },
        { day: 3, title: "Recognition dinner", description: "Free morning, awards lunch and a Michelin-starred farewell dinner." },
      ],
      inclusions: ["Four-star-plus accommodation", "All transfers", "Two group dinners"],
      exclusions: ["International flights", "Personal shopping"],
      durationDays: 3,
      order: 2,
      status: "published",
    },
    {
      title: "Bangkok Conference Programme",
      slug: "bangkok-conference-programme",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 2,
      summary:
        "Large-format conference delivery in Bangkok with an optional Phuket incentive extension.",
      destinationId: thailand._id,
      category: "Conference",
      heroImage: img("1528181304800-259b08848526"),
      highlights: [
        "Capacity for 500-plus delegates",
        "Full AV and stage production",
        "Optional Phuket extension",
      ],
      itinerary: [
        { day: 1, title: "Delegate arrivals", description: "Staggered transfers and registration desk setup." },
        { day: 2, title: "Main conference", description: "Plenary, breakouts and an evening river cruise." },
        { day: 3, title: "Close", description: "Closing keynote and departures or Phuket extension." },
      ],
      inclusions: ["Venue and production", "Delegate management", "Daily catering"],
      exclusions: ["Flights", "Extension costs"],
      durationDays: 3,
      order: 3,
      status: "draft",
    },
    {
      title: "Alpine Leadership Offsite",
      slug: "alpine-leadership-offsite",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 3,
      rating: 4.9,
      reviewCount: 19,
      badge: "Limited seats",
      summary:
        "Four days above the treeline in Switzerland, built for boards and senior leadership teams of twelve to forty.",
      destinationId: europe._id,
      category: "Offsite",
      heroImage: img("1467269204594-9661b134dd2b"),
      gallery: [img("1467269204594-9661b134dd2b")],
      highlights: [
        "Private chalet buyout with a dedicated chef",
        "Facilitated board sessions above the treeline",
        "Glacier excursion and an evening fondue",
        "Zurich transfers and internal rail included",
      ],
      itinerary: [
        { day: 1, title: "Arrival into Zurich", description: "Rail transfer to the resort and a welcome dinner." },
        { day: 2, title: "Strategy day one", description: "Facilitated morning sessions, free afternoon on the mountain." },
        { day: 3, title: "Strategy day two", description: "Closing sessions and a glacier excursion." },
        { day: 4, title: "Departure", description: "Rail back to Zurich with staggered flights." },
      ],
      inclusions: ["Chalet buyout, three nights", "All meals", "Facilitation", "Rail transfers"],
      exclusions: ["International flights", "Ski hire", "Travel insurance"],
      durationDays: 4,
      isFeatured: true,
      order: 4,
      status: "published",
    },
    {
      title: "Rajasthan Palace Conference",
      slug: "rajasthan-palace-conference",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 2,
      rating: 4.8,
      reviewCount: 33,
      summary:
        "A three-day conference in a Udaipur palace. No visas, no long haul, and a backdrop nobody forgets.",
      destinationId: india._id,
      category: "Conference",
      heroImage: img("1524492412937-b28074a5d7da"),
      gallery: [img("1524492412937-b28074a5d7da")],
      highlights: [
        "Heritage palace venue on Lake Pichola",
        "Full AV and stage production",
        "Gala dinner in the courtyard",
        "Domestic flights, so no visa lead time",
      ],
      itinerary: [
        { day: 1, title: "Arrivals and welcome", description: "Transfers from Udaipur airport and a lakeside reception." },
        { day: 2, title: "Conference day", description: "Full-day plenary and breakouts, then a courtyard gala." },
        { day: 3, title: "Close", description: "Closing keynote and departures." },
      ],
      inclusions: ["Palace venue and production", "Accommodation, two nights", "All catering"],
      exclusions: ["Domestic flights", "Personal expenses"],
      durationDays: 3,
      isFeatured: true,
      order: 5,
      status: "published",
    },
    {
      title: "Phuket Reward Escape",
      slug: "phuket-reward-escape",
      tripType: "Corporate",
      priceIndicator: "On request",
      durationNights: 3,
      rating: 4.6,
      reviewCount: 22,
      summary:
        "A four-day incentive on the Andaman coast, for teams that hit the number and know it.",
      destinationId: thailand._id,
      category: "Incentive",
      heroImage: img("1528181304800-259b08848526"),
      gallery: [img("1528181304800-259b08848526")],
      highlights: [
        "Beachfront resort with private villas",
        "Island-hopping day on a chartered boat",
        "Beach club awards night",
      ],
      itinerary: [
        { day: 1, title: "Arrival", description: "Transfers and a sunset welcome dinner." },
        { day: 2, title: "Island day", description: "Chartered boat to Phang Nga Bay." },
        { day: 3, title: "Awards night", description: "Free day, then a beach club recognition dinner." },
        { day: 4, title: "Departure", description: "Late checkout and transfers." },
      ],
      inclusions: ["Resort accommodation", "All transfers", "Two group dinners"],
      exclusions: ["International flights", "Spa treatments"],
      durationDays: 4,
      order: 6,
      status: "published",
    },
    {
      title: "Bali Honeymoon Escape",
      slug: "bali-honeymoon-escape",
      tripType: "Holiday",
      themes: ["Honeymoon", "Beach", "Wellness"],
      summary:
        "Six nights across Ubud and Seminyak, with a private pool villa, a floating breakfast and absolutely nothing you have to be on time for.",
      destinationId: bali._id,
      category: "Corporate Experience",
      heroImage: img("1537996194471-e657df975ab4"),
      gallery: [img("1537996194471-e657df975ab4")],
      highlights: [
        "Private pool villa for all six nights",
        "Floating breakfast and a couples spa afternoon",
        "Sunset dinner on the Uluwatu cliffs",
        "Private driver throughout",
      ],
      itinerary: [
        { day: 1, title: "Arrive in Ubud", description: "Private transfer and a welcome dinner in the rice fields." },
        { day: 2, title: "Ubud at your pace", description: "Waterfall morning, spa afternoon, nothing scheduled after." },
        { day: 3, title: "Move to Seminyak", description: "Coastal drive with a stop at Tanah Lot." },
        { day: 4, title: "Beach day", description: "Beach club and a sunset dinner at Uluwatu." },
        { day: 5, title: "Islands", description: "Day trip to Nusa Penida by fast boat." },
        { day: 6, title: "Fly home", description: "Late checkout and airport transfer." },
      ],
      inclusions: ["Six nights in private villas", "Daily breakfast", "Private driver", "All transfers"],
      exclusions: ["International flights", "Visa on arrival", "Lunches and dinners"],
      durationDays: 7,
      durationNights: 6,
      priceFrom: 84999,
      strikePrice: 104999,
      currency: "INR",
      rating: 4.9,
      reviewCount: 312,
      badge: "Bestseller",
      isFeatured: true,
      order: 10,
      status: "published",
      seo: {
        metaTitle: "Bali Honeymoon Packages | Bhancer",
        metaDescription:
          "A six-night Bali honeymoon across Ubud and Seminyak with private pool villas, from Rs 84,999 per person.",
      },
    },
    {
      title: "Dubai Family Getaway",
      slug: "dubai-family-getaway",
      tripType: "Holiday",
      themes: ["Family", "City break"],
      summary:
        "Five nights built around what children actually want to do, with enough downtime that the adults enjoy it too.",
      destinationId: dubai._id,
      category: "Corporate Experience",
      heroImage: img("1512453979798-5ea266f8880c"),
      gallery: [img("1512453979798-5ea266f8880c"), img("1518684079-3c830dcef090")],
      highlights: [
        "Burj Khalifa At The Top tickets",
        "A full day at a waterpark",
        "Desert safari with a family-friendly camp",
        "Connecting rooms held as standard",
      ],
      itinerary: [
        { day: 1, title: "Arrive in Dubai", description: "Transfers and an evening at Dubai Marina." },
        { day: 2, title: "Downtown", description: "Burj Khalifa, Dubai Mall aquarium and the fountain show." },
        { day: 3, title: "Waterpark day", description: "A full day out, nothing else booked." },
        { day: 4, title: "Desert safari", description: "Dune drive, camel ride and a barbecue camp." },
        { day: 5, title: "Fly home", description: "Free morning and airport transfer." },
      ],
      inclusions: ["Five nights, four-star plus", "Daily breakfast", "All listed tickets", "Airport transfers"],
      exclusions: ["Flights", "Visa fees", "Meals not listed"],
      durationDays: 6,
      durationNights: 5,
      priceFrom: 62999,
      strikePrice: 74999,
      currency: "INR",
      rating: 4.7,
      reviewCount: 488,
      badge: "Free cancellation",
      isFeatured: true,
      order: 11,
      status: "published",
    },
    {
      title: "Thailand Island Hopper",
      slug: "thailand-island-hopper",
      tripType: "Holiday",
      themes: ["Beach", "Adventure"],
      summary:
        "Seven nights across Phuket, Phi Phi and Krabi, moving by fast boat and staying a walk from the water throughout.",
      destinationId: thailand._id,
      category: "Corporate Experience",
      heroImage: img("1528181304800-259b08848526"),
      gallery: [img("1528181304800-259b08848526")],
      highlights: [
        "Three islands, one booking",
        "Phang Nga Bay by longtail",
        "Snorkelling at Maya Bay",
        "All inter-island transfers handled",
      ],
      itinerary: [
        { day: 1, title: "Arrive in Phuket", description: "Transfer to Patong and a free evening." },
        { day: 2, title: "Phang Nga Bay", description: "Longtail day trip through the limestone karsts." },
        { day: 3, title: "To Phi Phi", description: "Fast boat across and an afternoon on Long Beach." },
        { day: 4, title: "Maya Bay", description: "Early snorkelling trip before the crowds." },
        { day: 5, title: "To Krabi", description: "Boat to Ao Nang and a sunset at Railay." },
        { day: 6, title: "Four Islands", description: "Kayaking and a beach barbecue." },
        { day: 7, title: "Fly home", description: "Transfer to Krabi airport." },
      ],
      inclusions: ["Seven nights across three islands", "All boat transfers", "Daily breakfast", "Listed excursions"],
      exclusions: ["International flights", "Most meals", "Travel insurance"],
      durationDays: 8,
      durationNights: 7,
      priceFrom: 71999,
      strikePrice: 89999,
      currency: "INR",
      rating: 4.8,
      reviewCount: 267,
      badge: "Limited seats",
      isFeatured: true,
      order: 12,
      status: "published",
    },
    {
      title: "Kerala Backwaters & Hills",
      slug: "kerala-backwaters-and-hills",
      tripType: "Holiday",
      themes: ["Wellness", "Family", "Wildlife"],
      summary:
        "Six nights from Munnar tea country down to a private houseboat on the Alleppey backwaters. No visa, no jet lag.",
      destinationId: india._id,
      category: "Corporate Experience",
      heroImage: img("1524492412937-b28074a5d7da"),
      gallery: [img("1524492412937-b28074a5d7da")],
      highlights: [
        "Private houseboat with a cook on board",
        "Tea estate stay in Munnar",
        "Periyar wildlife boat safari",
        "Ayurvedic treatments in Kumarakom",
      ],
      itinerary: [
        { day: 1, title: "Arrive in Kochi", description: "Fort Kochi walk and a Kathakali performance." },
        { day: 2, title: "Up to Munnar", description: "Tea estate drive and an evening at altitude." },
        { day: 3, title: "Munnar", description: "Plantation walk and Eravikulam National Park." },
        { day: 4, title: "Thekkady", description: "Spice plantation and a Periyar boat safari." },
        { day: 5, title: "Alleppey houseboat", description: "Overnight on the backwaters." },
        { day: 6, title: "Kumarakom", description: "Ayurvedic treatments and a lakeside evening." },
      ],
      inclusions: ["Six nights including one houseboat", "All meals on the houseboat", "Private car and driver", "Listed entries"],
      exclusions: ["Flights", "Meals not listed", "Treatments beyond those listed"],
      durationDays: 7,
      durationNights: 6,
      priceFrom: 38999,
      strikePrice: 46999,
      currency: "INR",
      rating: 4.8,
      reviewCount: 196,
      badge: "New",
      isFeatured: true,
      order: 13,
      status: "published",
    },
    {
      title: "Singapore City Break",
      slug: "singapore-city-break",
      tripType: "Holiday",
      themes: ["City break", "Family"],
      summary:
        "Four nights of a city that runs on time, with Sentosa, Gardens by the Bay and a hawker crawl that ruins other food courts for you.",
      destinationId: singapore._id,
      category: "Corporate Experience",
      heroImage: img("1525625293386-3f8f99389edd"),
      gallery: [img("1525625293386-3f8f99389edd")],
      highlights: [
        "Gardens by the Bay after dark",
        "Universal Studios day pass",
        "Guided hawker centre crawl",
        "Marina Bay view room",
      ],
      itinerary: [
        { day: 1, title: "Arrive", description: "Transfer and an evening at Marina Bay Sands." },
        { day: 2, title: "Sentosa", description: "Universal Studios and the beach in the evening." },
        { day: 3, title: "Gardens and food", description: "Gardens by the Bay, then a hawker crawl." },
        { day: 4, title: "Fly home", description: "Free morning and airport transfer." },
      ],
      inclusions: ["Four nights central", "Daily breakfast", "Listed attraction passes", "Airport transfers"],
      exclusions: ["Flights", "Most meals"],
      durationDays: 5,
      durationNights: 4,
      priceFrom: 57999,
      currency: "INR",
      rating: 4.6,
      reviewCount: 154,
      order: 14,
      status: "published",
    },
    {
      title: "Swiss Alps Family Winter",
      slug: "swiss-alps-family-winter",
      tripType: "Holiday",
      themes: ["Family", "Adventure"],
      summary:
        "Seven nights of snow, cog railways and chocolate, based in Interlaken with day trips to Jungfraujoch and Lucerne.",
      destinationId: europe._id,
      category: "Corporate Experience",
      heroImage: img("1467269204594-9661b134dd2b"),
      gallery: [img("1467269204594-9661b134dd2b")],
      highlights: [
        "Jungfraujoch, the Top of Europe",
        "Swiss Travel Pass included",
        "Lucerne and Mount Titlis day trip",
        "Family rooms throughout",
      ],
      itinerary: [
        { day: 1, title: "Arrive in Zurich", description: "Rail to Interlaken and a lakeside evening." },
        { day: 2, title: "Jungfraujoch", description: "Cog railway to the Top of Europe." },
        { day: 3, title: "Grindelwald", description: "Snow day and the First Cliff Walk." },
        { day: 4, title: "Lucerne", description: "Old town, lake cruise and Mount Titlis." },
        { day: 5, title: "Bern", description: "A day in the capital." },
        { day: 6, title: "Free day", description: "Paragliding or a slow day in Interlaken." },
        { day: 7, title: "Fly home", description: "Rail back to Zurich." },
      ],
      inclusions: ["Seven nights", "Swiss Travel Pass", "Daily breakfast", "Listed excursions"],
      exclusions: ["International flights", "Schengen visa", "Lunches and dinners"],
      durationDays: 8,
      durationNights: 7,
      priceFrom: 189999,
      strikePrice: 219999,
      currency: "INR",
      rating: 4.9,
      reviewCount: 88,
      badge: "Group discount",
      order: 15,
      status: "published",
    },
  ]);

  /* ---------- Offerings ---------- */
  console.log("Seeding offerings...");
  await Offering.create([
    {
      title: "TravelXL",
      slug: "travelxl",
      summary:
        "Corporate travel, business travel, MICE and incentive programmes, designed and delivered end to end.",
      heroImage: img("1436491865332-7a61a109cc05"),
      order: 0,
      status: "published",
      blocks: [
        {
          type: "richText",
          heading: "Corporate travel, handled properly",
          body: "<p>TravelXL is the corporate arm of Bhancer. We plan, cost and run programmes for teams that need travel to work as hard as they do.</p>",
          items: [],
        },
        {
          type: "cards",
          heading: "Service pillars",
          items: [
            { title: "Corporate Travel", description: "Policy-aligned programmes with a single point of contact." },
            { title: "Business Travel", description: "Individual and small-group itineraries, managed continuously." },
            { title: "MICE", description: "Meetings, incentives, conferences and exhibitions at any scale." },
            { title: "Incentive Travel", description: "Reward programmes people actually compete for." },
            { title: "Corporate Offsites", description: "Leadership retreats and team resets." },
            { title: "Conferences", description: "Venue, production, delegate management, the lot." },
            { title: "Corporate Experiences", description: "One-off moments built around a business objective." },
          ],
        },
      ],
    },
    {
      title: "Experia",
      slug: "experia",
      summary:
        "Experience design and live events for brands that want to be remembered rather than merely seen.",
      heroImage: img("1492684223066-81342ee5ff30"),
      order: 1,
      status: "published",
      blocks: [
        {
          type: "richText",
          heading: "Experiences, engineered",
          body: "<p>Experia builds live brand moments — launches, activations and retail experiences — from concept through to strike.</p>",
          items: [],
        },
      ],
    },
  ]);

  /* ---------- Case studies ---------- */
  console.log("Seeding case studies...");
  await CaseStudy.create([
    {
      title: "Moving 320 delegates to Dubai in six weeks",
      slug: "moving-320-delegates-to-dubai",
      clientName: "A global fintech",
      industry: "Financial Services",
      destinationId: dubai._id,
      serviceCategory: "MICE",
      tags: ["MICE", "Dubai", "Conference"],
      heroImage: img("1512453979798-5ea266f8880c"),
      summary:
        "A postponed annual kickoff left six weeks to move 320 people across eleven countries into one room in Dubai.",
      challenge:
        "<p>The original venue fell through eight weeks out. Three hundred and twenty delegates across eleven countries already had the dates in their calendars, and the board would not move them.</p>",
      solution:
        "<p>We secured an alternative Palm Jumeirah venue within four days, rebuilt the travel matrix around eleven departure cities, and ran a single delegate desk so nobody had to chase two suppliers.</p>",
      results:
        "<p>Every delegate arrived. The programme came in under the original budget, and the client has since retained us for three consecutive years.</p>",
      metrics: [
        { label: "Delegates", value: "320" },
        { label: "Departure cities", value: "11" },
        { label: "Under budget", value: "8%" },
        { label: "Weeks to deliver", value: "6" },
      ],
      testimonialQuote:
        "We had six weeks and no venue. Bhancer had a plan in four days and never once made it our problem.",
      testimonialAuthor: "Head of Internal Communications",
      testimonialRole: "Global fintech",
      isFeatured: true,
      order: 0,
      status: "published",
    },
    {
      title: "An incentive programme people competed for",
      slug: "an-incentive-programme-people-competed-for",
      clientName: "A pharmaceutical major",
      industry: "Pharmaceuticals",
      destinationId: singapore._id,
      serviceCategory: "Incentive",
      tags: ["Incentive", "Singapore"],
      heroImage: img("1525625293386-3f8f99389edd"),
      summary:
        "Sales attainment had flattened for three quarters. The reward, not the target, turned out to be the problem.",
      challenge:
        "<p>The existing incentive was a cash bonus. It was easy to administer and completely forgettable.</p>",
      solution:
        "<p>We designed a three-day Singapore programme with a recognition dinner at its centre, then built the qualification criteria around it so the trip itself became the goal.</p>",
      results:
        "<p>Qualification rates rose 41 percent in the first cycle, and the programme is now in its fourth year.</p>",
      metrics: [
        { label: "Qualification uplift", value: "41%" },
        { label: "Programme years", value: "4" },
        { label: "Qualifiers", value: "180" },
      ],
      testimonialQuote:
        "People plan their year around it now. That never happened with the bonus.",
      testimonialAuthor: "VP Sales, APAC",
      isFeatured: true,
      order: 1,
      status: "published",
    },
    {
      title: "A product launch that filled a warehouse",
      slug: "a-product-launch-that-filled-a-warehouse",
      clientName: "A consumer electronics brand",
      industry: "Consumer Electronics",
      destinationId: india._id,
      serviceCategory: "Experia",
      tags: ["Experia", "Launch", "India"],
      heroImage: img("1492684223066-81342ee5ff30"),
      summary:
        "Six weeks to turn a disused Mumbai warehouse into a launch venue for 900 guests and a national press pack.",
      challenge:
        "<p>The brand wanted a venue nobody had seen before, in a city where every usable space is booked twelve months out.</p>",
      solution:
        "<p>We found a disused warehouse in Sewri, took it on a short lease, and built the entire venue inside it. Power, cooling, staging, sound and a press room.</p>",
      results:
        "<p>Nine hundred guests, coverage across every major title, and a venue the brand has since used twice more.</p>",
      metrics: [
        { label: "Guests", value: "900" },
        { label: "Build days", value: "18" },
        { label: "Press pickups", value: "60+" },
      ],
      testimonialQuote:
        "They handed us a warehouse and called it a venue. Six weeks later it was the best launch we have ever run.",
      testimonialAuthor: "Marketing Director",
      testimonialRole: "Consumer electronics brand",
      order: 2,
      status: "published",
    },
  ]);

  /* ---------- Insights ---------- */
  console.log("Seeding insights...");
  await Insight.create([
    {
      title: "What corporate travel budgets actually buy in 2026",
      slug: "what-corporate-travel-budgets-actually-buy-in-2026",
      excerpt:
        "Rates have settled but the shape of spend has changed. Here is where the money is going, and what it now buys.",
      body: "<p>Three years of rate volatility have ended, but the composition of corporate travel spend looks nothing like it did in 2019.</p><h2>Fewer trips, larger programmes</h2><p>The single-traveller sales trip has partly given way to consolidated group moments. Clients are running fewer, bigger programmes and expecting each one to carry more weight.</p><h2>Production is the new line item</h2><p>What used to be a room booking is now a produced event. AV, staging and content account for a materially larger share of budget than they did five years ago.</p>",
      featuredImage: img("1436491865332-7a61a109cc05"),
      author: "Bhancer Editorial",
      category: "Corporate Travel Trends",
      tags: ["Budgets", "Trends"],
      publishDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      readingMinutes: 6,
      status: "published",
    },
    {
      title: "Choosing between Dubai, Singapore and Bali for your offsite",
      slug: "choosing-between-dubai-singapore-and-bali",
      excerpt:
        "Three very different answers to the same question. A practical comparison on cost, logistics and what your team will remember.",
      body: "<p>Every offsite brief eventually narrows to a shortlist, and these three come up more than any others.</p><h2>Dubai</h2><p>Unmatched conference infrastructure and four-hour reach from most of India and Europe. Strongest when the agenda is dense.</p><h2>Singapore</h2><p>The most frictionless city in Asia for logistics. Expensive, and worth it when the programme is short.</p><h2>Bali</h2><p>The right answer when the goal is a reset rather than a summit.</p>",
      featuredImage: img("1537996194471-e657df975ab4"),
      author: "Bhancer Editorial",
      category: "Destination Guides",
      tags: ["Dubai", "Singapore", "Bali", "Offsites"],
      publishDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      readingMinutes: 8,
      status: "published",
    },
    {
      title: "Five things that go wrong on a first international offsite",
      slug: "five-things-that-go-wrong-on-a-first-international-offsite",
      excerpt:
        "Visas, per-diems, dietary requirements, the mid-afternoon slump and the flight home. The failures are predictable, which is what makes them avoidable.",
      body: "<p>Nobody gets the first one entirely right. These are the five that come up most often.</p><h2>Visa lead times</h2><p>The single most common reason a programme slips. Build backwards from the slowest passport in the group, not the fastest.</p><h2>The mid-afternoon slump</h2><p>Agendas are written in the morning by people who are alert. Put the hardest session before lunch and something physical after it.</p><h2>Per-diems nobody explained</h2><p>If people do not know what is covered, they either overspend or go without. Both damage the programme.</p>",
      featuredImage: img("1525625293386-3f8f99389edd"),
      author: "Bhancer Editorial",
      category: "Event Planning",
      tags: ["Offsites", "Operations"],
      publishDate: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
      readingMinutes: 5,
      status: "published",
    },
    {
      title: "A scheduled post that should not be visible yet",
      slug: "a-scheduled-post",
      excerpt:
        "This exists to prove the publish gate works — it is published but dated in the future.",
      body: "<p>If you can read this on the public site, the scheduling gate is broken.</p>",
      author: "Bhancer Editorial",
      category: "Company News",
      publishDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "published",
    },
  ]);

  /* ---------- Careers ---------- */
  console.log("Seeding careers...");
  await Career.create([
    {
      jobTitle: "Senior Event Producer",
      slug: "senior-event-producer",
      department: "Operations",
      location: "Mumbai",
      type: "Full-time",
      summary:
        "Own the delivery of large-format corporate programmes from brief to strike.",
      description:
        "<p>You will run programmes of 100 to 500 delegates end to end, holding the client relationship and the supplier chain at the same time.</p>",
      requirements: [
        "Six or more years producing corporate events",
        "Experience with international delegate movement",
        "Comfortable owning a six-figure budget",
      ],
      benefits: ["Health cover", "Travel allowance", "Annual offsite"],
      status: "active",
    },
    {
      jobTitle: "Corporate Travel Consultant",
      slug: "corporate-travel-consultant",
      department: "TravelXL",
      location: "Mumbai",
      type: "Full-time",
      summary: "Manage a portfolio of corporate accounts and their travel programmes.",
      description:
        "<p>You will be the single point of contact for a set of corporate clients, handling everything from routine bookings to programme design.</p>",
      requirements: ["Three or more years in corporate travel", "GDS proficiency"],
      benefits: ["Health cover", "Performance incentive"],
      status: "active",
    },
    {
      jobTitle: "Client Partner, Experia",
      slug: "client-partner-experia",
      department: "Experia",
      location: "Remote, India",
      type: "Contract",
      summary: "Grow the Experia book through brand and agency relationships.",
      description: "<p>A business development role with delivery oversight.</p>",
      requirements: ["Agency-side experience", "An existing brand network"],
      benefits: ["Uncapped commission"],
      status: "active",
    },
  ]);

  /* ---------- Enquiries ---------- */
  console.log("Seeding enquiries...");
  const packages = await Package.find({}).lean();
  await Enquiry.create([
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "9876543210",
      company: "Northwind Technologies",
      message:
        "We are planning a leadership offsite for 60 people in Q1 and Dubai is the front-runner. Could you send an outline and indicative costs?",
      source: "TravelXL Package",
      sourcePage: "/travelxl/dubai-luxury-mice-experience",
      packageId: packages[0]?._id,
      groupSize: "60",
      preferredDates: "February 2027",
      budgetRange: "INR 60-80 lakh",
      status: "New",
    },
    {
      name: "Arjun Mehta",
      email: "arjun@example.com",
      company: "Vertex Pharma",
      message:
        "Looking for an incentive programme for 120 qualifiers. Singapore or Bali. Please get in touch.",
      source: "Contact Page",
      sourcePage: "/contact",
      serviceInterest: "Incentive Travel",
      status: "In Progress",
    },
    {
      name: "Sana Kapoor",
      email: "sana.k@example.com",
      company: "Lumen Retail",
      message: "Interested in Experia for a store launch in Bengaluru this autumn.",
      source: "Offering",
      sourcePage: "/offerings/experia",
      status: "Responded",
    },
  ]);

  /* ---------- Settings ---------- */
  console.log("Seeding settings...");
  const featured = packages.filter((p) => p.isFeatured).map((p) => p._id);
  const featuredCases = await CaseStudy.find({ isFeatured: true }).lean();

  await Setting.findOneAndUpdate(
    {},
    {
      $set: {
        siteTitle: "Bhancer",
        siteDescription:
          "Holiday packages, honeymoons and group getaways, plus corporate travel and MICE through TravelXL.",
        contact: {
          email: "hello@bhancer.com",
          phone: "+91 22 0000 0000",
          whatsapp: "+919876543210",
          addressLines: ["Bhancer", "Bandra Kurla Complex", "Mumbai 400051", "India"],
          responsePromise: "We respond within 24 hours",
        },
        social: {
          linkedin: "https://linkedin.com",
          instagram: "https://instagram.com",
        },
        homepage: {
          heroHeadline: "Holidays worth taking the leave for.",
          heroSubheadline:
            "Handpicked packages across 38 destinations, shaped around how you actually want to travel, then run by people who pick up the phone.",
          heroImageUrl: img("1436491865332-7a61a109cc05", 2400),
          featuredPackageIds: featured,
          featuredCaseStudyIds: featuredCases.map((c) => c._id),
          stats: [
            { label: "Trips planned", value: "12,000+" },
            { label: "Destinations", value: "38" },
            { label: "Average rating", value: "4.8" },
            { label: "Travellers who rebook", value: "94%" },
          ],
        },
        notifications: {
          enquiryRecipients: [ADMIN_EMAIL],
          careersRecipients: [ADMIN_EMAIL],
          emailEnabled: false,
          whatsappEnabled: false,
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log("\nSeed complete.");
  console.log(`  Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
