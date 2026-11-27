import { ContentPageView, contentPageMetadata } from "@/components/content/ContentPageView";

export const generateMetadata = () => contentPageMetadata("terms");

export default function Page() {
  return <ContentPageView slug="terms" />;
}
