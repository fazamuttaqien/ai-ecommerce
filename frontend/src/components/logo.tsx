import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const Logo = ({
  className,
  to = '/',
}: {
  className?: string
  to?: string
}) => {
  return (
    <Link
      to={to}
      className={cn(
        'text-[22px] font-semibold tracking-tight text-foreground',
        className,
      )}
      style={{ fontFamily: "'Slabo 27px', serif" }}
    >
      E-Commerce
    </Link>
  )
}

export default Logo
