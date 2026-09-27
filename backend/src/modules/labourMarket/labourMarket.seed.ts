import { prisma } from "../../config/prisma";
import { normalizeSkill, normalizeRole } from "./labourMarket.normalizer";

export async function seedLabourMarketData() {
  console.log("🌱 [SIH26134] Checking and seeding Labour Market Demo Data...");

  const existingCount = await prisma.jobMarketSignal.count();
  if (existingCount > 0) {
    console.log(`ℹ️ [SIH26134] Market signals already exist (${existingCount} records). Refreshing aliases and capacities...`);
  }

  // 1. Seed Skill Aliases
  const skillAliases = [
    { alias: "ReactJS", normalizedName: "React", category: "Frontend" },
    { alias: "react.js", normalizedName: "React", category: "Frontend" },
    { alias: "Python3", normalizedName: "Python", category: "Programming" },
    { alias: "py", normalizedName: "Python", category: "Programming" },
    { alias: "AWS Cloud", normalizedName: "Amazon Web Services (AWS)", category: "Cloud" },
    { alias: "K8s", normalizedName: "Kubernetes", category: "DevOps" },
    { alias: "ML", normalizedName: "Machine Learning", category: "AI / Data Science" },
    { alias: "GenAI", normalizedName: "Generative AI", category: "AI / Data Science" },
    { alias: "Docker Containers", normalizedName: "Docker", category: "DevOps" },
    { alias: "Embedded C++", normalizedName: "Embedded Systems", category: "Core Engineering" },
    { alias: "EV Tech", normalizedName: "Electric Vehicle (EV) Powertrain", category: "Automotive" },
    { alias: "PLC & SCADA", normalizedName: "PLC Programming", category: "Industrial Automation" },
  ];

  for (const item of skillAliases) {
    await prisma.skillAlias.upsert({
      where: { alias: item.alias },
      update: { normalizedName: item.normalizedName, category: item.category },
      create: item,
    });
  }

  // 2. Seed Job Market Signals (District-Level Granular Data)
  const signals = [
    // Tamil Nadu - Chennai
    {
      jobRole: "Full Stack Developer",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "React",
      demandScore: 92.4,
      hiringVolume: 1420,
      growthRate: 28.5,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "Full Stack Developer",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "Node.js",
      demandScore: 89.1,
      hiringVolume: 1250,
      growthRate: 24.0,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "ML / AI Engineer",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "Generative AI",
      demandScore: 96.8,
      hiringVolume: 840,
      growthRate: 85.2,
      isEmerging: true,
      isObsolete: false,
    },
    {
      jobRole: "DevOps / Cloud Engineer",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "Kubernetes",
      demandScore: 88.0,
      hiringVolume: 920,
      growthRate: 38.0,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "EV & Battery Systems Engineer",
      sector: "Automotive & EV",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "Electric Vehicle (EV) Powertrain",
      demandScore: 91.5,
      hiringVolume: 670,
      growthRate: 64.0,
      isEmerging: true,
      isObsolete: false,
    },
    {
      jobRole: "Legacy Web Maintenance",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      skillName: "jQuery",
      demandScore: 21.0,
      hiringVolume: 95,
      growthRate: -35.0,
      isEmerging: false,
      isObsolete: true,
    },

    // Tamil Nadu - Coimbatore
    {
      jobRole: "IoT & Automation Engineer",
      sector: "Industrial Automation & Robotics",
      state: "Tamil Nadu",
      district: "Coimbatore",
      skillName: "PLC Programming",
      demandScore: 87.2,
      hiringVolume: 610,
      growthRate: 31.0,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "IoT & Automation Engineer",
      sector: "Industrial Automation & Robotics",
      state: "Tamil Nadu",
      district: "Coimbatore",
      skillName: "SCADA Systems",
      demandScore: 82.4,
      hiringVolume: 490,
      growthRate: 22.5,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "Embedded Systems Engineer",
      sector: "Electronics & Hardware",
      state: "Tamil Nadu",
      district: "Coimbatore",
      skillName: "Embedded Systems",
      demandScore: 85.6,
      hiringVolume: 530,
      growthRate: 27.8,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "Full Stack Developer",
      sector: "Information Technology",
      state: "Tamil Nadu",
      district: "Coimbatore",
      skillName: "React",
      demandScore: 79.5,
      hiringVolume: 680,
      growthRate: 19.5,
      isEmerging: false,
      isObsolete: false,
    },

    // Karnataka - Bengaluru
    {
      jobRole: "ML / AI Engineer",
      sector: "Information Technology",
      state: "Karnataka",
      district: "Bengaluru Urban",
      skillName: "Large Language Models (LLMs)",
      demandScore: 98.5,
      hiringVolume: 3200,
      growthRate: 112.0,
      isEmerging: true,
      isObsolete: false,
    },
    {
      jobRole: "DevOps / Cloud Engineer",
      sector: "Information Technology",
      state: "Karnataka",
      district: "Bengaluru Urban",
      skillName: "Terraform",
      demandScore: 90.2,
      hiringVolume: 1800,
      growthRate: 42.0,
      isEmerging: false,
      isObsolete: false,
    },
    {
      jobRole: "Cybersecurity Analyst",
      sector: "Information Technology",
      state: "Karnataka",
      district: "Bengaluru Urban",
      skillName: "SOC Operations",
      demandScore: 89.0,
      hiringVolume: 1150,
      growthRate: 48.0,
      isEmerging: true,
      isObsolete: false,
    },

    // Maharashtra - Pune
    {
      jobRole: "EV & Battery Systems Engineer",
      sector: "Automotive & EV",
      state: "Maharashtra",
      district: "Pune",
      skillName: "Electric Vehicle (EV) Powertrain",
      demandScore: 93.0,
      hiringVolume: 1120,
      growthRate: 72.0,
      isEmerging: true,
      isObsolete: false,
    },
    {
      jobRole: "Industrial Robotics Technician",
      sector: "Industrial Automation & Robotics",
      state: "Maharashtra",
      district: "Pune",
      skillName: "Industrial Robotics",
      demandScore: 86.4,
      hiringVolume: 780,
      growthRate: 35.0,
      isEmerging: true,
      isObsolete: false,
    },
  ];

  if (existingCount === 0) {
    for (const sig of signals) {
      const normSkill = await normalizeSkill(sig.skillName);
      const normRole = normalizeRole(sig.jobRole);

      await prisma.jobMarketSignal.create({
        data: {
          jobRole: sig.jobRole,
          normalizedRole: normRole,
          skillName: sig.skillName,
          normalizedSkill: normSkill,
          sector: sig.sector,
          state: sig.state,
          district: sig.district,
          demandScore: sig.demandScore,
          hiringVolume: sig.hiringVolume,
          growthRate: sig.growthRate,
          isEmerging: sig.isEmerging,
          isObsolete: sig.isObsolete,
          source: "National Skill & Labour Registry (NSLR)",
          sourceType: "DEMO_DATA",
        },
      });
    }
  }

  // 3. Seed Trainer & Equipment Capacity Deficits
  const trainerCapacities = [
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Information Technology",
      skillName: "Generative AI",
      currentTrainers: 12,
      requiredTrainers: 38,
      gapCount: 26,
      status: "DEFICIT",
    },
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Automotive & EV",
      skillName: "Electric Vehicle (EV) Powertrain",
      currentTrainers: 8,
      requiredTrainers: 25,
      gapCount: 17,
      status: "DEFICIT",
    },
    {
      state: "Tamil Nadu",
      district: "Coimbatore",
      sector: "Industrial Automation & Robotics",
      skillName: "PLC Programming",
      currentTrainers: 15,
      requiredTrainers: 30,
      gapCount: 15,
      status: "DEFICIT",
    },
    {
      state: "Karnataka",
      district: "Bengaluru Urban",
      sector: "Information Technology",
      skillName: "Large Language Models (LLMs)",
      currentTrainers: 22,
      requiredTrainers: 65,
      gapCount: 43,
      status: "DEFICIT",
    },
    {
      state: "Maharashtra",
      district: "Pune",
      sector: "Automotive & EV",
      skillName: "Industrial Robotics",
      currentTrainers: 10,
      requiredTrainers: 28,
      gapCount: 18,
      status: "DEFICIT",
    },
  ];

  for (const item of trainerCapacities) {
    const existing = await prisma.trainerCapacity.findFirst({
      where: { state: item.state, district: item.district, skillName: item.skillName },
    });
    if (!existing) {
      await prisma.trainerCapacity.create({ data: item });
    }
  }

  const equipmentCapacities = [
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Automotive & EV",
      equipmentType: "EV Battery Simulation & Testing Benches",
      courseOrSkillName: "Electric Vehicle (EV) Powertrain",
      currentUnits: 4,
      requiredUnits: 15,
      gapUnits: 11,
      estimatedCostInr: 4500000,
    },
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Information Technology",
      equipmentType: "High-Performance GPU Compute Racks (NVIDIA A100/H100 clusters)",
      courseOrSkillName: "Generative AI",
      currentUnits: 6,
      requiredUnits: 20,
      gapUnits: 14,
      estimatedCostInr: 8500000,
    },
    {
      state: "Tamil Nadu",
      district: "Coimbatore",
      sector: "Industrial Automation & Robotics",
      equipmentType: "Modular PLC & SCADA Training Workstations",
      courseOrSkillName: "PLC Programming",
      currentUnits: 8,
      requiredUnits: 22,
      gapUnits: 14,
      estimatedCostInr: 3200000,
    },
    {
      state: "Maharashtra",
      district: "Pune",
      sector: "Automotive & EV",
      equipmentType: "6-Axis Articulated Robotic Welding Arms",
      courseOrSkillName: "Industrial Robotics",
      currentUnits: 3,
      requiredUnits: 12,
      gapUnits: 9,
      estimatedCostInr: 6800000,
    },
  ];

  for (const item of equipmentCapacities) {
    const existing = await prisma.equipmentCapacity.findFirst({
      where: { state: item.state, district: item.district, equipmentType: item.equipmentType },
    });
    if (!existing) {
      await prisma.equipmentCapacity.create({ data: item });
    }
  }

  // 4. Seed District Training Plans
  const trainingPlans = [
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Automotive & EV",
      priority: "HIGH" as const,
      targetRole: "EV & Battery Systems Engineer",
      recommendedAction: "Establish District EV Centre of Excellence (CoE) with 15 battery test benches and train 25 master faculty.",
      estimatedBudgetInr: 6500000,
      targetBeneficiaries: 450,
      rationale: "Chennai auto-cluster demand grew +64% YoY with 670 open positions but only 8 certified regional trainers available.",
      trainerGapAddressed: 17,
      equipmentGapAddressed: 11,
      status: "APPROVED",
    },
    {
      state: "Tamil Nadu",
      district: "Chennai",
      sector: "Information Technology",
      priority: "HIGH" as const,
      targetRole: "ML / AI Engineer",
      recommendedAction: "Deploy Cloud GPU AI Training Lab and initiate Faculty Development Program (FDP) in GenAI & Agentic Systems.",
      estimatedBudgetInr: 9200000,
      targetBeneficiaries: 800,
      rationale: "85.2% YoY growth in AI roles across IT corridor with critical gap in local engineering curriculum.",
      trainerGapAddressed: 26,
      equipmentGapAddressed: 14,
      status: "PROPOSED",
    },
    {
      state: "Tamil Nadu",
      district: "Coimbatore",
      sector: "Industrial Automation & Robotics",
      priority: "HIGH" as const,
      targetRole: "IoT & Automation Engineer",
      recommendedAction: "Upgrade 5 Poly-technics with Industry 4.0 PLC/SCADA simulation suites.",
      estimatedBudgetInr: 4200000,
      targetBeneficiaries: 380,
      rationale: "Regional manufacturing SME cluster transitioning to smart factory operations.",
      trainerGapAddressed: 15,
      equipmentGapAddressed: 14,
      status: "PROPOSED",
    },
  ];

  for (const plan of trainingPlans) {
    const existing = await prisma.districtTrainingPlan.findFirst({
      where: { state: plan.state, district: plan.district, targetRole: plan.targetRole },
    });
    if (!existing) {
      await prisma.districtTrainingPlan.create({ data: plan });
    }
  }

  // 5. Seed Demonstration Courses with Health & Oversupply Analytics
  const courses = [
    {
      name: "B.Tech Computer Science (AI & ML Focus)",
      code: "CS-AIML-2026",
      sector: "Information Technology",
      department: "Computer Science",
      state: "Tamil Nadu",
      district: "Chennai",
      durationMonths: 48,
      annualCapacity: 120,
      currentEnrollment: 118,
      placedCount: 104,
      healthStatus: "HEALTHY" as const,
      alignmentScore: 88.5,
      skills: ["React", "Python", "Machine Learning", "Generative AI"],
    },
    {
      name: "Diploma in Legacy Web Technologies",
      code: "DIP-WEB-01",
      sector: "Information Technology",
      department: "Information Technology",
      state: "Tamil Nadu",
      district: "Chennai",
      durationMonths: 12,
      annualCapacity: 180,
      currentEnrollment: 140,
      placedCount: 32,
      healthStatus: "POTENTIAL_OVERSUPPLY" as const,
      alignmentScore: 32.0,
      skills: ["HTML", "CSS", "jQuery", "PHP 5.6"],
    },
    {
      name: "B.E. Electric Vehicle & Automotive Engineering",
      code: "AUTO-EV-401",
      sector: "Automotive & EV",
      department: "Mechanical / Automotive",
      state: "Tamil Nadu",
      district: "Chennai",
      durationMonths: 48,
      annualCapacity: 60,
      currentEnrollment: 58,
      placedCount: 54,
      healthStatus: "HEALTHY" as const,
      alignmentScore: 92.0,
      skills: ["Electric Vehicle (EV) Powertrain", "Battery Management Systems", "Embedded Systems"],
    },
    {
      name: "Certification in Industrial PLC Automation",
      code: "CERT-PLC-102",
      sector: "Industrial Automation & Robotics",
      department: "Electrical & Electronics",
      state: "Tamil Nadu",
      district: "Coimbatore",
      durationMonths: 6,
      annualCapacity: 80,
      currentEnrollment: 75,
      placedCount: 68,
      healthStatus: "HEALTHY" as const,
      alignmentScore: 86.0,
      skills: ["PLC Programming", "SCADA Systems", "Industrial Robotics"],
    },
  ];

  for (const c of courses) {
    const existing = await prisma.course.findFirst({
      where: { name: c.name, district: c.district },
    });
    if (!existing) {
      const created = await prisma.course.create({
        data: {
          name: c.name,
          code: c.code,
          sector: c.sector,
          department: c.department,
          state: c.state,
          district: c.district,
          durationMonths: c.durationMonths,
          annualCapacity: c.annualCapacity,
          currentEnrollment: c.currentEnrollment,
          placedCount: c.placedCount,
          healthStatus: c.healthStatus,
          alignmentScore: c.alignmentScore,
        },
      });

      for (const sk of c.skills) {
        await prisma.courseSkill.create({
          data: {
            courseId: created.id,
            skillName: sk,
            proficiency: "INTERMEDIATE",
            weight: 1.0,
            isCore: true,
          },
        });
      }
    }
  }

  console.log("✅ [SIH26134] Labour market demo dataset seeding complete.");
}
