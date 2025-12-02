export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const badges: Badge[] = [
  { id: "early", name: "Early Bhai", description: "Joined in the early days.", icon: "🚀" },
  { id: "verified", name: "Verified", description: "Verified email user.", icon: "✅" },
  { id: "hundred_posts", name: "100 Posts", description: "Shared 100 posts.", icon: "📢" },
  { id: "challenge_champ", name: "Challenge Champion", description: "Won a community challenge.", icon: "🏆" },
  { id: "one_year", name: "1 Year", description: "Member for a year.", icon: "🎂" },
];
