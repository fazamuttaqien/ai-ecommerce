import carouselImageThree from '@/assets/images/carosuel-img-3.png'
import carouselImageOne from '@/assets/images/carousel-img-1.png'
import carouselImageTwo from '@/assets/images/carousel-img-2.png'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { PUBLIC_ROUTES } from '@/routes/route'
import { Link } from 'react-router-dom'

type Props = {
  userName?: string
  personalized?: boolean
}

const HeroCarousel = ({ userName, personalized = false }: Props) => {
  const personalTitle = userName
    ? `Pilihan yang pas untuk Anda, ${userName}`
    : 'Temukan Produk yang Cocok untuk Anda'

  const heroSlides = [
    {
      id: 'personalized',
      subtitle: personalized ? 'Picked for you' : 'Fresh picks for you',
      title: personalTitle,
      action: 'Explore your picks',
      image: carouselImageThree,
    },
    {
      id: 'carousel-2',
      subtitle: 'New customers',
      title: (
        <>
          <span className="mark-label">$0 delivery fees</span> <br /> on above $20
          orders
        </>
      ),
      action: 'Shop now',
      image: carouselImageTwo,
    },
    {
      id: 'carousel-1',
      subtitle: 'Fresh savings',
      title: 'Everyday essentials and great value, delivered when you need them',
      action: 'Shop deals',
      image: carouselImageOne,
    },
  ]

  return (
    <section className="w-full py-5">
      <Carousel
        opts={{ align: 'start', loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id} className="basis-full pl-4 lg:basis-1/2">
              <article className="relative h-62.5 overflow-hidden rounded-2xl border border-border bg-card shadow-xs md:h-65">
                <img src={slide.image} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-white/45" />
                <div className="relative z-10 flex h-full max-w-[90%] flex-col justify-center gap-5 p-7 sm:max-w-[58%] md:p-9">
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-2xl font-bold leading-tight text-black md:text-3xl">
                    {slide.title}
                  </h1>
                  <Button asChild variant="secondary" className="h-10 w-fit rounded-sm px-7 text-base">
                    <Link to={PUBLIC_ROUTES.PRODUCTS}>{slide.action}</Link>
                  </Button>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 hidden size-10! bg-background shadow-lg lg:inline-flex" />
        <CarouselNext className="-right-4 size-10! bg-background shadow-lg" />
      </Carousel>
    </section>
  )
}

export default HeroCarousel
