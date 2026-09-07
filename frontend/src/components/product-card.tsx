import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/hooks/use-cart'
import { cn } from '@/lib/utils'
import { getStockDisplay, splitPrice } from '@/utils/helper'
import { BanIcon, Plus, Star, TriangleAlert, Truck } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'

export type ProductCardProps = {
  id: string
  slug: string
  imageUrl: string
  name: string
  brand?: string
  salePrice: number
  originalPrice: number
  discountPercent?: number
  discountLabel?: string
  ratingAverage?: number
  reviewCount?: number
  unit: string
  stockCount?: number
  className?: string
}

const ProductCard = ({
  id,
  slug,
  imageUrl,
  name,
  brand,
  salePrice,
  originalPrice,
  discountPercent,
  discountLabel,
  ratingAverage = 0,
  reviewCount = 0,
  unit,
  stockCount,
  className,
}: ProductCardProps) => {
  const productPath = `/products/${slug}`
  const result = splitPrice(salePrice)
  const saleDollars = result.dollars
  const saleCents = result.cents
  const hasDiscount = originalPrice > salePrice
  const stock = getStockDisplay({ stockCount })
  const isOutofStock = stock.status === 'out'
  const StockIcon =
    stock.status === 'in-stock'
      ? Truck
      : stock.status === 'out'
        ? BanIcon
        : TriangleAlert
  const stockClassName =
    stock.status === 'in-stock'
      ? 'text-primary'
      : stock.status === 'out'
        ? 'text-destructive'
        : 'text-secondary'

  const addToCart = useCart((state) => state.addToCart)
  const items = useCart((state) => state.items)
  const cartItem = items.find((item) => item.productId === id)

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    addToCart({
      productId: id,
      imageUrl,
      name,
      salePrice,
      originalPrice,
      discountPercent,
      discountLabel,
      unit,
      stockCount,
    })
  }

  return (
    <Card
      className={cn(
        'relative gap-0 overflow-hidden rounded-sm bg-transparent p-0 shadow-none! ring-0',
        className,
      )}
    >
      {isOutofStock && (
        <div className="absolute z-20 h-5 w-full bg-destructive/70 text-center text-white">
          Out of Stock
        </div>
      )}
      <CardContent
        className={cn(
          'relative flex flex-col gap-1 p-0',
          isOutofStock && 'cursor-not-allowed! opacity-50',
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <Link
            to={productPath}
            className="flex size-full items-center justify-center p-1"
          >
            <img src={imageUrl} alt={name} className="size-full object-cover" />
          </Link>
          {!isOutofStock && (
            <Button
              type="button"
              onClick={handleAddToCart}
              className="absolute right-0 top-0 h-8 rounded-sm bg-green-light! px-2.5 text-sm font-semibold"
            >
              <Plus className="size-4" />
              {cartItem && cartItem.quantity > 0 ? (
                <span className="text-green-50">
                  {cartItem.quantity} in cart
                </span>
              ) : (
                'Add'
              )}
            </Button>
          )}
        </div>

        {brand ? (
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {brand}
          </p>
        ) : null}

        <div className="mb-px flex items-center gap-3">
          <Link
            to={productPath}
            className={cn(
              'relative flex w-fit items-start text-2xl font-semibold leading-none text-foreground',
              hasDiscount && 'mark-label',
            )}
          >
            <span className="-mt-1.5 pt-1 text-sm">$</span>
            <span>{saleDollars}</span>
            <span className="-mt-1.5 pt-1 text-sm">{saleCents}</span>
          </Link>
          {hasDiscount ? (
            <span className="text-[15px] text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          ) : null}
        </div>

        {discountLabel ? (
          <span className="text-[14px] font-normal text-green-light">
            {discountLabel}
          </span>
        ) : discountPercent ? (
          <span className="text-[14px] font-normal text-green-light">
            {discountPercent}% off
          </span>
        ) : null}

        <Link
          to={productPath}
          className="line-clamp-3 max-w-62.5 text-[15.5px] leading-snug text-muted-foreground hover:text-foreground"
        >
          {name}
        </Link>

        <div className="flex items-center gap-1 text-lg leading-none">
          <span className="flex text-secondary" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'size-4 fill-current stroke-current',
                  index >= ratingAverage && 'text-gray-300',
                )}
              />
            ))}
          </span>
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>

        <p className="text-sm text-muted-foreground">
          {unit ? <span>{unit}</span> : null}
          {unit ? <span> · </span> : null}
          <span className="font-medium text-foreground">Pick it</span>
        </p>
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-normal',
            stockClassName,
          )}
        >
          <StockIcon className="size-3.5" />
          {stock.text}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
