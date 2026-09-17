import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { Landing } from "@/components/landing";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (await currentUser()) redirect("/workspace");
  return <Landing />;
}
