import { Bot, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AIChatMessage as AIChatMessageType } from '@/types/ai.type'

type AIChatMessageProps = {
  message: AIChatMessageType
}

export const AIChatMessage = ({ message }: AIChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" aria-hidden="true" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-muted text-foreground',
        )}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-4" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
