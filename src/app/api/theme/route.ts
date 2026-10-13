import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { logger } from "../../../lib/logger";

export async function GET(req: NextRequest) {
  logger.info({ ip: req.headers.get("x-forwarded-for") || "unknown" }, "API GET /api/theme request received");
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      logger.warn("API GET /api/theme failed: Missing userId");
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    logger.info({ userId }, "Fetching theme record from SQLite");
    const record = await prisma.theme.findUnique({
      where: { userId },
    });

    if (!record) {
      logger.info({ userId }, "No theme record found for user");
      return NextResponse.json({ document: null });
    }

    // document is stored as a JSON string in SQLite — parse it back
    const parsed = typeof record.document === "string" ? JSON.parse(record.document) : record.document;

    logger.info({ userId }, "Theme successfully loaded");
    return NextResponse.json({ document: parsed });
  } catch (error: any) {
    logger.error({ err: error }, "API GET /api/theme transaction failed");
    return NextResponse.json({ error: error.message || "Failed to load theme" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  logger.info("API POST /api/theme request received");
  try {
    const body = await req.json();
    const { userId, document } = body;

    if (!userId || !document) {
      logger.warn("API POST /api/theme failed: Missing userId or document");
      return NextResponse.json({ error: "Missing userId or document payload" }, { status: 400 });
    }

    // Serialize to string for SQLite storage
    logger.info({ userId }, "Serializing theme AST to JSON string");
    const serializedDoc = JSON.stringify(document);

    logger.info({ userId }, "Upserting theme record in SQLite database");
    await prisma.theme.upsert({
      where: { userId },
      update: { document: serializedDoc },
      create: { userId, document: serializedDoc },
    });

    logger.info({ userId }, "Theme successfully saved");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error({ err: error }, "API POST /api/theme transaction failed");
    return NextResponse.json({ error: error.message || "Failed to save theme" }, { status: 500 });
  }
}
