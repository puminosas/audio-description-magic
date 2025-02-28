
import { Link, useLocation } from 'react-router-dom';

interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links: NavLink[];
  variant?: 'desktop' | 'mobile';
}

const NavLinks = ({ links, variant = 'desktop' }: NavLinksProps) => {
  const location = useLocation();
  
  if (variant === 'mobile') {
    return (
      <>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`py-2 transition-colors hover:text-primary ${
              location.pathname === link.path ? 'text-primary font-medium' : 'text-foreground/80'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </>
    );
  }
  
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`transition-colors hover:text-primary ${
            location.pathname === link.path ? 'text-primary font-medium' : 'text-foreground/80'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
