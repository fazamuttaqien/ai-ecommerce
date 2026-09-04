import { useCallback, useState } from 'react'

import { postAIChat } from '@/lib/api'
import type { AIChatMessage } from '@/types/ai.type'

const AI_UNAVAILABLE_MESSAGE =
  'Maaf, AI Shopping Assistant sedang tidak tersedia. Silakan coba lagi.'

export const useAIChat = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()
      if (!trimmedContent || isLoading) return

      const userMessage: AIChatMessage = {
        role: 'user',
        content: trimmedContent,
      }
      const nextMessages = [...messages, userMessage]
      const requestMessages = nextMessages.map(
        ({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        }),
      )

      setMessages(nextMessages)
      setError(null)
      setIsLoading(true)

      try {
        const response = await postAIChat({ messages: requestMessages })
        const assistantMessage: AIChatMessage = {
          role: 'assistant',
          content: response.data.content,
          products: response.data.products ?? [],
        }

        setMessages((current) => [...current, assistantMessage])
      } catch {
        setError(AI_UNAVAILABLE_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages],
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError: () => setError(null),
  }
}

export { AI_UNAVAILABLE_MESSAGE }
