export const CREATOR_NAME = 'Atul Choudhary'
export const CREATOR_LINKEDIN = 'https://www.linkedin.com/in/atul-choudhary-018037301/'

const CREATOR_PATTERNS = [
  /who\s+(is|'s|are)\s+(your|the)\s+(creator|maker|developer|founder|author|owner|builder)/i,
  /who\s+(created|made|built|developed|designed|coded|programmed)\s+(you|this|nexus)/i,
  /who\s+made\s+you/i,
  /your\s+(creator|maker|developer|founder|author)/i,
  /creator\s+of\s+(you|this|nexus|nexus ai)/i,
  /who\s+(is|'s)\s+behind\s+(you|this|nexus)/i,
  /kisne\s+(banaya|banayi|banaye|develop)/i,
  /tumhara\s+(creator|developer|founder|banane\s+wala)/i,
  /tumhe\s+kisne/i,
  /aapko\s+kisne/i,
  /who\s+(owns|built)\s+nexus/i,
]

export function isCreatorQuestion(message: string): boolean {
  const q = message.trim()
  if (!q) return false
  return CREATOR_PATTERNS.some((re) => re.test(q))
}

export function creatorAnswer(message: string): string {
  const hindi = /[\u0900-\u097F]/.test(message)

  if (hindi) {
    return `Mujhe **${CREATOR_NAME}** ne banaya hai — Delhi ke AI Product Engineer.

Woh production-grade AI systems banate hain: agentic workflows, low-latency RAG pipelines, aur multimodal apps. **NEXUS AI** unka project hai, **Jarvis AI** ke saath.

**Thoda unke baare mein**
- AI Engineer — Agentic AI, RAG, multi-agent orchestration
- Tech: Python, LangChain, FastAPI, Next.js, TypeScript
- Location: Delhi, India

**LinkedIn:** [${CREATOR_NAME}](${CREATOR_LINKEDIN})`
  }

  return `I was created by **${CREATOR_NAME}**, an AI Product Engineer based in Delhi.

He builds production AI systems — agentic workflows, low-latency RAG pipelines, and multimodal apps. **NEXUS AI** is one of his projects, alongside **Jarvis AI**.

## A little about him
- Specializes in Agentic AI, RAG pipelines, and multi-agent orchestration
- Works with Python, LangChain, FastAPI, Next.js, and TypeScript
- Based in Delhi, India

**Connect on LinkedIn:** [${CREATOR_NAME}](${CREATOR_LINKEDIN})`
}
