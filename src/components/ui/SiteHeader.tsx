import Link from "next/link";
import Icon from "./Icon";
export default function SiteHeader({active,children}:{active?:"studio"|"garden";children?:React.ReactNode}) {
  return <header className="site-header"><Link href="/" className="brand" aria-label="Bathukamma home"><span className="brand-mark"><Icon name="flower" size={26}/></span><span>Bathukamma<span className="brand-small">Digital flower studio</span></span></Link><nav aria-label="Main navigation"><Link href="/studio" className="nav-link" aria-current={active==="studio" ? "page" : undefined}>Studio</Link><Link href="/garden" className="nav-link" aria-current={active==="garden" ? "page" : undefined}>Garden</Link>{children}</nav></header>;
}
