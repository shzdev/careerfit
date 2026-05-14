export const skillCatalog = {
  Programming: ["JavaScript", "TypeScript", "Java", "Python", "PHP", "C#", "Go", "Kotlin", "Swift", "Dart", "SQL"],
  Frontend: ["HTML", "CSS", "React", "Next.js", "Vue", "Nuxt", "Angular", "Tailwind CSS", "Bootstrap", "jQuery"],
  Backend: ["Node.js", "Express", "NestJS", "Spring Boot", "Laravel", "Django", "FastAPI", "ASP.NET Core", "REST API", "GraphQL"],
  Database: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "Redis", "Oracle"],
  CMSAndWebBuilders: ["WordPress", "Elementor", "WooCommerce", "Shopify", "Wix", "Webflow", "Framer"],
  DesignTools: ["Figma", "Adobe XD", "Adobe Photoshop", "Adobe Illustrator", "Canva"],
  Mobile: ["Flutter", "React Native", "Android Studio", "Xcode", "Kotlin", "Swift", "Firebase"],
  Testing: ["Postman", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "PHPUnit", "Cucumber", "SoapUI"],
  DataAndBI: ["Python", "SQL", "Pandas", "NumPy", "Power BI", "Tableau", "Looker Studio", "Excel", "Google Sheets"],
  AIAndML: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "LangChain", "Hugging Face", "OpenAI API", "Vector Database", "RAG", "LLM API Integration"],
  DevOpsAndCloud: ["Git", "GitHub", "Linux", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Nginx", "Apache", "Vercel", "Netlify"]
} as const;

export const allowedRoleCatalog = [
  "Web Developer",
  "Web Designer",
  "UI/UX Designer",
  "Frontend Developer",
  "React Developer",
  "Next.js Developer",
  "Backend Developer",
  "Node.js Developer",
  "Java Developer",
  "Laravel Developer",
  "Full Stack Developer",
  "WordPress Developer",
  "Mobile App Developer",
  "Flutter Developer",
  "Android Developer",
  "iOS Developer",
  "QA Engineer",
  "Automation Tester",
  "Data Analyst",
  "BI Developer",
  "Data Engineer",
  "Data Scientist",
  "AI/ML Engineer",
  "AI Integration Developer",
  "DevOps Engineer",
  "Cloud Engineer"
] as const;

export type SkillCategory = keyof typeof skillCatalog;
export type SkillName = (typeof skillCatalog)[SkillCategory][number];
export type RoleTitle = (typeof allowedRoleCatalog)[number];

export const allSkills = [...new Set(Object.values(skillCatalog).flat())] as SkillName[];

export const skillToCategory = Object.entries(skillCatalog).reduce<Record<string, SkillCategory>>((acc, [category, skills]) => {
  for (const skill of skills) {
    acc[skill] ??= category as SkillCategory;
  }

  return acc;
}, {});

export type RoleProfile = {
  title: RoleTitle;
  coreSkills: string[];
  helpfulSkills: string[];
  projectTheme: string;
  requiredSkillGroups?: string[][];
};

export const roleProfiles: RoleProfile[] = [
  {
    title: "Web Developer",
    coreSkills: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "REST API"],
    helpfulSkills: ["WordPress", "Laravel", "Bootstrap", "jQuery", "Git", "Postman"],
    projectTheme: "Build a responsive business website with a contact form and database-backed admin flow."
  },
  {
    title: "Web Designer",
    coreSkills: ["Figma", "Adobe Photoshop", "Canva", "HTML", "CSS"],
    helpfulSkills: ["WordPress", "Wix", "Webflow", "Framer", "Shopify", "Adobe Illustrator"],
    projectTheme: "Design and publish a polished landing page for a local service business."
  },
  {
    title: "UI/UX Designer",
    coreSkills: ["Figma", "Adobe XD", "Adobe Photoshop", "Adobe Illustrator", "Canva"],
    helpfulSkills: ["HTML", "CSS", "Webflow", "Framer"],
    projectTheme: "Create a clickable app prototype with user flows, components, and handoff notes."
  },
  {
    title: "Frontend Developer",
    coreSkills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS"],
    helpfulSkills: ["Next.js", "Vue", "Angular", "Bootstrap", "Git", "Vercel"],
    projectTheme: "Build a responsive frontend dashboard with reusable components and API data."
  },
  {
    title: "React Developer",
    coreSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "REST API"],
    helpfulSkills: ["Next.js", "Tailwind CSS", "Jest", "Git", "Vercel"],
    projectTheme: "Build a React dashboard that consumes an API and handles loading, error, and empty states.",
    requiredSkillGroups: [["React"]]
  },
  {
    title: "Next.js Developer",
    coreSkills: ["Next.js", "React", "TypeScript", "JavaScript", "REST API", "Tailwind CSS"],
    helpfulSkills: ["Vercel", "PostgreSQL", "Supabase", "Git", "Playwright"],
    projectTheme: "Build a Next.js product page with API routes, validation, and deployment notes.",
    requiredSkillGroups: [["Next.js"], ["React"]]
  },
  {
    title: "Backend Developer",
    coreSkills: ["REST API", "SQL", "Node.js", "Express", "PostgreSQL", "Postman"],
    helpfulSkills: ["NestJS", "Spring Boot", "Laravel", "Django", "FastAPI", "Docker"],
    projectTheme: "Build a secure REST API with validation, database persistence, and API documentation."
  },
  {
    title: "Node.js Developer",
    coreSkills: ["Node.js", "JavaScript", "TypeScript", "Express", "REST API", "MongoDB"],
    helpfulSkills: ["NestJS", "PostgreSQL", "Jest", "Docker", "Git"],
    projectTheme: "Build a Node.js API with database models, request validation, and automated tests.",
    requiredSkillGroups: [["Node.js"]]
  },
  {
    title: "Java Developer",
    coreSkills: ["Java", "Spring Boot", "REST API", "MySQL", "JUnit", "Git"],
    helpfulSkills: ["PostgreSQL", "Docker", "Postman", "Linux"],
    projectTheme: "Build a Spring Boot CRUD API with validation, tests, and database persistence.",
    requiredSkillGroups: [["Java"]]
  },
  {
    title: "Laravel Developer",
    coreSkills: ["Laravel", "PHP", "MySQL", "REST API", "PHPUnit", "Git"],
    helpfulSkills: ["Tailwind CSS", "JavaScript", "Docker", "Postman"],
    projectTheme: "Build a Laravel CRUD app with authentication-style validation and policy-aware resources.",
    requiredSkillGroups: [["Laravel"]]
  },
  {
    title: "Full Stack Developer",
    coreSkills: ["HTML", "CSS", "JavaScript", "REST API", "Node.js", "PostgreSQL", "Git"],
    helpfulSkills: ["React", "Next.js", "Laravel", "MySQL", "MongoDB", "Docker", "Vercel"],
    projectTheme: "Build a full-stack task app with a frontend, API, database persistence, and deployment notes.",
    requiredSkillGroups: [["Frontend"], ["Backend"], ["Database"]]
  },
  {
    title: "WordPress Developer",
    coreSkills: ["WordPress", "PHP", "MySQL", "HTML", "CSS", "JavaScript"],
    helpfulSkills: ["Elementor", "WooCommerce", "Figma", "Git", "Apache"],
    projectTheme: "Build a custom WordPress business site with theme customization and a working contact flow.",
    requiredSkillGroups: [["WordPress"]]
  },
  {
    title: "Mobile App Developer",
    coreSkills: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "REST API"],
    helpfulSkills: ["Android Studio", "Xcode", "Dart", "Git", "Postman"],
    projectTheme: "Build a mobile habit tracker with Firebase persistence and a small API integration."
  },
  {
    title: "Flutter Developer",
    coreSkills: ["Flutter", "Dart", "Firebase", "REST API", "Android Studio"],
    helpfulSkills: ["Xcode", "Git", "Postman"],
    projectTheme: "Build a Flutter app with Firebase login-style state, CRUD screens, and API data.",
    requiredSkillGroups: [["Flutter"], ["Dart"]]
  },
  {
    title: "Android Developer",
    coreSkills: ["Kotlin", "Android Studio", "Firebase", "REST API", "Java"],
    helpfulSkills: ["Git", "Postman"],
    projectTheme: "Build an Android app with local state, Firebase storage, and API-backed screens.",
    requiredSkillGroups: [["Android Studio", "Kotlin"]]
  },
  {
    title: "iOS Developer",
    coreSkills: ["Swift", "Xcode", "Firebase", "REST API"],
    helpfulSkills: ["Git", "Postman"],
    projectTheme: "Build an iOS app with Swift screens, Firebase persistence, and API data.",
    requiredSkillGroups: [["Xcode", "Swift"]]
  },
  {
    title: "QA Engineer",
    coreSkills: ["Postman", "Selenium", "Cypress", "Playwright", "Jest"],
    helpfulSkills: ["JUnit", "PHPUnit", "SoapUI", "Git", "REST API"],
    projectTheme: "Create a manual test plan and automated regression checks for a web form."
  },
  {
    title: "Automation Tester",
    coreSkills: ["Selenium", "Cypress", "Playwright", "Cucumber", "GitHub"],
    helpfulSkills: ["Jest", "CI/CD", "Postman", "JavaScript"],
    projectTheme: "Build an automated browser test suite with CI-ready test commands.",
    requiredSkillGroups: [["Selenium", "Cypress", "Playwright"]]
  },
  {
    title: "Data Analyst",
    coreSkills: ["SQL", "Excel", "Power BI", "Tableau", "Python", "Pandas"],
    helpfulSkills: ["Google Sheets", "Looker Studio", "NumPy", "MySQL", "PostgreSQL"],
    projectTheme: "Analyze a sales dataset and publish a dashboard with clear business insights."
  },
  {
    title: "BI Developer",
    coreSkills: ["Power BI", "Tableau", "SQL", "Excel", "Looker Studio"],
    helpfulSkills: ["PostgreSQL", "MySQL", "Python", "Google Sheets"],
    projectTheme: "Build a BI dashboard with calculated metrics, filters, and source-data documentation.",
    requiredSkillGroups: [["Power BI", "Tableau"]]
  },
  {
    title: "Data Engineer",
    coreSkills: ["Python", "SQL", "PostgreSQL", "MySQL", "Docker", "Git"],
    helpfulSkills: ["Redis", "AWS", "Linux", "Pandas"],
    projectTheme: "Build a small ETL pipeline that cleans data and loads it into a relational database."
  },
  {
    title: "Data Scientist",
    coreSkills: ["Python", "Pandas", "NumPy", "scikit-learn", "SQL"],
    helpfulSkills: ["TensorFlow", "PyTorch", "Power BI", "Tableau"],
    projectTheme: "Train and explain a beginner-friendly prediction model from a clean dataset."
  },
  {
    title: "AI/ML Engineer",
    coreSkills: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "Hugging Face"],
    helpfulSkills: ["NumPy", "Pandas", "Docker", "Git"],
    projectTheme: "Build a simple ML inference service with model loading, validation, and documented results.",
    requiredSkillGroups: [["Python"], ["TensorFlow", "PyTorch", "scikit-learn"]]
  },
  {
    title: "AI Integration Developer",
    coreSkills: ["Hugging Face", "OpenAI API", "LangChain", "RAG", "Vector Database", "LLM API Integration"],
    helpfulSkills: ["Python", "JavaScript", "TypeScript", "Node.js", "REST API"],
    projectTheme: "Build an AI helper that calls an LLM API, validates structured output, and shows safe fallback handling.",
    requiredSkillGroups: [["Hugging Face", "OpenAI API", "LangChain", "RAG", "Vector Database", "LLM API Integration"]]
  },
  {
    title: "DevOps Engineer",
    coreSkills: ["Git", "GitHub", "Linux", "Docker", "CI/CD", "Kubernetes"],
    helpfulSkills: ["Terraform", "Nginx", "Apache", "AWS", "Azure", "GCP"],
    projectTheme: "Containerize a web app and document a CI/CD deployment flow with environment variables."
  },
  {
    title: "Cloud Engineer",
    coreSkills: ["AWS", "Azure", "GCP", "Linux", "Docker", "Terraform"],
    helpfulSkills: ["Kubernetes", "CI/CD", "Nginx", "GitHub"],
    projectTheme: "Deploy a small app to a cloud platform with environment configuration and rollback notes.",
    requiredSkillGroups: [["AWS", "Azure", "GCP"]]
  }
];
