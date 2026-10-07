/** Every profile Pooja keeps, with the username shown next to it. */
export type Social = {
  id: "github" | "linkedin" | "x" | "youtube-beyond-prompt" | "youtube" | "leetcode";
  name: string;
  handle: string;
  href: string;
};

export const socials: Social[] = [
  { id: "linkedin", name: "LinkedIn", handle: "poojav3rma", href: "https://www.linkedin.com/in/poojav3rma/" },
  { id: "github", name: "GitHub", handle: "poojaverma-me", href: "https://github.com/poojaverma-me" },
  { id: "x", name: "X", handle: "@Poojav3rma", href: "https://x.com/Poojav3rma" },
  { id: "youtube-beyond-prompt", name: "YouTube · Beyond Prompt", handle: "@BeyondPromptOfficial", href: "https://www.youtube.com/@BeyondPromptOfficial" },
  { id: "youtube", name: "YouTube", handle: "@Poojav3rma", href: "https://www.youtube.com/@Poojav3rma" },
  { id: "leetcode", name: "LeetCode", handle: "sugaryeuphoria", href: "https://leetcode.com/sugaryeuphoria/" },
];
