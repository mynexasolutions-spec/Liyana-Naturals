import { ContentPageView, contentPageMetadata } from "@/components/content/ContentPageView";

export const generateMetadata = () => contentPageMetadata("shipping-policy");

export default function Page() {
  return <ContentPageView slug="shipping-policy" />;
}
