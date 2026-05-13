export const skillCatalog = {
  Programming: ["Java", "JavaScript", "TypeScript", "Python", "PHP", "C#", "Go"],
  Frontend: ["HTML", "CSS", "React", "Next.js", "Vue", "Angular", "Tailwind CSS"],
  Backend: ["Node.js", "Express", "Spring Boot", "Laravel", "Django", "REST API", "GraphQL"],
  Database: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase"],
  DevOps: ["Git", "Docker", "Linux", "AWS", "CI/CD", "Kubernetes"],
  Testing: ["Unit Testing", "Jest", "JUnit", "PHPUnit", "Cypress"],
  Design: ["Figma", "UI Design", "UX Research", "Responsive Design"],
  AI: ["Prompt Engineering", "AI API Integration", "Hugging Face", "OpenAI API", "LangChain"]
} as const;

export const allowedRoleCatalog = [
  "Java Developer",
  "Frontend Developer",
  "React Developer",
  "Backend Developer",
  "Node.js Developer",
  "Full Stack Developer",
  "Laravel Developer",
  "PHP Developer",
  "WordPress Developer",
  "Mobile App Developer",
  "QA Tester",
  "Data Analyst",
  "DevOps Junior Engineer",
  "UI/UX Developer",
  "AI Integration Developer"
] as const;

export type SkillCategory = keyof typeof skillCatalog;
export type SkillName = (typeof skillCatalog)[SkillCategory][number];
export type RoleTitle = (typeof allowedRoleCatalog)[number];

export const allSkills = Object.values(skillCatalog).flat() as SkillName[];

export const skillToCategory = allSkills.reduce<Record<string, SkillCategory>>((acc, skill) => {
  for (const [category, skills] of Object.entries(skillCatalog)) {
    if ((skills as readonly string[]).includes(skill)) {
      acc[skill] = category as SkillCategory;
      break;
    }
  }
  return acc;
}, {});

export type RoleProfile = {
  title: RoleTitle;
  coreSkills: string[];
  helpfulSkills: string[];
  projectTheme: string;
};

export const roleProfiles: RoleProfile[] = [
  {
    title: "Java Developer",
    coreSkills: ["Java", "Spring Boot", "REST API", "Git", "JUnit", "MySQL"],
    helpfulSkills: ["Docker", "PostgreSQL", "Unit Testing"],
    projectTheme: "Build a Spring Boot CRUD API with validation and tests."
  },
  {
    title: "Frontend Developer",
    coreSkills: ["HTML", "CSS", "JavaScript", "Responsive Design", "Git"],
    helpfulSkills: ["TypeScript", "React", "Tailwind CSS", "Figma"],
    projectTheme: "Build a responsive portfolio with reusable components."
  },
  {
    title: "React Developer",
    coreSkills: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git"],
    helpfulSkills: ["Next.js", "Jest", "REST API", "Tailwind CSS"],
    projectTheme: "Build a React dashboard consuming a public API."
  },
  {
    title: "Backend Developer",
    coreSkills: ["REST API", "Node.js", "Express", "Database", "Git", "Unit Testing"],
    helpfulSkills: ["PostgreSQL", "Docker", "GraphQL", "Linux"],
    projectTheme: "Build a secure REST API with database persistence."
  },
  {
    title: "Node.js Developer",
    coreSkills: ["JavaScript", "Node.js", "Express", "REST API", "Git", "MongoDB"],
    helpfulSkills: ["TypeScript", "PostgreSQL", "Jest", "Docker"],
    projectTheme: "Build a Node.js API with auth-like validation and tests."
  },
  {
    title: "Full Stack Developer",
    coreSkills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST API", "Database", "Git"],
    helpfulSkills: ["TypeScript", "Next.js", "PostgreSQL", "Testing"],
    projectTheme: "Build a full-stack task app with API routes and persistence."
  },
  {
    title: "Laravel Developer",
    coreSkills: ["PHP", "Laravel", "MySQL", "REST API", "Git", "PHPUnit"],
    helpfulSkills: ["Docker", "Tailwind CSS", "JavaScript"],
    projectTheme: "Build a Laravel CRUD app with policies and validation."
  },
  {
    title: "PHP Developer",
    coreSkills: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Git"],
    helpfulSkills: ["Laravel", "REST API", "PHPUnit"],
    projectTheme: "Build a PHP inventory app with forms and database queries."
  },
  {
    title: "WordPress Developer",
    coreSkills: ["PHP", "HTML", "CSS", "JavaScript", "MySQL", "Responsive Design"],
    helpfulSkills: ["Figma", "Git", "UI Design"],
    projectTheme: "Build a custom WordPress theme section and contact flow."
  },
  {
    title: "Mobile App Developer",
    coreSkills: ["JavaScript", "TypeScript", "React", "REST API", "Firebase", "Git"],
    helpfulSkills: ["UI Design", "Responsive Design", "Unit Testing"],
    projectTheme: "Build a mobile-style habit tracker backed by Firebase."
  },
  {
    title: "QA Tester",
    coreSkills: ["Unit Testing", "Cypress", "Jest", "Git", "REST API"],
    helpfulSkills: ["JavaScript", "JUnit", "PHPUnit", "CI/CD"],
    projectTheme: "Create a test plan and automated test suite for a web form."
  },
  {
    title: "Data Analyst",
    coreSkills: ["Python", "PostgreSQL", "MySQL", "Supabase", "Git"],
    helpfulSkills: ["AI API Integration", "Prompt Engineering"],
    projectTheme: "Analyze a small dataset and publish a clear insight report."
  },
  {
    title: "DevOps Junior Engineer",
    coreSkills: ["Git", "Linux", "Docker", "CI/CD", "AWS"],
    helpfulSkills: ["Kubernetes", "Node.js", "REST API"],
    projectTheme: "Containerize a simple app and deploy it through CI."
  },
  {
    title: "UI/UX Developer",
    coreSkills: ["Figma", "UI Design", "UX Research", "Responsive Design", "HTML", "CSS"],
    helpfulSkills: ["React", "Tailwind CSS", "JavaScript"],
    projectTheme: "Design and build a polished responsive product landing flow."
  },
  {
    title: "AI Integration Developer",
    coreSkills: ["JavaScript", "Python", "Prompt Engineering", "AI API Integration", "Hugging Face", "REST API"],
    helpfulSkills: ["OpenAI API", "LangChain", "Node.js", "TypeScript"],
    projectTheme: "Build an AI helper that calls an API and validates structured output."
  }
];

