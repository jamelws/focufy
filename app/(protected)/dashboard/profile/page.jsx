// app/profile/page.tsx (✅ Server Component)
import { auth } from "@/auth";
import UserProfileForm from "@/components/UserProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login"); // o la ruta que uses
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${session.user.id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Error al obtener perfil");
  }

  const userProfile = await res.json();

  return <UserProfileForm user={userProfile} />;
}
