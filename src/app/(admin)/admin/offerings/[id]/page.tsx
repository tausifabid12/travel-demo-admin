import OfferingEditor from "@/components/admin/OfferingEditor";

export default async function EditOfferingEditorPage({
  params,
}: PageProps<"/admin/offerings/[id]">) {
  const { id } = await params;
  return <OfferingEditor id={id} />;
}
