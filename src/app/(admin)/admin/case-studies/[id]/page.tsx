import CaseStudyEditor from "@/components/admin/CaseStudyEditor";

export default async function EditCaseStudyEditorPage({
  params,
}: PageProps<"/admin/case-studies/[id]">) {
  const { id } = await params;
  return <CaseStudyEditor id={id} />;
}
