import type { PlatformId, Tone } from '../types';

const PLATFORM_GUIDELINES: Record<PlatformId, string> = {
  twitter: `X / Twitter Thread
- Each tweet: max 280 characters (count carefully)
- First tweet = HOOK — grab attention in 1 line
- Use a thread format: "1/n", "2/n" at end
- Break complex ideas into digestible tweets
- Use line breaks between tweets
- 2-3 relevant hashtags max in the final tweet
- Conversational but authoritative tone
- Ask a question or invite reply in the last tweet
- Use **bold** for emphasis in tweets that allow it`,

  linkedin: `LinkedIn Post / Article
- Professional but not stiff — conversational authority
- Open with a personal story, insight, or provocative statement
- Short paragraphs (1-3 sentences each) for scannability
- Use line breaks between sections
- End with a question or call to action to drive comments
- 3-5 relevant hashtags at the very bottom
- Can include a short "article" format if content is long (500-3000 chars)
- Emoji used sparingly and intentionally
- Use markdown formatting: ## for sections, **bold** for key points`,

  newsletter: `Newsletter (Substack / Email)
- Start with a compelling subject line (prefixed with "Subject: ")
- Opening line should re-engage the reader who opened the email
- Personal, direct, "writing to a friend who's interested in this topic"
- Full article length: 800-3000 words
- Use subheadings (# ##), bullet points, and short paragraphs
- Include a clear call to action at the end (share, reply, subscribe)
- PS section can include personal updates or recommendations`,

  wechat: `微信公众平台 (WeChat Official Account)
- 中文内容，正式但亲切的调性
- 标题要有吸引力，控制在30字以内
- 开头简要点出核心观点，抓住读者注意力
- 使用小标题分割段落，中长篇更合适 (1000-3000字)
- 段落不宜过长，3-5句为宜
- 适当使用**加粗**强调关键信息
- 结尾要有总结+互动引导"你觉得呢？欢迎留言讨论"
- 文末可以加个人简介或往期推荐
- 不需要hashtag，不需要emoji泛滥，保持克制
- **重要：输出格式要保留 Markdown 排版标记** — 使用 ## 小标题、**加粗**、> 引用，保持排版美观`,

  xiaohongshu: `小红书 (Xiaohongshu / RED)
- 标题要吸引人，可以有悬念感 (15字内)
- 开头制造共鸣："姐妹们！""谁懂啊" 等亲切口吻
- 正文用短句、短段落，多用emoji 📌✨🔥
- 核心信息用 emoji + 短标题分段 (如 📍XX技巧)
- 语气：个人经验分享，而非教科书式讲解
- 结尾要互动"你们觉得呢？""欢迎补充～"
- 标签 3-5 个，以 # 开头，放在文末
- 全文约 300-800 字为宜
- 使用 **加粗** 标记重点`,

  reddit: `Reddit Post
- Conversational, authentic, "real person" tone
- Avoid marketing speak — Reddit hates sales pitches
- Open with context (what subreddit this fits in)
- Use clear sections with markdown headers if long
- Be ready for discussion — invite opinions
- TL;DR at bottom if over ~500 words
- No hashtags
- Use markdown formatting: **bold** for emphasis, > for quotes, ## for sections
- Edit to add updates if needed (Reddit culture)`,
};

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  professional: 'Maintain a polished, authoritative, and well-structured tone. Use precise language. Avoid slang. Suitable for a business audience.',
  casual:       'Keep it friendly, conversational, and approachable. Use contractions, occasional slang if natural. Write like you\'re talking to a peer.',
  promotional:  'Emphasize value propositions, benefits, and outcomes. Include clear calls to action. Highlight what makes the subject worth attention.',
  storytelling: 'Lead with narrative — a personal anecdote, a case study, or a journey. Use vivid details. Make the reader feel something before teaching them something.',
  educational:  'Focus on teaching. Break down concepts step by step. Use examples, analogies, and clear explanations. Assume the reader is curious but not expert.',
};

export function buildSystemPrompt(platform: PlatformId, tone: Tone): string {
  return `You are a professional content adaptation specialist. Your job is to rewrite content for a specific platform while preserving the original meaning, facts, and core message.

## Platform Guidelines
${PLATFORM_GUIDELINES[platform]}

## Tone
${TONE_INSTRUCTIONS[tone]}

## Rules
1. Preserve all factual information from the source
2. Adapt the format, length, and style to the platform
3. Do NOT add fabricated statistics, quotes, or data
4. If the source lacks information needed for a full post, work with what's given — don't invent
5. Output ONLY the adapted content, no explanations, no notes
6. For Twitter threads: output each tweet separated by "---"
7. Use markdown formatting (## headers, **bold**, - lists) to make the output readable and well-formatted`;
}

export function buildUserMessage(content: string, platform: PlatformId): string {
  const hints: Partial<Record<PlatformId, string>> = {
    twitter: 'Make this into an engaging X thread (each tweet max 280 chars, separated by "---").',
    linkedin: 'Adapt this into a LinkedIn post with professional but engaging tone.',
    newsletter: 'Turn this into a full newsletter with subject line at the top.',
    wechat: '将以下内容改写为一篇微信公众号文章，保持专业亲切的中文调性。',
    xiaohongshu: '将以下内容改写成小红书风格的笔记，使用emoji，个人经验分享调性。',
    reddit: 'Adapt this into a Reddit post with appropriate tone and markdown formatting.',
  };
  return `${hints[platform] ?? 'Adapt this for the platform.'}\n\nSource content:\n\n${content}`;
}
