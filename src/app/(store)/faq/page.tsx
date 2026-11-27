import { ContentPageView, contentPageMetadata } from "@/components/content/ContentPageView";

export const generateMetadata = () => contentPageMetadata("faq");

export default function Page() {
  return <ContentPageView slug="faq" />;
}
