import { llmsFull, textResponse } from "@/lib/llms";

// the whole site as plain text for AI assistants, built once at build time
export const dynamic = "force-static";

export function GET() {
  return textResponse(llmsFull());
}
