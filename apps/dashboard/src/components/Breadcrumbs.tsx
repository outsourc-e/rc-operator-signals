import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="breadcrumb">
          {c.to ? (
            <Link to={c.to} className="breadcrumb-link">{c.label}</Link>
          ) : (
            <span className="breadcrumb-current">{c.label}</span>
          )}
          {i < crumbs.length - 1 && <span className="breadcrumb-sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
