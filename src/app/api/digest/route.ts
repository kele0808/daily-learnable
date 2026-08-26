import { getDailyDigest } from "@/lib/digest";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  const digest = await getDailyDigest(date ?? undefined);
  return NextResponse.json(digest);
}
