import { StoreLayout } from "@/components/store/StoreLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreLayout>{children}</StoreLayout>;
}

