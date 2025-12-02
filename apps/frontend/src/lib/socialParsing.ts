export const parseMentionsAndTags = (text: string) => {
  const mentionMatches = text.match(/@([A-Za-z0-9_]+)/g) || [];
  const hashtagMatches = text.match(/#([A-Za-z0-9_]+)/g) || [];

  const mentions = Array.from(new Set(mentionMatches.map((m) => m.replace("@", ""))));
  const hashtags = Array.from(new Set(hashtagMatches.map((t) => t.replace("#", "").toLowerCase())));

  return { mentions, hashtags };
};
