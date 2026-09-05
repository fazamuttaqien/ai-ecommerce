import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'

const Logo = ({
  className,
  to = '/',
  showText = true,
}: {
  className?: string
  to?: string
  showText?: boolean
}) => {
  return (
    <Link
      to={to}
      className={cn('flex items-center gap-2 font-medium', className)}
    >
      <div className="flex h-7 w-auto shrink-0 items-center">
        <img
          src={logo}
          alt="instant"
          className="block h-full w-auto object-contain"
        />
      </div>
      {showText && (
        <span className="text-[22px] font-semibold dark:text-white">
          instantly
        </span>
      )}
    </Link>
  )
}

export default Logo
