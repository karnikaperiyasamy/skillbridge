import { prisma } from "../../config/prisma";

const DEFAULT_ALIASES: Record<string, string> = {
  // Frontend
  reactjs: "React",
  "react.js": "React",
  react: "React",
  "next.js": "Next.js",
  nextjs: "Next.js",
  vuejs: "Vue.js",
  "vue.js": "Vue.js",
  vue: "Vue.js",
  "angular.js": "Angular",
  angularjs: "Angular",
  angular: "Angular",
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  "tailwind css": "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  tailwind: "Tailwind CSS",

  // Backend
  nodejs: "Node.js",
  "node.js": "Node.js",
  node: "Node.js",
  expressjs: "Express.js",
  "express.js": "Express.js",
  express: "Express.js",
  python: "Python",
  python3: "Python",
  py: "Python",
  django: "Django",
  fastapi: "FastAPI",
  "fast api": "FastAPI",
  java: "Java",
  "spring boot": "Spring Boot",
  springboot: "Spring Boot",
  golang: "Go",
  go: "Go",
  rust: "Rust",

  // Cloud / DevOps
  aws: "Amazon Web Services (AWS)",
  "amazon web services": "Amazon Web Services (AWS)",
  azure: "Microsoft Azure",
  "microsoft azure": "Microsoft Azure",
  gcp: "Google Cloud Platform (GCP)",
  "google cloud": "Google Cloud Platform (GCP)",
  k8s: "Kubernetes",
  kubernetes: "Kubernetes",
  docker: "Docker",
  cicd: "CI/CD Pipelines",
  "ci/cd": "CI/CD Pipelines",
  terraform: "Terraform",

  // AI / ML / Data
  ml: "Machine Learning",
  "machine learning": "Machine Learning",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  dl: "Deep Learning",
  "deep learning": "Deep Learning",
  nlp: "Natural Language Processing (NLP)",
  "natural language processing": "Natural Language Processing (NLP)",
  llm: "Large Language Models (LLMs)",
  llms: "Large Language Models (LLMs)",
  "generative ai": "Generative AI",
  genai: "Generative AI",
  pytorch: "PyTorch",
  tensorflow: "TensorFlow",
  pandas: "Pandas",
  numpy: "NumPy",

  // Database
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  mysql: "MySQL",
  redis: "Redis",

  // Core Electronics / IoT / Robotics
  iot: "Internet of Things (IoT)",
  "internet of things": "Internet of Things (IoT)",
  embedded: "Embedded Systems",
  "embedded c": "Embedded C",
  plc: "PLC Programming",
  scada: "SCADA Systems",
  vlsi: "VLSI Design",
  robotics: "Industrial Robotics",
  ev: "Electric Vehicle (EV) Powertrain",
  "electric vehicles": "Electric Vehicle (EV) Powertrain",

  // Cybersecurity
  cybersecurity: "Cybersecurity",
  "cyber security": "Cybersecurity",
  infosec: "Information Security",
  pen_testing: "Penetration Testing",
  pentesting: "Penetration Testing",
  soc: "SOC Operations",
};

/**
 * Normalizes any free-form raw skill input string into a standardized, canonical skill name.
 * Uses persistent database aliases with built-in instant fallback.
 */
export async function normalizeSkill(rawSkill: string): Promise<string> {
  if (!rawSkill || typeof rawSkill !== "string") return "";
  const cleaned = rawSkill.trim();
  const lower = cleaned.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");

  // 1. Direct memory dictionary lookup
  if (DEFAULT_ALIASES[lower]) {
    return DEFAULT_ALIASES[lower];
  }

  // 2. Database alias lookup
  try {
    const aliasRecord = await prisma.skillAlias.findFirst({
      where: {
        alias: { equals: cleaned, mode: "insensitive" },
      },
    });
    if (aliasRecord) {
      return aliasRecord.normalizedName;
    }
  } catch (err) {
    // If DB check fails, fallback to clean capitalization
  }

  // 3. Title-case fallback
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeRole(rawRole: string): string {
  if (!rawRole || typeof rawRole !== "string") return "";
  const cleaned = rawRole.trim();
  const lower = cleaned.toLowerCase();

  const ROLE_MAP: Record<string, string> = {
    "frontend developer": "Frontend Developer",
    "front end engineer": "Frontend Developer",
    "backend developer": "Backend Developer",
    "back end engineer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "fullstack engineer": "Full Stack Developer",
    "data analyst": "Data Analyst",
    "data scientist": "Data Scientist",
    "machine learning engineer": "ML / AI Engineer",
    "ai engineer": "ML / AI Engineer",
    "devops engineer": "DevOps / Cloud Engineer",
    "cloud engineer": "DevOps / Cloud Engineer",
    "embedded engineer": "Embedded Systems Engineer",
    "iot engineer": "IoT & Automation Engineer",
    "ev engineer": "EV & Battery Systems Engineer",
    "cybersecurity analyst": "Cybersecurity Analyst",
    "quality assurance": "QA / Test Automation Engineer",
    "qa engineer": "QA / Test Automation Engineer",
  };

  return ROLE_MAP[lower] || cleaned;
}
