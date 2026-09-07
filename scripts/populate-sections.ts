import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_SECTIONS = [
  {
    id: "hero",
    name: "HERO",
    visible: true,
    fields: {
      badge: "DECEMBER 8–10, 2026 • DUBAI, UAE",
      title: "50 TH INTERNATIONAL CONFERENCE",
      titleColor: "Global Innovation & Technology",
      description: "Bringing together 2,000+ visionaries, researchers, and industry leaders from 80+ countries to shape the future of global innovation and emerging technologies.",
      heroVenue: "Dubai World Trade Centre, Dubai",
      heroDates: "December 8–10, 2026",
      heroMode: "Hybrid Event",
      ctaText2: "Register Now",
      heroImage: ""
    }
  },
  {
    id: "countdown",
    name: "COUNTDOWN",
    visible: true,
    fields: {
      badge: "⏳ Conference Begins In",
      title: "Don't Miss This Global Event",
      targetDate: "2026-12-08T09:00:00"
    }
  },
  {
    id: "about",
    name: "ABOUT",
    visible: true,
    fields: {
      badge: "About the Conference",
      title: "Shaping the Future Together",
      paragraph1: "The International Conference on Global Innovation and Technology brings together leading academic scientists, researchers, and scholars to exchange and share their experiences and research results on all aspects of Technology and Innovation.",
      paragraph2: "It also provides a premier interdisciplinary platform for researchers, practitioners, and educators to present and discuss the most recent innovations, trends, and concerns as well as practical challenges encountered."
    }
  },
  {
    id: "sessions",
    name: "SESSIONS",
    visible: true,
    fields: {
      badge: "🎯 Conference Program",
      title: "Sessions, Tracks & Key Dates",
      description: "Explore the multifaceted agenda designed to cover breakthrough advancements across artificial intelligence, cloud architectures, cybersecurity, and future computing paradigms."
    }
  },
  {
    id: "speakers",
    name: "SPEAKERS",
    visible: true,
    fields: {
      badge: "Visionary Thought Leaders",
      title: "World-Class Keynotes & Panelists",
      description: "Hear from the foremost minds in academia and industry shaping tomorrow's technology landscape."
    }
  },
  {
    id: "venue",
    name: "VENUE",
    visible: true,
    fields: {
      badge: "EVENT LOCATION",
      title: "Hosted in the Heart of Dubai",
      description: "Dubai World Trade Centre, situated at the crossroads of the world, provides state-of-the-art facilities for hybrid participation, networking lounges, and interactive exhibition halls.",
      format: "Hybrid (Onsite & Online)",
      mainHall: "Sheikh Maktoum Hall",
      mapLink: "Dubai World Trade Centre, Dubai"
    }
  },
  {
    id: "contact",
    name: "CONTACT",
    visible: true,
    fields: {
      badge: "✉ Contact Secretariat",
      title: "Get in Touch",
      description: "Questions on registration, submission, or corporate sponsorship? Send us an inquiry below and our conference committee will assist you promptly."
    }
  }
];

async function main() {
  const conferences = await prisma.conference.findMany({ where: { deletedAt: null } });
  console.log(`Found ${conferences.length} conferences.`);

  for (const conf of conferences) {
    console.log(`Updating sections for conference: ${conf.name} (${conf.slug})`);

    const existingSetting = await prisma.systemSetting.findFirst({
      where: { conferenceId: conf.id, key: "page_content_home" }
    });

    let existingSections: any[] = [];
    if (existingSetting?.value && Array.isArray(existingSetting.value)) {
      existingSections = existingSetting.value as any[];
    }

    // Merge existing with defaults
    const mergedSections = DEFAULT_SECTIONS.map((def) => {
      const found = existingSections.find((s) => s.id === def.id);
      if (found) {
        return {
          ...def,
          ...found,
          visible: found.visible !== undefined ? found.visible : true,
          fields: {
            ...def.fields,
            ...(found.fields || {})
          }
        };
      }
      return def;
    });

    // Also include any extra custom sections
    for (const custom of existingSections) {
      if (!DEFAULT_SECTIONS.some((d) => d.id === custom.id)) {
        mergedSections.push(custom);
      }
    }

    await prisma.systemSetting.upsert({
      where: {
        conferenceId_key: {
          conferenceId: conf.id,
          key: "page_content_home"
        }
      },
      update: {
        value: mergedSections
      },
      create: {
        conferenceId: conf.id,
        key: "page_content_home",
        value: mergedSections
      }
    });

    console.log(`✅ Conference ${conf.slug} page_content_home successfully populated with ${mergedSections.length} sections!`);
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
