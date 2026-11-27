import { ContentPageView, contentPageMetadata } from "@/components/content/ContentPageView";

export const generateMetadata = () => contentPageMetadata("privacy");

export default function Page() {
  return <ContentPageView slug="privacy" />;
}
