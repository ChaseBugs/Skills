import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Home() {
  redirect((await currentUser()) ? "/workspace" : "/login");
}
