import CareerEditor from "@/components/admin/CareerEditor";

export default async function EditCareerEditorPage({
  params,
}: PageProps<"/admin/careers/[id]">) {
  const { id } = await params;
  return <CareerEditor id={id} />;
}
