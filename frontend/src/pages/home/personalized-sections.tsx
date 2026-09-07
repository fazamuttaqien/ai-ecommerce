import ProductCard from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  PersonalizedHomepageSection,
  PersonalizedHomepageSectionType,
} from '@/types/personalized-homepage.type'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/routes/route'

const sectionOrder: PersonalizedHomepageSectionType[] = [
  'for-you',
  'based-on-history',
  'deals',
  'popular',
]

const titleMap: Record<PersonalizedHomepageSectionType, string> = {
  'for-you': 'Recommended for You',
  'based-on-history': 'Based on Your Interests',
  deals: 'Deals for You',
  popular: 'Popular Products',
}

const descriptionMap: Record<PersonalizedHomepageSectionType, string> = {
  'for-you': 'A selection ranked around what you are most likely to love.',
  'based-on-history':
    'Products inspired by your recent activity and preferences.',
  deals: 'Fresh savings worth adding to your next basket.',
  popular: 'Great picks when you want to discover something new.',
}

type Props = { sections: PersonalizedHomepageSection[]; loading?: boolean }

const ProductSkeleton = () => (
  <div className="flex min-w-0 flex-col gap-2">
    <Skeleton className="aspect-square w-full rounded-md" />
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-3 w-16" />
  </div>
)

const SectionSkeleton = ({ featured = false }: { featured?: boolean }) => (
  <section
    className={featured ? 'rounded-2xl border bg-muted/30 p-4 md:p-6' : ''}
  >
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  </section>
)

const renderProducts = (products: PersonalizedHomepageSection['products']) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
    {products.map((product) => (
      <ProductCard
        key={product._id}
        id={product._id}
        slug={product.slug}
        imageUrl={product.images?.[0] || ''}
        name={product.name}
        brand={product.brand}
        salePrice={product.salePrice}
        originalPrice={product.originalPrice}
        discountPercent={product.discountPercent}
        discountLabel={product.discountLabel || ''}
        ratingAverage={product.ratingAverage}
        reviewCount={product.reviewCount}
        unit={product.unit}
        stockCount={product.stockCount}
      />
    ))}
  </div>
)

const PersonalizedSections = ({ sections, loading = false }: Props) => {
  if (loading)
    return (
      <div className="flex flex-col gap-10 py-8">
        <SectionSkeleton featured />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    )

  const visibleSections = sectionOrder
    .map((type) => sections.find((section) => section.type === type))
    .filter((section): section is PersonalizedHomepageSection =>
      Boolean(section?.products.length),
    )

  if (!visibleSections.length) return null

  return (
    <div className="flex flex-col gap-10 py-8">
      {visibleSections.map((section, index) => {
        const featured = index === 0 && section.type === 'for-you'
        return (
          <section
            key={section.type}
            className={
              featured ? 'rounded-2xl border bg-muted/30 p-4 md:p-6' : ''
            }
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  {featured ? (
                    <Sparkles className="size-4 text-primary" />
                  ) : null}
                  <h2
                    className={
                      featured
                        ? 'text-2xl font-bold md:text-3xl'
                        : 'text-xl font-semibold md:text-2xl'
                    }
                  >
                    {titleMap[section.type]}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {descriptionMap[section.type]}
                </p>
              </div>
              <Link
                to={PUBLIC_ROUTES.PRODUCTS}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                See more <ChevronRight className="size-4" />
              </Link>
            </div>
            {renderProducts(section.products)}
          </section>
        )
      })}
    </div>
  )
}

export default PersonalizedSections
