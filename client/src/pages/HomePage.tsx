import { useUser } from "@/hooks/use-user";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pt-16">
      <Navigation />
      <Header />
      <main className="container py-8">
        {user?.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}
