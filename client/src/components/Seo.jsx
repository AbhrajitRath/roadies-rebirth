import { Helmet } from "react-helmet-async";

export default function Seo({ title, description, noindex }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
