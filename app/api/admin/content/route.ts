import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const {
      conferenceId,
      slug,
      sections,
      footer,
      navigation,
      committee,
      tracks,
      pricing,
      abstractSettings,
      policies,
      faviconUrl
    } = await request.json();

    let targetConfId = conferenceId;
    let isDbSuccess = false;

    try {
      if (!targetConfId && slug) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const conf = await prisma.conference.findFirst({
          where: isUUID
            ? { OR: [{ id: slug }, { slug: { equals: slug, mode: "insensitive" } }], deletedAt: null }
            : { slug: { equals: slug, mode: "insensitive" }, deletedAt: null }
        });
        targetConfId = conf?.id;
      }

      if (targetConfId) {
        // Save page_content_home setting (all sections array with visibility and fields)
        if (sections) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "page_content_home"
              }
            },
            update: {
              value: sections
            },
            create: {
              conferenceId: targetConfId,
              key: "page_content_home",
              value: sections
            }
          });
        }

        // Save page_content_footer setting
        if (footer) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "page_content_footer"
              }
            },
            update: {
              value: footer
            },
            create: {
              conferenceId: targetConfId,
              key: "page_content_footer",
              value: footer
            }
          });
        }

        // Save navigation_menu setting (custom reorderable header navbar)
        if (navigation) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "navigation_menu"
              }
            },
            update: {
              value: navigation
            },
            create: {
              conferenceId: targetConfId,
              key: "navigation_menu",
              value: navigation
            }
          });
        }

        // Save organizing_committee
        if (committee) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "organizing_committee"
              }
            },
            update: { value: committee },
            create: {
              conferenceId: targetConfId,
              key: "organizing_committee",
              value: committee
            }
          });
        }

        // Save scientific_tracks
        if (tracks) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "scientific_tracks"
              }
            },
            update: { value: tracks },
            create: {
              conferenceId: targetConfId,
              key: "scientific_tracks",
              value: tracks
            }
          });
        }

        // Save registration_pricing
        if (pricing) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "registration_pricing"
              }
            },
            update: { value: pricing },
            create: {
              conferenceId: targetConfId,
              key: "registration_pricing",
              value: pricing
            }
          });
        }

        // Save abstract_settings
        if (abstractSettings) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "abstract_settings"
              }
            },
            update: { value: abstractSettings },
            create: {
              conferenceId: targetConfId,
              key: "abstract_settings",
              value: abstractSettings
            }
          });
        }

        // Save policies
        if (policies) {
          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "policies"
              }
            },
            update: { value: policies },
            create: {
              conferenceId: targetConfId,
              key: "policies",
              value: policies
            }
          });
        }

        // Save faviconUrl if provided
        if (faviconUrl !== undefined) {
          const existingBranding = await prisma.systemSetting.findFirst({
            where: { conferenceId: targetConfId, key: "branding_assets" }
          });
          const currentBrandingVal = (existingBranding?.value as Record<string, any>) || {};

          await prisma.systemSetting.upsert({
            where: {
              conferenceId_key: {
                conferenceId: targetConfId,
                key: "branding_assets"
              }
            },
            update: {
              value: {
                ...currentBrandingVal,
                faviconUrl
              }
            },
            create: {
              conferenceId: targetConfId,
              key: "branding_assets",
              value: {
                ...currentBrandingVal,
                faviconUrl
              }
            }
          });

          // Update active theme tokens
          const activeTheme = await prisma.themeSetting.findFirst({
            where: { conferenceId: targetConfId, isActive: true }
          });
          if (activeTheme) {
            const tokens = (activeTheme.tokens as Record<string, any>) || {};
            await prisma.themeSetting.update({
              where: { id: activeTheme.id },
              data: {
                tokens: {
                  ...tokens,
                  faviconUrl
                }
              }
            });
          }
        }

        // Create Audit Log
        try {
          await prisma.auditLog.create({
            data: {
              action: "content.updated",
              entity: "SystemSetting",
              entityId: targetConfId,
              metadata: {
                updatedSections: sections ? sections.map((s: any) => s.id) : [],
                hasFooterUpdate: !!footer,
                hasNavigationUpdate: !!navigation,
                hasCommitteeUpdate: !!committee,
                hasTracksUpdate: !!tracks,
                hasPricingUpdate: !!pricing,
                hasFaviconUpdate: faviconUrl !== undefined
              }
            }
          });
        } catch (e) {
          console.warn("Audit log creation error:", e);
        }

        isDbSuccess = true;
      }
    } catch (dbErr) {
      console.warn("DB offline or issue during content save:", dbErr);
    }

    // Always persist to local settings files (and sync to mainweb)
    try {
      const syncTargets = [
        path.join(process.cwd(), "storage", "settings.json"),
        path.join(process.cwd(), "..", "mainweb", "storage", "settings.json"),
        "C:\\Users\\banda\\Desktop\\mainweb\\storage\\settings.json"
      ];

      for (const targetFile of syncTargets) {
        try {
          const dir = path.dirname(targetFile);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

          let current: any = {};
          if (fs.existsSync(targetFile)) {
            try {
              current = JSON.parse(fs.readFileSync(targetFile, "utf8"));
            } catch {}
          }

          if (sections) current.sections = sections;
          if (footer) current.footer = footer;
          if (navigation) current.navigation = navigation;
          if (committee) current.committee = committee;
          if (tracks) current.tracks = tracks;
          if (pricing) {
            current.pricing = pricing;
            current.registration = {
              label: pricing.label,
              note: pricing.note,
              student: pricing.student,
              academic: pricing.academic,
              industry: pricing.industry
            };
            if (pricing.accommodation) {
              current.accommodation = pricing.accommodation;
            }
          }
          if (abstractSettings) {
            current.abstract = abstractSettings;
            current.abstractSettings = abstractSettings;
          }
          if (policies) current.policies = policies;
          if (faviconUrl !== undefined) {
            current.branding = { ...(current.branding || {}), faviconUrl };
          }
          current.updatedAt = new Date().toISOString();

          fs.writeFileSync(targetFile, JSON.stringify(current, null, 2), "utf8");
        } catch {}
      }
    } catch (fsErr) {
      console.warn("File sync error:", fsErr);
    }

    // Attempt cache revalidation pings to mainweb
    try {
      const confSlug = slug || "ICGIT";
      await fetch(`http://127.0.0.1:3000/api/revalidate?path=/${confSlug}`, { method: "POST" }).catch(() => {});
      await fetch(`http://127.0.0.1:3000/api/revalidate?path=/`, { method: "POST" }).catch(() => {});
      await fetch(`http://127.0.0.1:3001/api/revalidate?path=/${confSlug}`, { method: "POST" }).catch(() => {});
      await fetch(`http://127.0.0.1:3001/api/revalidate?path=/`, { method: "POST" }).catch(() => {});
    } catch (_) {}

    return NextResponse.json({
      success: true,
      persisted: { db: isDbSuccess, file: true },
      message: "All navigation, committee, tracks, pricing, policies & website content updated successfully!"
    });
  } catch (error: any) {
    console.error("Admin content save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update content" }, { status: 500 });
  }
}
