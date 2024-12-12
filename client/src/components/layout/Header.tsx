import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  return (
    <header className={cn("relative h-64 bg-primary/10 overflow-hidden", className)}>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516246843873-09d40904c6bf')" }}
      />
      <div className="relative container h-full flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-primary tracking-tight">
          African Education Platform
        </h1>
        <p className="mt-2 text-xl text-foreground/80 max-w-xl">
          Empowering minds through African wisdom and modern education
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      </div>
    </header>
  );
}
