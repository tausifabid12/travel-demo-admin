import DestinationEditor from "@/components/admin/DestinationEditor";

export default async function EditDestinationPage({
  params,
}: PageProps<"/admin/destinations/[id]">) {
  const { id } = await params;
  return <DestinationEditor id={id} />;
}
