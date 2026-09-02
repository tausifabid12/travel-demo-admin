import InsightEditor from "@/components/admin/InsightEditor";

export default async function EditInsightEditorPage({
  params,
}: PageProps<"/admin/insights/[id]">) {
  const { id } = await params;
  return <InsightEditor id={id} />;
}
