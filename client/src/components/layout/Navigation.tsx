import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, HomeIcon, UserIcon } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Navigation() {
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:bottom-auto z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <HomeIcon className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </Button>
          </Link>
          <Link href="/assignments">
            <Button variant="ghost" className="gap-2">
              <BookOpenIcon className="w-5 h-5" />
              <span className="hidden md:inline">Assignments</span>
            </Button>
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <Link href="/profile">
              <Button variant="ghost" className="gap-2">
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline">{user.username}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
