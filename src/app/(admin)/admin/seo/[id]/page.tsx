import SeoEditor from "@/components/admin/SeoEditor";

export default async function EditSeoPage({
  params,
}: PageProps<"/admin/seo/[id]">) {
  const { id } = await params;
  return <SeoEditor id={id} />;
}
