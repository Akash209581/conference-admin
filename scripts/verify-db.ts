import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log("\n=======================================================");
  console.log(" 🔍 POSTGRESQL DATABASE VERIFICATION & DATA INSPECTOR");
  console.log("=======================================================\n");

  // 1. Conferences
  const conferences = await prisma.conference.findMany({
    where: { deletedAt: null },
    include: {
      venue: true,
      settings: true,
      speakers: { where: { deletedAt: null } }
    }
  });

  console.log(`📦 TOTAL CONFERENCES FOUND: ${conferences.length}\n`);

  for (const conf of conferences) {
    console.log(`-------------------------------------------------------`);
    console.log(`🏆 Conference: "${conf.name}" (Slug: "${conf.slug}", ID: "${conf.id}")`);
    console.log(`   - Full Name: ${conf.fullName || "N/A"}`);
    console.log(`   - Dates: ${conf.startDate?.toISOString().split("T")[0]} to ${conf.endDate?.toISOString().split("T")[0]}`);
    console.log(`   - Mode: ${conf.mode}`);
    console.log(`   - Venue: ${conf.venue ? `${conf.venue.name}, ${conf.venue.city}` : "None assigned"}`);
    console.log(`   - Total Speakers: ${conf.speakers.length}`);
    console.log(`   - Total System Settings: ${conf.settings.length}`);

    // Inspect Speakers
    if (conf.speakers.length > 0) {
      console.log(`\n   🎤 Speakers in DB:`);
      conf.speakers.forEach((sp, i) => {
        console.log(`      ${i + 1}. ${sp.name} (${sp.role}) - Photo: ${sp.imageAssetId || "No photo"}`);
      });
    }

    // Inspect System Settings
    console.log(`\n   ⚙️  System Settings in DB:`);
    for (const setting of conf.settings) {
      if (setting.key === "page_content_home") {
        const sections = Array.isArray(setting.value) ? (setting.value as any[]) : [];
        console.log(`      ✅ key: "page_content_home" (${sections.length} sections configured)`);
        sections.forEach((sec, idx) => {
          console.log(`         [${idx + 1}] ID: "${sec.id}", Name: "${sec.name}", Visible: ${sec.visible !== false}, Title: "${sec.fields?.title || "N/A"}"`);
        });
      } else if (setting.key === "page_content_footer") {
        console.log(`      ✅ key: "page_content_footer" (Configured with quick links & contact info)`);
      } else {
        console.log(`      ✅ key: "${setting.key}"`);
      }
    }
    console.log(`-------------------------------------------------------\n`);
  }

  // 2. Audit Logs
  const auditLogsCount = await prisma.auditLog.count();
  console.log(`📜 Total Audit Logs in DB: ${auditLogsCount}`);

  // 3. File Assets
  const fileAssetsCount = await prisma.fileAsset.count();
  console.log(`📁 Total Uploaded File Assets in DB: ${fileAssetsCount}`);

  console.log("\n=======================================================");
  console.log(" ✅ DATABASE VERIFICATION COMPLETE");
  console.log("=======================================================\n");
}

verifyDatabase()
  .catch((e) => {
    console.error("❌ Database verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
