import { categories, getAllProjects, intents } from "@/lib/catalog";
import {
  EMPTY_FILTERS,
  filterProjects,
  parseSearchQuery,
  serializeFilters,
  sortProjects,
  type FilterState,
} from "@/lib/filters";
import { formatAmount, formatArea, formatBedrooms, formatPriceFrom, parseBudgetInput } from "@/lib/format";
import { CATEGORY_LABEL, PURPOSE_LABEL } from "@/lib/labels";
import type { IntentSlug, Project, Purpose } from "@/types/catalog";

export const EXAMPLE_PROMPTS = [
  "Show me villas under ₹3 crore",
  "Which properties have rental income potential?",
  "I want a plot for long-term investment",
  "Compare Omaxe Chowk and another commercial opportunity",
  "Which properties are suitable for self-use?",
  "I have ₹2 crore and want a second home near Goa",
] as const;

export const MAX_QUESTION_LENGTH = 300;
export const MAX_RESULTS = 6;

export type AdvisorIntent = "search" | "compare" | "unclear";

export interface AdvisorAnswer {
  question: string;
  intent: AdvisorIntent;
  /** One sentence restating what the question was read as. */
  interpretation: string;
  /** The criteria the answer was built on, as chips. */
  criteria: string[];
  projects: Project[];
  /** Slugs to place in the comparison, in order, when the question compares. */
  compare: string[];
  /** Honest qualifications: unpublished prices, single-project categories, widened sets. */
  caveats: string[];
  followUps: string[];
  filters: FilterState;
  /** The same criteria in the discovery engine, or null when nothing was parsed. */
  href: string | null;
}

/** The wire shape of an answer: projects reduced to slugs. */
export interface AdvisorEnvelope {
  question: string;
  intent: AdvisorIntent;
  interpretation: string;
  criteria: string[];
  slugs: string[];
  compare: string[];
  caveats: string[];
  followUps: string[];
  href: string | null;
}

const PURPOSE_PATTERNS: Array<[RegExp, Purpose[]]> = [
  [/\b(rental|rent|rented|renting|tenant|tenants|lease|leased|yield|income)\b/, ["rental-income", "commercial-income"]],
  [/\b(self[- ]?use|own use|end[- ]?use|live in|to live|living in|move in|for myself|for my family|our own home)\b/, ["self-use"]],
  [/\b(second home|holiday home|weekend home|vacation|getaway|escape)\b/, ["second-home"]],
  [/\b(long[- ]term|hold|holding|appreciation|appreciate|capital|land[- ]?bank(?:ing)?|wealth)\b/, ["capital-appreciation", "land-banking"]],
  [/\b(invest|investment|investments|investor|investing|returns?|roi)\b/, ["investment"]],
];

const COMPARE_PATTERN = /\b(compare|comparison|comparing|versus|vs\.?|against|difference between|side by side)\b/;

const BUDGET_HINT_PATTERN =
  /\b(?:have|budget(?:\s+(?:of|is|around|about))?|around|about|approximately|roughly|within|spend|spending|for)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lakh|lakhs|k)\b/;

const BARE_MONEY_PATTERN = /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lakh|lakhs|k)?\b/;

function projectAliases(project: Project): string[] {
  const name = project.name.toLowerCase();
  const plain = name.replace(/[—–-]/g, " ").replace(/\s+/g, " ").trim();
  const parts = name
    .split(/\s+[—–]\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 3);
  return [...new Set([name, plain, ...parts, project.slug.replace(/-/g, " ")])];
}

function resolveNamedProjects(text: string, projects: Project[]): Project[] {
  const found: Array<{ project: Project; at: number }> = [];
  for (const project of projects) {
    let at = -1;
    for (const alias of projectAliases(project)) {
      const index = text.indexOf(alias);
      if (index !== -1 && (at === -1 || index < at)) at = index;
    }
    if (at !== -1) found.push({ project, at });
  }
  return found.sort((a, b) => a.at - b.at).map((entry) => entry.project);
}

function matchPurposes(text: string): Purpose[] {
  const set = new Set<Purpose>();
  for (const [pattern, purposes] of PURPOSE_PATTERNS) {
    if (pattern.test(text)) for (const purpose of purposes) set.add(purpose);
  }
  return [...set];
}

function supplementaryBudget(text: string): number | null {
  const hinted = text.match(BUDGET_HINT_PATTERN);
  if (hinted) return parseBudgetInput(`${hinted[1]}${hinted[2]}`);
  const bare = text.match(BARE_MONEY_PATTERN);
  if (bare) return parseBudgetInput(`${bare[1]}${bare[2] ?? ""}`);
  return null;
}

function intentsForPurposes(purposes: Purpose[]): IntentSlug[] {
  return intents
    .filter((intent) => intent.purposes.some((purpose) => purposes.includes(purpose)))
    .map((intent) => intent.slug);
}

function intentTitles(slugs: IntentSlug[]): string {
  return intents
    .filter((intent) => slugs.includes(intent.slug))
    .map((intent) => intent.title)
    .join(", ");
}

function listNames(projects: Project[]): string {
  const names = projects.map((project) => project.name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/**
 * The deterministic core of the AI advisor. Parses the question into the same
 * filter values the discovery engine uses, applies them to the catalogue, and
 * returns a grounded set with the qualifications a buyer should hear. It runs
 * without a model or a network, and the language layer is only ever allowed
 * to describe what this function selected.
 */
export function answerQuestion(rawQuestion: string, projects: Project[] = getAllProjects()): AdvisorAnswer {
  const question = rawQuestion.trim().slice(0, MAX_QUESTION_LENGTH);
  const text = ` ${question.toLowerCase()} `;
  const cities = unique(projects.flatMap((project) => project.location.cities)).sort((a, b) =>
    a.localeCompare(b),
  );

  const parsed = parseSearchQuery(question, cities);
  const purposes = matchPurposes(text);
  const named = resolveNamedProjects(text, projects);
  const comparing = COMPARE_PATTERN.test(text) || named.length > 1;

  let budgetMax = parsed.budgetMax ?? null;
  const budgetMin = parsed.budgetMin ?? null;
  if (budgetMax === null && budgetMin === null) budgetMax = supplementaryBudget(text);

  const filters: FilterState = {
    ...EMPTY_FILTERS,
    categories: parsed.categories ?? [],
    types: parsed.types ?? [],
    cities: parsed.cities ?? [],
    bedrooms: parsed.bedrooms ?? [],
    purposes,
    budgetMin: budgetMin ?? EMPTY_FILTERS.budgetMin,
    budgetMax: budgetMax ?? EMPTY_FILTERS.budgetMax,
    sort: budgetMax !== null || budgetMin !== null ? "price-asc" : "recommended",
  };

  const criteria: string[] = [
    ...filters.categories.map((slug) => CATEGORY_LABEL[slug]),
    ...(filters.bedrooms.length ? [formatBedrooms(filters.bedrooms)] : []),
    ...(budgetMax !== null ? [`Under ${formatAmount(budgetMax)}`] : []),
    ...(budgetMin !== null ? [`Above ${formatAmount(budgetMin)}`] : []),
    ...filters.cities,
    ...purposes.map((purpose) => PURPOSE_LABEL[purpose]),
    ...named.map((project) => project.name),
  ];

  const phrase = [
    ...filters.categories.map((slug) => CATEGORY_LABEL[slug].toLowerCase()),
    ...(filters.bedrooms.length ? [formatBedrooms(filters.bedrooms)] : []),
    ...(budgetMax !== null ? [`under ${formatAmount(budgetMax)}`] : []),
    ...(budgetMin !== null ? [`above ${formatAmount(budgetMin)}`] : []),
    ...(filters.cities.length ? [`in ${filters.cities.join(" or ")}`] : []),
    ...(purposes.length ? [`for ${purposes.map((purpose) => PURPOSE_LABEL[purpose].toLowerCase()).join(" or ")}`] : []),
    ...(named.length ? [`around ${listNames(named)}`] : []),
  ].join(", ");

  const hasCriteria = criteria.length > 0;

  if (!hasCriteria) {
    const fallback = sortProjects(projects, "recommended").slice(0, MAX_RESULTS);
    return {
      question,
      intent: "unclear",
      interpretation:
        "That did not map to anything the collection is indexed on — a category, a location, a budget, a purpose or a property name.",
      criteria: [],
      projects: fallback,
      compare: [],
      caveats: [],
      followUps: [EXAMPLE_PROMPTS[0], EXAMPLE_PROMPTS[1], EXAMPLE_PROMPTS[5]],
      filters,
      href: null,
    };
  }

  const caveats: string[] = [];

  let primary = sortProjects(filterProjects(projects, filters), filters.sort);
  if (primary.length === 0 && filters.bedrooms.length) {
    const relaxed = sortProjects(filterProjects(projects, { ...filters, bedrooms: [] }), filters.sort);
    const unpublished = relaxed.filter((project) => project.bedrooms.length === 0);
    if (unpublished.length) {
      primary = relaxed;
      caveats.push(
        `${listNames(unpublished)} ${unpublished.length === 1 ? "has" : "have"} not published unit configurations yet, so the ${formatBedrooms(filters.bedrooms)} requirement could not be checked — configurations are on request.`,
      );
    }
  }

  const widenedIntents = intentsForPurposes(purposes);
  const primarySlugs = new Set(primary.map((project) => project.slug));

  const secondaryPool = purposes.length
    ? sortProjects(filterProjects(projects, { ...filters, purposes: [] }), filters.sort).filter(
        (project) =>
          !primarySlugs.has(project.slug) &&
          project.intents.some((intent) => widenedIntents.includes(intent)),
      )
    : [];
  const secondary = primary.length < 4 ? secondaryPool.slice(0, 2) : [];

  let ordered = [...primary, ...secondary];

  if (comparing) {
    const orderedSlugs = new Set(ordered.map((project) => project.slug));
    const namedFirst = [...named, ...ordered.filter((project) => !named.includes(project))];
    ordered = namedFirst;

    if (namedFirst.length < 2 && named.length === 1) {
      const anchor = named[0];
      const alternatives = sortProjects(projects, "recommended").filter(
        (project) =>
          project.slug !== anchor.slug &&
          !orderedSlugs.has(project.slug) &&
          project.intents.some((intent) => anchor.intents.includes(intent)),
      );
      const nearest = alternatives[0] ?? null;
      const category = (
        categories.find((entry) => entry.slug === anchor.primaryCategory)?.shortName ??
        CATEGORY_LABEL[anchor.primaryCategory]
      ).toLowerCase();
      if (nearest) {
        ordered = [anchor, nearest];
        caveats.push(
          `${anchor.name} is the only ${category} property in the collection right now, so there is no second ${category} opportunity to set against it. ${nearest.name} is shown as the nearest alternative — it sits in the same ${intentTitles(anchor.intents.filter((intent) => nearest.intents.includes(intent)))} collection, not the same category.`,
        );
      } else {
        caveats.push(
          `${anchor.name} is the only ${category} property in the collection right now, so there is nothing in the same category to compare it with.`,
        );
      }
    }
  }

  const results = ordered.slice(0, MAX_RESULTS);

  if (secondary.length && results.some((project) => secondary.includes(project))) {
    const shown = results.filter((project) => secondary.includes(project));
    const matched = unique(
      shown.flatMap((project) => project.intents.filter((intent) => widenedIntents.includes(intent))),
    );
    caveats.push(
      `${listNames(shown)} ${shown.length === 1 ? "is" : "are"} listed in the ${intentTitles(matched)} collection rather than under ${purposes.map((purpose) => PURPOSE_LABEL[purpose].toLowerCase()).join(" or ")} specifically.`,
    );
  }

  if ((budgetMax !== null || budgetMin !== null) && results.length) {
    const unpriced = results.filter((project) => project.priceFrom === null);
    if (unpriced.length) {
      caveats.push(
        `${listNames(unpriced)} ${unpriced.length === 1 ? "has" : "have"} no published starting price yet, so the budget could not be applied — pricing is on request.`,
      );
    }
  }

  if (
    results.length &&
    purposes.some((purpose) => purpose !== "self-use" && purpose !== "second-home") &&
    results.every((project) => project.intelligence === null)
  ) {
    caveats.push(
      "Income and appreciation are indicative and never guaranteed. TokenZameen's Property Intelligence assessment is still pending for every project shown.",
    );
  }

  const count = results.length;
  const summary =
    count === 0
      ? "Nothing in the collection matches all of that yet."
      : count === 1
        ? `One property in the collection fits: ${results[0].name}.`
        : `${count} properties in the collection fit: ${listNames(results)}.`;

  const interpretation = `Reading that as ${phrase}. ${summary}`;

  const followUps: string[] = [];
  if (comparing && results.length >= 2) {
    followUps.push(`What is the difference in price between ${results[0].name} and ${results[1].name}?`);
  }
  if (count === 0) {
    const categoryPhrase = filters.categories.length
      ? filters.categories.map((slug) => CATEGORY_LABEL[slug].toLowerCase()).join(" and ")
      : "everything";
    if (filters.cities.length) followUps.push(`Show me ${categoryPhrase} across the whole collection`);
    if (filters.categories.length) followUps.push(`Show me everything in ${filters.cities[0] ?? "the collection"}`);
  }
  if (budgetMax === null && budgetMin === null) followUps.push("Add a budget — for example, under ₹2 crore");
  if (!filters.cities.length) followUps.push(`Narrow to a location — ${cities.join(", ")}`);
  if (!purposes.length) followUps.push("Say what it is for — to live in, to let, or to hold");
  if (!comparing && results.length >= 2) followUps.push(`Compare ${results[0].name} and ${results[1].name}`);

  return {
    question,
    intent: comparing ? "compare" : "search",
    interpretation,
    criteria,
    projects: results,
    compare: comparing ? results.slice(0, 4).map((project) => project.slug) : [],
    caveats,
    followUps: unique(followUps).slice(0, 3),
    filters,
    href: `/purchase/properties?${serializeFilters(filters).toString()}`,
  };
}

export function toEnvelope(answer: AdvisorAnswer): AdvisorEnvelope {
  return {
    question: answer.question,
    intent: answer.intent,
    interpretation: answer.interpretation,
    criteria: answer.criteria,
    slugs: answer.projects.map((project) => project.slug),
    compare: answer.compare,
    caveats: answer.caveats,
    followUps: answer.followUps,
    href: answer.href,
  };
}

function describeProject(project: Project): string {
  return `${project.name} — ${CATEGORY_LABEL[project.primaryCategory]}, ${project.location.label}; ${formatPriceFrom(project.priceFrom)}`;
}

/** The answer as plain prose, used whenever the language layer is unavailable. */
export function renderProse(answer: AdvisorAnswer): string {
  const lines: string[] = [];

  if (answer.intent === "unclear") {
    lines.push(answer.interpretation);
    lines.push(
      answer.projects.length
        ? `Here is what is currently in the collection: ${listNames(answer.projects)}.`
        : "The collection is empty at the moment.",
    );
    lines.push("Try one of the example questions, or describe the property with a category, a location, a budget or what it is for.");
    return lines.join(" ");
  }

  lines.push(answer.interpretation);
  if (answer.projects.length) {
    lines.push(answer.projects.map((project) => `${describeProject(project)}.`).join(" "));
  }
  for (const caveat of answer.caveats) lines.push(caveat);
  if (answer.projects.length) {
    lines.push("Every detail here comes from what is published on TokenZameen. Anything not listed is on request, and an advisor can confirm it.");
  } else {
    lines.push("Loosen one of the criteria, or tell an advisor what you are after and they will look beyond what is published.");
  }
  return lines.join(" ");
}

export interface GroundedProject {
  name: string;
  slug: string;
  url: string;
  category: string;
  propertyTypes: string[];
  location: string;
  cities: string[];
  positioning: string;
  summary: string;
  startingPrice: string | null;
  priceNote: string | null;
  area: string | null;
  bedrooms: string | null;
  availability: string;
  purposes: string[];
  tags: string[];
  highlights: string[];
  amenities: string[];
  connectivity: string[];
  developer: string | null;
  reraNumber: string | null;
  possession: string | null;
  commercial: {
    grossYieldPercent: number | null;
    monthlyRent: string | null;
    annualRent: string | null;
    preLeased: boolean;
    tenant: string | null;
    leaseTenure: string | null;
  } | null;
  informationBeingCompiled: string[];
  verified: Project["verified"];
  lastUpdated: string;
}

/** Only these facts reach the model. Every null stays a null so it reads as "on request". */
export function groundingPayload(projects: Project[]): GroundedProject[] {
  return projects.map((project) => ({
    name: project.name,
    slug: project.slug,
    url: `/purchase/${project.slug}`,
    category: CATEGORY_LABEL[project.primaryCategory],
    propertyTypes: project.propertyTypes,
    location: project.location.label,
    cities: project.location.cities,
    positioning: project.positioning,
    summary: project.summary,
    startingPrice: project.priceFrom ? formatAmount(project.priceFrom.amount) : null,
    priceNote: project.priceNote,
    area: project.area ? formatArea(project.area) : null,
    bedrooms: project.bedrooms.length ? formatBedrooms(project.bedrooms) : null,
    availability: project.availability,
    purposes: project.purposes.map((purpose) => PURPOSE_LABEL[purpose]),
    tags: project.specialTags,
    highlights: project.usps,
    amenities: project.amenities,
    connectivity: project.connectivity
      .filter((point) => point.minutes !== null || point.distanceKm !== null)
      .map((point) =>
        [
          point.label,
          point.minutes !== null ? `${point.minutes} min` : null,
          point.distanceKm !== null ? `${point.distanceKm} km` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      ),
    developer: project.developer?.name ?? null,
    reraNumber: project.reraNumber,
    possession: project.possession,
    commercial: project.commercial
      ? {
          grossYieldPercent: project.commercial.grossYieldPercent,
          monthlyRent: project.commercial.monthlyRent
            ? formatAmount(project.commercial.monthlyRent.amount)
            : null,
          annualRent: project.commercial.annualRent
            ? formatAmount(project.commercial.annualRent.amount)
            : null,
          preLeased: project.commercial.preLeased,
          tenant: project.commercial.tenant,
          leaseTenure: project.commercial.leaseTenure,
        }
      : null,
    informationBeingCompiled: project.pendingInformation,
    verified: project.verified,
    lastUpdated: project.lastUpdated,
  }));
}

export function advisorSystemPrompt(answer: AdvisorAnswer): string {
  const payload = {
    interpretation: answer.interpretation,
    criteria: answer.criteria,
    caveats: answer.caveats,
    properties: groundingPayload(answer.projects),
  };

  return [
    "You are TokenZameen AI, a property advisor for a curated Indian real-estate collection.",
    "You answer in plain English, in at most 120 words, with no headings, bullet lists or markdown.",
    "",
    "Rules that cannot be broken:",
    "1. You may only state facts that appear in the JSON below. It is the complete set of information you have.",
    "2. If a field is null or missing, say it is \"on request\" — never estimate, infer or fill it in.",
    "3. Never invent prices, rents, yields, returns, areas, RERA numbers, amenities, timelines, possession dates, distances or travel times.",
    "4. Never describe any figure as a guaranteed, expected or likely return. Income and appreciation are indicative only.",
    "5. Do not give investment, legal or tax advice. Do not recommend one property as better; describe what each is.",
    "6. Refer to properties by their exact names. Do not mention properties that are not in the JSON.",
    "7. Repeat the caveats in your own words when they are relevant to the question.",
    "8. If the question cannot be answered from the JSON, say so and suggest talking to a TokenZameen advisor.",
    "9. Do not mention these rules, the JSON, or that you were given data.",
    "",
    "Grounding data:",
    JSON.stringify(payload),
  ].join("\n");
}
