// iGOT Karmayogi demo catalogue — shared by the competency engine and the
// integration adapter. In live mode this list is fetched from the iGOT API.

export interface IGOTCourse {
  id: string;
  title: string;
  provider: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  durationMin: number;
  domainCoverage: Record<string, number>; // domainId -> coverage 0..1
}

export const IGOT_CATALOG: IGOTCourse[] = [
  {
    id: "igot-fos",
    title: "Fundamentals of Official Statistics",
    provider: "NSO Capacity Building",
    level: "Foundation",
    durationMin: 90,
    domainCoverage: { "official-statistics": 0.9, "governance-ethics": 0.4 },
  },
  {
    id: "igot-sst",
    title: "Survey Sampling Techniques",
    provider: "SIRD Programme",
    level: "Intermediate",
    durationMin: 120,
    domainCoverage: { "sampling-estimation": 0.95, "survey-methodology": 0.5 },
  },
  {
    id: "igot-dqf",
    title: "Data Quality Management",
    provider: "Data Governance Cell",
    level: "Foundation",
    durationMin: 75,
    domainCoverage: { "data-quality": 0.92, "governance-ethics": 0.3 },
  },
  {
    id: "igot-adv",
    title: "Applied Data Validation & Editing",
    provider: "NSO Methods Unit",
    level: "Advanced",
    durationMin: 105,
    domainCoverage: { "data-quality": 0.85, "statistical-computing": 0.45 },
  },
  {
    id: "igot-pdp",
    title: "Python for Data Professionals",
    provider: "NICT Academy",
    level: "Intermediate",
    durationMin: 180,
    domainCoverage: { "statistical-computing": 0.9, "data-quality": 0.25 },
  },
  {
    id: "igot-dvz",
    title: "Data Visualization for Official Reports",
    provider: "Communication Wing",
    level: "Foundation",
    durationMin: 60,
    domainCoverage: { "data-visualization": 0.88, "statistical-analysis": 0.2 },
  },
  {
    id: "igot-gai",
    title: "Generative AI for Government",
    provider: "Digital Governance Academy",
    level: "Intermediate",
    durationMin: 90,
    domainCoverage: { "statistical-computing": 0.7, "governance-ethics": 0.5 },
  },
  {
    id: "igot-sdc",
    title: "Statistical Disclosure Control",
    provider: "Privacy & Standards Office",
    level: "Advanced",
    durationMin: 80,
    domainCoverage: { "governance-ethics": 0.95, "data-quality": 0.35 },
  },
  {
    id: "igot-sdm",
    title: "Survey Design & Management",
    provider: "SIRD Programme",
    level: "Intermediate",
    durationMin: 140,
    domainCoverage: { "survey-methodology": 0.93, "sampling-estimation": 0.45 },
  },
  {
    id: "igot-ecc",
    title: "Economic Censuses & Classifications",
    provider: "Economic Statistics Division",
    level: "Intermediate",
    durationMin: 110,
    domainCoverage: { "official-statistics": 0.8, "statistical-analysis": 0.4 },
  },
];

/** Best-coverage course for a domain (used by the learning-path builder). */
export function findBestCourse(domainId: string): IGOTCourse | undefined {
  return [...IGOT_CATALOG]
    .sort((a, b) => (b.domainCoverage[domainId] ?? 0) - (a.domainCoverage[domainId] ?? 0))
    .find((c) => (c.domainCoverage[domainId] ?? 0) >= 0.5);
}
