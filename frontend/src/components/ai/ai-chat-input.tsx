import { FormEvent, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AIChatInputProps = {
  disabled?: boolean
  onSubmit: (content: string) => void | Promise<void>
}

export const AIChatInput = ({ disabled = false, onSubmit }: AIChatInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = value.trim()
    if (!content || disabled) return

    setValue('')
    await onSubmit(content)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tanyakan tentang produk..."
        aria-label="Pesan untuk AI Shopping Assistant"
        autoComplete="off"
        disabled={disabled}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        aria-label="Kirim pesan"
      >
        <ArrowUp aria-hidden="true" />
      </Button>
    </form>
  )
}
