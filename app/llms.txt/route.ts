import { llmsIndex, textResponse } from "@/lib/llms";

// the llmstxt.org index for AI assistants, built once at build time
export const dynamic = "force-static";

export function GET() {
  return textResponse(llmsIndex());
}
