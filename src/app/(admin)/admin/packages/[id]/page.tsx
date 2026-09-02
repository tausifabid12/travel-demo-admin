import PackageEditor from "@/components/admin/PackageEditor";

export default async function EditPackagePage({
  params,
}: PageProps<"/admin/packages/[id]">) {
  // params is a Promise in Next 16.
  const { id } = await params;
  return <PackageEditor id={id} />;
}
