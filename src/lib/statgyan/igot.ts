// ---------------------------------------------------------------------------
// iGOT Karmayogi integration — adapter architecture.
//
// The adapter interface is the seam where the real iGOT API plugs in: implement
// IGOTAdapter against live endpoints and inject it here without touching UI.
// Until credentials exist, DemoAdapter serves a clearly-labelled catalogue.
// ---------------------------------------------------------------------------

import type { GapItem } from "./types";

export { IGOT_CATALOG, IGOTCourse } from "./courses";
import { IGOT_CATALOG, type IGOTCourse } from "./courses";
import { DOMAIN_MAP } from "./engine";
export interface IGOTRecommendation {
  course: IGOTCourse;
  matchScore: number;
  gapsCovered: number;
  estimatedGain: number;
  why: string;
}

export interface IGOTAdapter {
  mode: "demo" | "live";
  label: string;
  statusNote: string;
  identityMapping: string;
  searchByDomain(domainId: string): IGOTCourse[];
  recommend(gaps: GapItem[]): IGOTRecommendation[];
}

const DemoAdapter: IGOTAdapter = {
  mode: "demo",
  label: "Demo Mode",
  statusNote:
    "Simulated catalogue for demonstration. No live government API connection is claimed; the adapter interface mirrors the iGOT integration contract so live endpoints drop in without UI changes.",
  identityMapping: "Learner profile → iGOT user mapping (simulated)",

  searchByDomain(domainId) {
    return IGOT_CATALOG.filter((c) => (c.domainCoverage[domainId] ?? 0) >= 0.5);
  },

  recommend(gaps) {
    const significant = gaps.filter((g) => g.gap >= 6);
    return IGOT_CATALOG.map((course) => {
      const matched = significant.filter((g) => (course.domainCoverage[g.id] ?? 0) >= 0.5);
      if (matched.length === 0) return null;
      let coverageMass = 0;
      for (const g of matched) {
        coverageMass += (course.domainCoverage[g.id] ?? 0) * Math.min(g.gap, 40);
      }
      const totalMass = significant.reduce((s, g) => s + Math.min(g.gap, 40), 0) || 1;
      const matchScore = Math.min(99, Math.round((coverageMass / totalMass) * 130 + 18));
      const estimatedGain = Math.min(15, Math.round(coverageMass * 0.5));
      return {
        course,
        matchScore,
        gapsCovered: matched.length,
        estimatedGain,
        why: `Addresses ${matched.length} of your ${significant.length} open gap${significant.length === 1 ? "" : "s"} — strongest coverage of ${matched
          .map((g) => DOMAIN_MAP.get(g.id)?.name ?? g.id)
          .slice(0, 2)
          .join(" and ")}.`,
      } satisfies IGOTRecommendation;
    })
      .filter((r): r is IGOTRecommendation => r !== null)
      .sort((a, b) => b.matchScore - a.matchScore);
  },
};

export const igot: IGOTAdapter = DemoAdapter;

// ---------------------------------------------------------------------------
// Organisational demonstration dataset (Admin analytics)
// ---------------------------------------------------------------------------

export interface OrgDepartment {
  name: string;
  headcount: number;
  completionPct: number;
  scores: Record<string, number>;
  recommendedTraining: string;
  projectedImprovement: number;
}

const d = (id: string) => id;

export const ORG_DEMO: OrgDepartment[] = [
  {
    name: "Survey & Data Operations",
    headcount: 214,
    completionPct: 68,
    scores: { [d("survey-methodology")]: 78, [d("sampling-estimation")]: 64, [d("data-quality")]: 52, [d("statistical-analysis")]: 61, [d("data-visualization")]: 55, [d("statistical-computing")]: 47, [d("official-statistics")]: 66, [d("governance-ethics")]: 63 },
    recommendedTraining: "Data Quality Management + Applied Data Validation",
    projectedImprovement: 9,
  },
  {
    name: "Economic Statistics Division",
    headcount: 132,
    completionPct: 74,
    scores: { [d("survey-methodology")]: 70, [d("sampling-estimation")]: 72, [d("data-quality")]: 68, [d("statistical-analysis")]: 76, [d("data-visualization")]: 71, [d("statistical-computing")]: 69, [d("official-statistics")]: 74, [d("governance-ethics")]: 70 },
    recommendedTraining: "Economic Censuses & Classifications",
    projectedImprovement: 6,
  },
  {
    name: "Field Operations Wing",
    headcount: 386,
    completionPct: 41,
    scores: { [d("survey-methodology")]: 72, [d("sampling-estimation")]: 48, [d("data-quality")]: 50, [d("statistical-analysis")]: 44, [d("data-visualization")]: 42, [d("statistical-computing")]: 36, [d("official-statistics")]: 54, [d("governance-ethics")]: 58 },
    recommendedTraining: "Survey Sampling Techniques (field cohort)",
    projectedImprovement: 12,
  },
  {
    name: "Data Processing & IT",
    headcount: 98,
    completionPct: 82,
    scores: { [d("survey-methodology")]: 56, [d("sampling-estimation")]: 58, [d("data-quality")]: 74, [d("statistical-analysis")]: 66, [d("data-visualization")]: 62, [d("statistical-computing")]: 86, [d("official-statistics")]: 60, [d("governance-ethics")]: 72 },
    recommendedTraining: "Survey Design & Management",
    projectedImprovement: 7,
  },
  {
    name: "Social Statistics Division",
    headcount: 117,
    completionPct: 77,
    scores: { [d("survey-methodology")]: 73, [d("sampling-estimation")]: 69, [d("data-quality")]: 71, [d("statistical-analysis")]: 74, [d("data-visualization")]: 76, [d("statistical-computing")]: 64, [d("official-statistics")]: 79, [d("governance-ethics")]: 75 },
    recommendedTraining: "Python for Data Professionals",
    projectedImprovement: 5,
  },
];

export const ORG_NOTE =
  "Demonstration dataset illustrating organisational analytics. In production these panels aggregate real learner records across departments via role-based access.";
