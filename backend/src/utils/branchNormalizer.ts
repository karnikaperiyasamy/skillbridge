const BRANCH_MAP: Record<string, string> = {
  // Computer Science & IT
  cse: "CSE",
  cs: "CSE",
  "computer science": "CSE",
  "computer science and engineering": "CSE",
  "computer science & engineering": "CSE",
  "b.e cse": "CSE",
  "b.tech cse": "CSE",
  "b.e. cse": "CSE",
  "b.tech. cse": "CSE",
  "btech cse": "CSE",
  "be cse": "CSE",
  "b.e computer science": "CSE",
  "b.tech computer science": "CSE",
  it: "IT",
  "information technology": "IT",
  "b.tech it": "IT",
  "b.tech. it": "IT",
  "btech it": "IT",
  "b.e it": "IT",

  // AI & Data Science
  aids: "AI&DS",
  "ai&ds": "AI&DS",
  "ai & ds": "AI&DS",
  "ai and ds": "AI&DS",
  "artificial intelligence and data science": "AI&DS",
  "artificial intelligence & data science": "AI&DS",
  aiml: "AI&ML",
  "ai&ml": "AI&ML",
  "ai & ml": "AI&ML",
  "ai and ml": "AI&ML",
  "artificial intelligence and machine learning": "AI&ML",
  "artificial intelligence & machine learning": "AI&ML",

  // Electronics & Electrical
  ece: "ECE",
  "electronics and communication": "ECE",
  "electronics & communication": "ECE",
  "electronics and communication engineering": "ECE",
  "b.e ece": "ECE",
  "b.tech ece": "ECE",
  eee: "EEE",
  "electrical and electronics": "EEE",
  "electrical & electronics": "EEE",
  "electrical and electronics engineering": "EEE",
  "b.e eee": "EEE",
  "b.tech eee": "EEE",

  // Mechanical, Civil, Others
  mech: "MECH",
  mechanical: "MECH",
  "mechanical engineering": "MECH",
  "b.e mech": "MECH",
  civil: "CIVIL",
  "civil engineering": "CIVIL",
  "b.e civil": "CIVIL",
  automobile: "AUTOMOBILE",
  "automobile engineering": "AUTOMOBILE",
  auto: "AUTOMOBILE",
  biotech: "BIOTECH",
  biotechnology: "BIOTECH",
};

/**
 * Normalizes branch or department string into a standardized uppercase canonical code.
 * (e.g. "cse", "CSE", "Computer Science and Engineering", "B.Tech CSE" -> "CSE")
 */
export function normalizeBranch(rawBranch?: string | null): string {
  if (!rawBranch || typeof rawBranch !== "string") return "";
  const cleaned = rawBranch
    .trim()
    .toLowerCase()
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ");

  if (BRANCH_MAP[cleaned]) {
    return BRANCH_MAP[cleaned];
  }

  // Check if branch contains keyword
  if (cleaned.includes("computer science") || cleaned === "cse" || cleaned.includes(" cse")) {
    return "CSE";
  }
  if (cleaned.includes("information technology") || cleaned === "it" || cleaned.includes(" it")) {
    return "IT";
  }
  if (cleaned.includes("electronics and communication") || cleaned === "ece") {
    return "ECE";
  }
  if (cleaned.includes("electrical and electronics") || cleaned === "eee") {
    return "EEE";
  }
  if (cleaned.includes("mechanical") || cleaned === "mech") {
    return "MECH";
  }
  if (cleaned.includes("civil")) {
    return "CIVIL";
  }
  if (cleaned.includes("artificial intelligence") || cleaned.includes("ai &") || cleaned.includes("ai/")) {
    return "AI&DS";
  }

  return rawBranch.trim().toUpperCase();
}

/**
 * Checks if student's branch satisfies eligibleBranches in a case-insensitive, alias-aware manner.
 */
export function isBranchEligible(studentBranch?: string | null, eligibleBranches?: string[]): boolean {
  if (!eligibleBranches || eligibleBranches.length === 0) return true;
  if (eligibleBranches.some((b) => ["all", "any", "all branches", "*"].includes(b.trim().toLowerCase()))) {
    return true;
  }
  if (!studentBranch) return true;

  const normalizedStudent = normalizeBranch(studentBranch);
  const normalizedEligibles = eligibleBranches.map((b) => normalizeBranch(b));

  return normalizedEligibles.includes(normalizedStudent) || eligibleBranches.map((b) => b.trim().toLowerCase()).includes(studentBranch.trim().toLowerCase());
}
