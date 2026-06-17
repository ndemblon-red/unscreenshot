import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description: string;
  /** Canonical path, e.g. "/app". Defaults to current pathname. */
  canonical?: string;
  /** If true, adds noindex (for auth-gated or utility pages). */
  noindex?: boolean;
}

const SITE = "https://unscreenshot.ai";

export default function PageMeta({ title, description, canonical, noindex }: PageMetaProps) {
  const path = canonical ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={path} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
