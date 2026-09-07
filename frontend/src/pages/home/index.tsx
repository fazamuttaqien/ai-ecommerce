import { useQuery } from '@tanstack/react-query'
import HeroCarousel from './hero-carousel'
import CategoriesSection from './categories-section'
import PersonalizedSections from './personalized-sections'
import { getPersonalizedHomepageQueryFn, getProductsQueryFn, getProductDealsQueryFn } from '@/lib/api'
import { useUser } from '@/hooks/use-user'
import type { PersonalizedHomepageSection } from '@/types/personalized-homepage.type'

const FALLBACK_LIMIT = 6

const HomePage = () => {
  const { data: user, isLoading: isUserLoading } = useUser()
  const isAuthenticated = Boolean(user)

  const personalizedQuery = useQuery({
    queryKey: ['personalized-homepage'],
    queryFn: getPersonalizedHomepageQueryFn,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 3,
  })

  const shouldUseFallback = !isAuthenticated || personalizedQuery.isError

  const fallbackProductsQuery = useQuery({
    queryKey: ['homepage-fallback-products'],
    queryFn: () => getProductsQueryFn({ page: 1, limit: FALLBACK_LIMIT, sort: 'highest-rating', inStock: true }),
    enabled: !isUserLoading && shouldUseFallback,
    staleTime: 1000 * 60 * 5,
  })

  const fallbackDealsQuery = useQuery({
    queryKey: ['homepage-fallback-deals'],
    queryFn: () => getProductDealsQueryFn(FALLBACK_LIMIT),
    enabled: !isUserLoading && shouldUseFallback,
    staleTime: 1000 * 60 * 5,
  })

  const fallbackProducts = fallbackProductsQuery.data?.products ?? []
  const fallbackDeals = fallbackDealsQuery.data?.products ?? []
  const fallbackSections: PersonalizedHomepageSection[] = [
    { type: 'for-you', title: 'Popular Picks', products: fallbackProducts },
    { type: 'based-on-history', title: 'Discover More', products: fallbackProducts },
    { type: 'deals', title: 'Deals for You', products: fallbackDeals },
    { type: 'popular', title: 'Popular Products', products: fallbackProducts },
  ]

  const isLoading =
    isUserLoading ||
    (isAuthenticated && personalizedQuery.isLoading) ||
    (shouldUseFallback && (fallbackProductsQuery.isLoading || fallbackDealsQuery.isLoading))

  const sections = shouldUseFallback
    ? fallbackSections
    : personalizedQuery.data?.sections ?? []
  const personalized = !shouldUseFallback && (personalizedQuery.data?.personalized ?? false)

  return (
    <div className="w-full">
      <HeroCarousel userName={user?.name} personalized={personalized} />
      <CategoriesSection />
      <PersonalizedSections sections={sections} loading={isLoading} />
    </div>
  )
}

export default HomePage
