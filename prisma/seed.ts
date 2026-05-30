import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  ASE_CERTS,
  EEO_GENDER,
  EEO_RACE,
  EEO_VETERAN,
  EEO_DISABILITY,
  COMPANY,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";

// ---- helpers ---------------------------------------------------------------
// Deterministic PRNG (mulberry32) so re-seeds are reproducible for tests.
let _seed = 0x9e3779b9 >>> 0;
const rng = (): number => {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = (n: number) => Math.floor(rng() * n);
const pick = <T>(a: readonly T[]): T => a[rand(a.length)];
const chance = (p: number) => rng() < p;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

// ---- shop data (≈30 shops across 5 regions / 9 districts) ------------------
type ShopSeed = {
  region: string;
  district: string;
  name: string;
  city: string;
  state: "CA" | "TX";
  zip: string;
  lat: number;
  lng: number;
};

const SHOPS: ShopSeed[] = [
  // Bay Area
  ["Bay Area", "Peninsula", "Mountain View", "Mountain View", "CA", "94040", 37.3861, -122.0839],
  ["Bay Area", "Peninsula", "San Mateo", "San Mateo", "CA", "94402", 37.563, -122.3255],
  ["Bay Area", "Peninsula", "Redwood City", "Redwood City", "CA", "94063", 37.4852, -122.2364],
  ["Bay Area", "Peninsula", "Palo Alto", "Palo Alto", "CA", "94301", 37.4419, -122.143],
  ["Bay Area", "South Bay", "San Jose", "San Jose", "CA", "95112", 37.3382, -121.8863],
  ["Bay Area", "South Bay", "Santa Clara", "Santa Clara", "CA", "95050", 37.3541, -121.9552],
  ["Bay Area", "South Bay", "Sunnyvale", "Sunnyvale", "CA", "94086", 37.3688, -122.0363],
  ["Bay Area", "San Francisco", "San Francisco", "San Francisco", "CA", "94110", 37.7749, -122.4194],
  ["Bay Area", "San Francisco", "Daly City", "Daly City", "CA", "94015", 37.6879, -122.4702],
  // Los Angeles
  ["Los Angeles", "Orange County", "Anaheim", "Anaheim", "CA", "92805", 33.8366, -117.9143],
  ["Los Angeles", "Orange County", "Orange", "Orange", "CA", "92866", 33.7879, -117.8531],
  ["Los Angeles", "Orange County", "Mission Viejo", "Mission Viejo", "CA", "92691", 33.6, -117.6719],
  ["Los Angeles", "LA Metro", "Whittier", "Whittier", "CA", "90602", 33.9792, -118.0328],
  ["Los Angeles", "LA Metro", "Bellflower", "Bellflower", "CA", "90706", 33.8817, -118.117],
  ["Los Angeles", "LA Metro", "Montclair", "Montclair", "CA", "91763", 34.0775, -117.6897],
  // San Diego
  ["San Diego", "SD County", "San Diego", "San Diego", "CA", "92103", 32.7157, -117.1611],
  ["San Diego", "SD County", "La Mesa", "La Mesa", "CA", "91942", 32.7678, -117.0231],
  ["San Diego", "SD County", "Chula Vista", "Chula Vista", "CA", "91910", 32.6401, -117.0842],
  // Sacramento
  ["Sacramento", "Sac Metro", "Sacramento", "Sacramento", "CA", "95814", 38.5816, -121.4944],
  ["Sacramento", "Sac Metro", "Orangevale", "Orangevale", "CA", "95662", 38.6785, -121.2247],
  ["Sacramento", "Sac Metro", "Roseville", "Roseville", "CA", "95661", 38.7521, -121.288],
  ["Sacramento", "Sac Metro", "Elk Grove", "Elk Grove", "CA", "95624", 38.4088, -121.3716],
  // Dallas–Fort Worth
  ["Dallas–Fort Worth", "DFW North", "Denton", "Denton", "TX", "76201", 33.2148, -97.1331],
  ["Dallas–Fort Worth", "DFW North", "Carrollton", "Carrollton", "TX", "75006", 32.9537, -96.8903],
  ["Dallas–Fort Worth", "DFW North", "North Richland Hills", "North Richland Hills", "TX", "76180", 32.8343, -97.2289],
  ["Dallas–Fort Worth", "DFW Mid", "Euless", "Euless", "TX", "76039", 32.8371, -97.082],
  ["Dallas–Fort Worth", "DFW Mid", "Pantego", "Pantego", "TX", "76013", 32.714, -97.1561],
  ["Dallas–Fort Worth", "DFW Mid", "Terrell", "Terrell", "TX", "75160", 32.736, -96.2752],
  ["Dallas–Fort Worth", "DFW Mid", "Arlington", "Arlington", "TX", "76010", 32.7357, -97.1081],
].map(
  ([region, district, name, city, state, zip, lat, lng]) =>
    ({ region, district, name, city, state, zip, lat, lng }) as ShopSeed,
);

// ---- job templates ---------------------------------------------------------
type TemplateSeed = {
  key: string;
  title: string;
  department: string;
  level: string | null;
  employmentType: string;
  payType: string;
  payMin: number;
  payMax: number;
  family: "tech" | "advisor" | "mgmt" | "corp" | "support";
};

const TEMPLATES: TemplateSeed[] = [
  { key: "tech-a", title: "Automotive Technician – A Level", department: "Repair & Maintenance", level: "A", employmentType: "FULL_TIME", payType: "HOURLY", payMin: 32, payMax: 48, family: "tech" },
  { key: "tech-b", title: "Automotive Technician – B Level", department: "Repair & Maintenance", level: "B", employmentType: "FULL_TIME", payType: "HOURLY", payMin: 24, payMax: 34, family: "tech" },
  { key: "diesel", title: "Automotive Diesel Technician", department: "Repair & Maintenance", level: null, employmentType: "FULL_TIME", payType: "HOURLY", payMin: 34, payMax: 50, family: "tech" },
  { key: "porter", title: "Automotive Porter", department: "Repair & Maintenance", level: null, employmentType: "PART_TIME", payType: "HOURLY", payMin: 17, payMax: 22, family: "tech" },
  { key: "advisor", title: "Service Advisor", department: "Sales & Service", level: null, employmentType: "FULL_TIME", payType: "HOURLY", payMin: 22, payMax: 34, family: "advisor" },
  { key: "floating-advisor", title: "Floating Service Advisor", department: "Sales & Service", level: null, employmentType: "FULL_TIME", payType: "HOURLY", payMin: 24, payMax: 36, family: "advisor" },
  { key: "agm", title: "Assistant General Manager", department: "Store Management", level: null, employmentType: "FULL_TIME", payType: "SALARY", payMin: 60000, payMax: 75000, family: "mgmt" },
  { key: "gm", title: "General Manager", department: "Store Management", level: null, employmentType: "FULL_TIME", payType: "SALARY", payMin: 80000, payMax: 110000, family: "mgmt" },
  { key: "fasttrack", title: "FastTrack Manager Trainee", department: "Store Management", level: null, employmentType: "FULL_TIME", payType: "SALARY", payMin: 55000, payMax: 65000, family: "mgmt" },
  { key: "inside-sales", title: "Inside Sales Representative (Remote)", department: "Customer Support", level: null, employmentType: "FULL_TIME", payType: "HOURLY", payMin: 20, payMax: 26, family: "support" },
  { key: "corp-dev", title: "Corporate Development Manager (Remote)", department: "People Operations", level: null, employmentType: "FULL_TIME", payType: "SALARY", payMin: 110000, payMax: 140000, family: "corp" },
];

function descriptionFor(t: TemplateSeed, place: string): string {
  const base: Record<string, string> = {
    tech: `Join our shop as a ${t.title} ${place}. You'll diagnose and repair vehicles using modern equipment, deliver transparent updates to customers, and grow your skills with paid ASE certification support.`,
    advisor: `As a ${t.title} ${place}, you'll be the friendly face customers trust — explaining recommended work clearly, building estimates, and keeping the shop running smoothly.`,
    mgmt: `Lead a Stress-Free Auto Care shop ${place}. You'll own the customer experience, coach your team, and drive store performance with full P&L responsibility and a clear path to District and Regional roles.`,
    corp: `Help scale Stress-Free Auto Care. This ${t.title} role partners across the org on growth initiatives.`,
    support: `Support customers and shops as a ${t.title}. Handle inbound inquiries, book appointments, and deliver a stress-free experience.`,
  };
  return base[t.family];
}

const REQUIREMENTS: Record<string, string> = {
  tech: "• Valid driver's license\n• Own tools (Porter: not required)\n• Eligible to work in the US\n• Must be 18+",
  advisor: "• Customer service or sales experience\n• Strong communication skills\n• Eligible to work in the US\n• Must be 18+",
  mgmt: "• 2+ years multi-unit or store leadership\n• Comfortable owning a P&L\n• Eligible to work in the US",
  corp: "• 5+ years relevant experience\n• Eligible to work in the US",
  support: "• Phone/sales experience a plus\n• Eligible to work in the US\n• Must be 18+",
};

// ---- screening question sets per family ------------------------------------
type QSeed = {
  prompt: string;
  type: string;
  options?: string[];
  required?: boolean;
  isKnockout?: boolean;
  order: number;
};

function screeningFor(family: string): QSeed[] {
  const eligibility: QSeed[] = [
    { prompt: "Are you legally authorized to work in the United States?", type: "boolean", required: true, isKnockout: true, order: 90 },
    { prompt: "Are you 18 years of age or older?", type: "boolean", required: true, isKnockout: true, order: 91 },
    { prompt: "Earliest start date", type: "text", required: false, order: 92 },
  ];
  if (family === "tech") {
    return [
      { prompt: "Which ASE certifications do you currently hold?", type: "cert", options: [...ASE_CERTS], required: false, order: 1 },
      { prompt: "Years of professional automotive experience", type: "number", required: true, order: 2 },
      { prompt: "Do you own your own set of tools?", type: "boolean", required: true, order: 3 },
      { prompt: "Availability", type: "select", options: ["Full-time", "Part-time", "Weekends only"], required: true, order: 4 },
      ...eligibility,
    ];
  }
  if (family === "advisor" || family === "support") {
    return [
      { prompt: "Years of customer service or sales experience", type: "number", required: true, order: 1 },
      { prompt: "Availability", type: "select", options: ["Full-time", "Part-time", "Weekends only"], required: true, order: 2 },
      ...eligibility,
    ];
  }
  // mgmt / corp
  return [
    { prompt: "Years of leadership / management experience", type: "number", required: true, order: 1 },
    { prompt: "Have you owned a store or department P&L?", type: "boolean", required: true, order: 2 },
    { prompt: "Are you open to relocation within the region?", type: "boolean", required: false, order: 3 },
    ...eligibility,
  ];
}

// ---- candidate name pools --------------------------------------------------
const FIRST = ["James", "Maria", "David", "Aisha", "Carlos", "Linda", "Tyler", "Priya", "Marcus", "Sofia", "Kevin", "Nina", "Andre", "Grace", "Diego", "Hannah", "Omar", "Bianca", "Sam", "Lucia"];
const LAST = ["Nguyen", "Garcia", "Smith", "Patel", "Johnson", "Lopez", "Brown", "Khan", "Williams", "Reyes", "Martinez", "Lee", "Davis", "Chen", "Ramirez", "Walker", "Hernandez", "Kim", "Taylor", "Flores"];

async function main() {
  console.log("Clearing existing data…");
  await prisma.applicationEvent.deleteMany();
  await prisma.applicationAnswer.deleteMany();
  await prisma.eEOResponse.deleteMany();
  await prisma.applicationNote.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resumeFile.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.screeningQuestion.deleteMany();
  await prisma.jobLocation.deleteMany();
  await prisma.job.deleteMany();
  await prisma.jobTemplate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.district.deleteMany();
  await prisma.region.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.trainingProgram.deleteMany();

  console.log("Seeding org tree…");
  const org = await prisma.organization.create({
    data: {
      name: COMPANY.name,
      slug: "stress-free-auto-care",
      about:
        "A modern, fast-growing auto repair company built on transparency, technology, and an obsession with customer experience.",
    },
  });

  const regionByName = new Map<string, string>();
  const districtByKey = new Map<string, string>();
  const locationByName = new Map<string, { id: string; lat: number; lng: number }>();

  for (const shop of SHOPS) {
    if (!regionByName.has(shop.region)) {
      const r = await prisma.region.create({
        data: { name: shop.region, orgId: org.id },
      });
      regionByName.set(shop.region, r.id);
    }
    const dKey = `${shop.region}::${shop.district}`;
    if (!districtByKey.has(dKey)) {
      const d = await prisma.district.create({
        data: { name: shop.district, regionId: regionByName.get(shop.region)! },
      });
      districtByKey.set(dKey, d.id);
    }
    const loc = await prisma.location.create({
      data: {
        name: `${COMPANY.name} — ${shop.name}`,
        slug: slugify(`${shop.name}-${shop.state}`),
        address: `${100 + rand(900)} Main St`,
        city: shop.city,
        state: shop.state,
        zip: shop.zip,
        lat: shop.lat,
        lng: shop.lng,
        phone: `(${200 + rand(700)}) 555-${1000 + rand(9000)}`,
        districtId: districtByKey.get(dKey)!,
      },
    });
    locationByName.set(shop.name, { id: loc.id, lat: shop.lat, lng: shop.lng });
  }

  console.log("Seeding demo admin users…");
  const hash = bcrypt.hashSync("demo1234", 10);
  const bayAreaRegionId = regionByName.get("Bay Area")!;
  const peninsulaDistrictId = districtByKey.get("Bay Area::Peninsula")!;
  const mountainViewId = locationByName.get("Mountain View")!.id;

  const corporate = await prisma.user.create({
    data: { email: "corporate@stressfree.test", name: "Casey Corporate", passwordHash: hash, role: "CORPORATE" },
  });
  await prisma.user.create({
    data: { email: "regional@stressfree.test", name: "Robin Regional", passwordHash: hash, role: "REGIONAL", regionId: bayAreaRegionId },
  });
  await prisma.user.create({
    data: { email: "district@stressfree.test", name: "Dana District", passwordHash: hash, role: "DISTRICT", districtId: peninsulaDistrictId },
  });
  await prisma.user.create({
    data: { email: "gm@stressfree.test", name: "Gabe Manager", passwordHash: hash, role: "GM", locationId: mountainViewId },
  });

  console.log("Seeding job templates…");
  const templateId = new Map<string, string>();
  for (const t of TEMPLATES) {
    const created = await prisma.jobTemplate.create({
      data: {
        title: t.title,
        department: t.department,
        level: t.level,
        employmentType: t.employmentType,
        payType: t.payType,
        payMin: t.payMin,
        payMax: t.payMax,
        description: descriptionFor(t, ""),
        requirements: REQUIREMENTS[t.family],
        screening: screeningFor(t.family) as object,
      },
    });
    templateId.set(t.key, created.id);
  }

  console.log("Seeding jobs…");
  const tplByKey = new Map(TEMPLATES.map((t) => [t.key, t]));
  const allShopNames = SHOPS.map((s) => s.name);
  // rotation of role keys assigned to shops to reach ~58 location-based jobs
  const ROTATION = ["tech-a", "advisor", "tech-b", "porter", "agm", "gm", "diesel"];
  const createdJobs: { id: string; screening: QSeed[] }[] = [];

  let rotIdx = 0;
  for (const shop of SHOPS) {
    const loc = locationByName.get(shop.name)!;
    const count = 2; // 2 jobs per shop
    for (let i = 0; i < count; i++) {
      const key = ROTATION[rotIdx % ROTATION.length];
      rotIdx++;
      const t = tplByKey.get(key)!;
      const screening = screeningFor(t.family);
      const job = await prisma.job.create({
        data: {
          title: t.title,
          slug: slugify(`${t.title}-${shop.name}`),
          department: t.department,
          level: t.level,
          employmentType: t.employmentType,
          isRemote: false,
          payType: t.payType,
          payMin: t.payMin,
          payMax: t.payMax,
          description: descriptionFor(t, `in ${shop.city}, ${shop.state}`),
          requirements: REQUIREMENTS[t.family],
          status: "OPEN",
          templateId: templateId.get(key)!,
          createdById: corporate.id,
          postedAt: daysAgo(rand(30)),
          locations: { create: [{ locationId: loc.id }] },
          questions: { create: screening },
        },
      });
      createdJobs.push({ id: job.id, screening });
    }
  }

  // One multi-location "Floating" advisor role (demonstrates JobLocation many)
  {
    const t = tplByKey.get("floating-advisor")!;
    const screening = screeningFor(t.family);
    const floatShops = ["Sacramento", "Orangevale", "Roseville"];
    const job = await prisma.job.create({
      data: {
        title: t.title,
        slug: "floating-service-advisor-sacramento",
        department: t.department,
        level: null,
        employmentType: t.employmentType,
        isRemote: false,
        payType: t.payType,
        payMin: t.payMin,
        payMax: t.payMax,
        description:
          "Cover multiple shops across the Sacramento metro as a Floating Service Advisor — variety, mileage reimbursement, and a fast path to a home store.",
        requirements: REQUIREMENTS[t.family],
        status: "OPEN",
        templateId: templateId.get("floating-advisor")!,
        createdById: corporate.id,
        postedAt: daysAgo(rand(20)),
        locations: {
          create: floatShops.map((n) => ({ locationId: locationByName.get(n)!.id })),
        },
        questions: { create: screening },
      },
    });
    createdJobs.push({ id: job.id, screening });
  }

  // Two remote roles (no location)
  for (const key of ["inside-sales", "corp-dev"]) {
    const t = tplByKey.get(key)!;
    const screening = screeningFor(t.family);
    const job = await prisma.job.create({
      data: {
        title: t.title,
        slug: slugify(t.title),
        department: t.department,
        level: null,
        employmentType: t.employmentType,
        isRemote: true,
        payType: t.payType,
        payMin: t.payMin,
        payMax: t.payMax,
        description: descriptionFor(t, "(Remote — US)"),
        requirements: REQUIREMENTS[t.family],
        status: "OPEN",
        templateId: templateId.get(key)!,
        createdById: corporate.id,
        postedAt: daysAgo(rand(15)),
        questions: { create: screening },
      },
    });
    createdJobs.push({ id: job.id, screening });
  }

  console.log(`Created ${createdJobs.length} jobs. Seeding applications…`);
  const STAGES = ["APPLIED", "APPLIED", "APPLIED", "SCREENING", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
  const SOURCES = ["careers_site", "google_jobs", "referral", "indeed"];

  for (let i = 0; i < 42; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const email = `${first}.${last}.${i}@example.com`.toLowerCase();
    const candidate = await prisma.candidate.create({
      data: { name: `${first} ${last}`, email, phone: `(${200 + rand(700)}) 555-${1000 + rand(9000)}` },
    });

    const job = pick(createdJobs);
    const stage = pick(STAGES);
    const appliedAt = daysAgo(rand(21));

    // pick a preferred location from the job's locations (if any)
    const jobLocs = await prisma.jobLocation.findMany({
      where: { jobId: job.id },
      select: { locationId: true },
    });
    const preferredLocationId =
      jobLocs.length > 0 ? pick(jobLocs).locationId : null;

    // build answers from the job's screening questions
    const questions = await prisma.screeningQuestion.findMany({
      where: { jobId: job.id },
    });
    let flagged = false;
    const answers = questions.map((q) => {
      let value: unknown;
      switch (q.type) {
        case "boolean": {
          const yes = chance(0.85);
          if (q.isKnockout && !yes) flagged = true;
          value = yes;
          break;
        }
        case "number":
          value = rand(12) + 1;
          break;
        case "select":
          value = pick((q.options as string[]) ?? ["Full-time"]);
          break;
        case "multiselect":
        case "cert": {
          const opts = (q.options as string[]) ?? [];
          value = opts.filter(() => chance(0.3)).slice(0, 3);
          break;
        }
        default:
          value = "Available immediately";
      }
      return { questionId: q.id, value: value as object };
    });

    const app = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
        preferredLocationId,
        stage,
        source: pick(SOURCES),
        flagged,
        consentAt: appliedAt,
        createdAt: appliedAt,
        answers: { create: answers },
      },
      include: { job: true },
    });

    // audit trail: APPLIED + any advancement
    const order = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
    const targetIdx = order.indexOf(stage);
    let prev: string | null = null;
    for (let s = 0; s <= Math.max(0, targetIdx); s++) {
      const to = order[s];
      if (to === "REJECTED" && stage !== "REJECTED") continue;
      await prisma.applicationEvent.create({
        data: {
          applicationId: app.id,
          fromStage: prev,
          toStage: to,
          byUserId: s === 0 ? null : corporate.id,
          createdAt: daysAgo(Math.max(0, rand(20) - s)),
        },
      });
      prev = to;
    }

    // confirmation email
    await prisma.emailLog.create({
      data: {
        to: candidate.email,
        subject: `We received your application — ${app.job.title}`,
        body: `Hi ${candidate.name},\n\nThanks for applying to ${app.job.title} at ${COMPANY.name}.`,
        applicationId: app.id,
        createdAt: appliedAt,
      },
    });

    // ~55% provide voluntary EEO data (stored separately)
    if (chance(0.55)) {
      await prisma.eEOResponse.create({
        data: {
          applicationId: app.id,
          gender: pick(EEO_GENDER),
          raceEthnicity: pick(EEO_RACE),
          veteranStatus: pick(EEO_VETERAN),
          disabilityStatus: pick(EEO_DISABILITY),
        },
      });
    }

    // some internal notes for advanced candidates
    if (targetIdx >= 2 && chance(0.6)) {
      await prisma.applicationNote.create({
        data: {
          applicationId: app.id,
          authorId: corporate.id,
          body: pick([
            "Strong phone screen — scheduling in-person.",
            "Great attitude, certifications check out.",
            "Pending reference check.",
            "Moving forward to working interview.",
          ]),
        },
      });
    }
  }

  console.log("Seeding employer-branding content…");
  await prisma.testimonial.createMany({
    data: [
      { name: "Marcus T.", role: "ASE Master Technician", locationName: "San Jose", quote: "I started as a B-tech and the cert support paid for my Master. Best move I've made.", order: 1 },
      { name: "Sofia R.", role: "Service Advisor", locationName: "Sacramento", quote: "Transparency isn't just a customer thing here — it's how they treat the team too.", order: 2 },
      { name: "Gabe M.", role: "General Manager", locationName: "Mountain View", quote: "FastTrack took me from advisor to GM in 14 months. The path is real.", order: 3 },
      { name: "Priya K.", role: "District Manager", locationName: "Bay Area", quote: "I own outcomes across five shops and I'm trusted to lead. That's rare.", order: 4 },
      { name: "Diego H.", role: "Apprentice Technician", locationName: "Anaheim", quote: "Came in with zero experience. The mentorship here is the real deal.", order: 5 },
      { name: "Hannah W.", role: "Service Advisor", locationName: "Denton", quote: "Fair pay, posted ranges, no games. I always know where I stand.", order: 6 },
    ],
  });

  await prisma.benefit.createMany({
    data: [
      { title: "Paid ASE Certification", description: "We cover the cost of ASE exams and study materials — invest in your craft on us.", icon: "Award", order: 1 },
      { title: "Health, Dental & Vision", description: "Comprehensive coverage for you and your family.", icon: "HeartPulse", order: 2 },
      { title: "401(k) Match", description: "Save for the future with a company match.", icon: "PiggyBank", order: 3 },
      { title: "Paid Time Off", description: "Real PTO plus holidays — open 7 days means we cover for each other.", icon: "Palmtree", order: 4 },
      { title: "Tool Program", description: "Tool purchase assistance so you're never out of pocket to do great work.", icon: "Wrench", order: 5 },
      { title: "Clear Career Path", description: "Apprentice → Master Tech, and Advisor → GM → District → Regional.", icon: "TrendingUp", order: 6 },
    ],
  });

  await prisma.trainingProgram.createMany({
    data: [
      { slug: "fasttrack", title: "FastTrack Manager Training", summary: "A structured path from frontline to General Manager.", body: "FastTrack is our manager-in-training program. Over 6–12 months you'll rotate through service advising, operations, and people leadership with a dedicated mentor, then step into an Assistant GM or GM role.", order: 1 },
      { slug: "ignition", title: "Ignition Apprenticeship", summary: "Earn while you learn the trade from experienced techs.", body: "No experience? No problem. Ignition pairs you with a Master Technician, pays for your ASE path, and builds you into an A-level tech.", order: 2 },
      { slug: "ase-support", title: "ASE Certification Support", summary: "We pay for the exams and the prep.", body: "Every technician gets paid access to ASE study resources and exam reimbursement. The more you certify, the more you earn.", order: 3 },
    ],
  });

  const counts = {
    regions: regionByName.size,
    districts: districtByKey.size,
    locations: locationByName.size,
    templates: TEMPLATES.length,
    jobs: createdJobs.length,
    applications: await prisma.application.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
