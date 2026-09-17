import { WorkspaceApp } from "@/components/workspace";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await currentUser())) redirect("/login");
  return <WorkspaceApp />;
}
