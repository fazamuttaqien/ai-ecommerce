import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AIRecommendedProduct } from '@/types/ai.type'

type AIProductSuggestionProps = {
  product: AIRecommendedProduct
}

const formatPrice = (price?: number) => {
  if (typeof price !== 'number' || !Number.isFinite(price)) return null

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

export const AIProductSuggestion = ({ product }: AIProductSuggestionProps) => {
  const navigate = useNavigate()
  const hasValidSlug = Boolean(product.slug?.trim())
  const isOutOfStock =
    typeof product.stockCount === 'number' && product.stockCount <= 0
  const salePrice = formatPrice(product.salePrice)
  const originalPrice = formatPrice(product.originalPrice)
  const hasDiscount =
    typeof product.salePrice === 'number' &&
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.salePrice

  const handleClick = () => {
    if (hasValidSlug) navigate(`/products/${product.slug}`)
  }

  return (
    <Card
      className={cn(
        'w-full overflow-hidden border bg-background shadow-none transition-colors',
        hasValidSlug && 'cursor-pointer hover:bg-muted/50',
        isOutOfStock && 'opacity-75',
      )}
      role={hasValidSlug ? 'link' : undefined}
      tabIndex={hasValidSlug ? 0 : undefined}
      onClick={hasValidSlug ? handleClick : undefined}
      onKeyDown={(event) => {
        if (hasValidSlug && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          handleClick()
        }
      }}
    >
      <CardContent className="flex gap-3 p-3">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted sm:size-24">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name ?? 'Produk'}
              className="size-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="px-2 text-center text-xs text-muted-foreground">
              Tidak ada gambar
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-destructive/80 px-1 py-0.5 text-center text-[10px] font-medium text-destructive-foreground">
              Out of Stock
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name || 'Produk'}
          </p>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {salePrice && (
              <span className="text-base font-semibold">{salePrice}</span>
            )}
            {hasDiscount && originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice}
              </span>
            )}
          </div>

          {typeof product.discountPercent === 'number' &&
            product.discountPercent > 0 && (
              <p className="text-xs font-medium text-green-light">
                {product.discountPercent}% off
              </p>
            )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {typeof product.ratingAverage === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Star
                  className="size-3.5 fill-current text-secondary"
                  aria-hidden="true"
                />
                {product.ratingAverage.toFixed(1)}
              </span>
            )}
            {typeof product.reviewCount === 'number' && (
              <span>({product.reviewCount})</span>
            )}
            {typeof product.stockCount === 'number' && !isOutOfStock && (
              <span>{product.stockCount} tersedia</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
