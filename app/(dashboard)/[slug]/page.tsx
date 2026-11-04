import ReferenceHost from '@/components/reference/reference-host';
import Portal from "@/components/reference/portal";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (<ReferenceHost>
    <Portal email={process.env.ADMIN_EMAIL || "Administrator"} slug={slug} /></ReferenceHost>
  );
}
