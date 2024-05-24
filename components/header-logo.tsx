import Link from 'next/link'
import { Logo } from './ui/logo'

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="items-center hidden lg:flex text-white">
        <Logo />
        <p className="font-semibold text-2xl ml-2.5">Finance</p>
      </div>
    </Link>
  )
}
