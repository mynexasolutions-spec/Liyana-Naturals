import { ContentPageView, contentPageMetadata } from "@/components/content/ContentPageView";

export const generateMetadata = () => contentPageMetadata("refund-policy");

export default function Page() {
  return <ContentPageView slug="refund-policy" />;
}
