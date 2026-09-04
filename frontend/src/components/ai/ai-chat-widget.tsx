import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { AIChatInput } from '@/components/ai/ai-chat-input'
import { AIChatMessage } from '@/components/ai/ai-chat-message'
import { useAIChat } from '@/hooks/use-ai-chat'

export const AIChatWidget = () => {
  const [open, setOpen] = useState(false)
  const { messages, isLoading, error, sendMessage } = useAIChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, error])

  return (
    <>
      {!open && (
        <Button
          type="button"
          size="icon-lg"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-40 shadow-lg sm:right-6 sm:bottom-6"
          aria-label="Buka AI Shopping Assistant"
        >
          <MessageCircle aria-hidden="true" />
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              AI Shopping Assistant
            </SheetTitle>
            <SheetDescription>
              Tanyakan produk, harga, stok, diskon, atau ulasan.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex min-h-full flex-col gap-3 p-4">
              {messages.length === 0 && !error ? (
                <Card className="mt-auto mb-auto border-dashed p-4 text-center shadow-none">
                  <Bot className="mx-auto mb-2 size-7 text-primary" aria-hidden="true" />
                  <p className="text-sm font-medium">Ada yang bisa saya bantu?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contoh: “Tampilkan buah yang murah dan masih tersedia.”
                  </p>
                </Card>
              ) : (
                messages.map((message, index) => (
                  <AIChatMessage key={`${message.role}-${index}`} message={message} />
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" aria-hidden="true" />
                  </div>
                  <span>AI sedang mencari jawaban...</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
              <div ref={bottomRef} aria-hidden="true" />
            </div>
          </ScrollArea>

          <AIChatInput disabled={isLoading} onSubmit={sendMessage} />
        </SheetContent>
      </Sheet>
    </>
  )
}
