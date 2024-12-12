import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Navigation } from "@/components/layout/Navigation";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, Submission } from "@db/schema";

export default function AssignmentsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "title">("dueDate");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const handleSubmitAssignment = async (content: string) => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(`/api/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      setSelectedAssignment(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit assignment",
      });
    }
  };

  const filteredAssignments = assignments
    ?.filter((assignment) =>
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      assignment.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pt-16">
      <Navigation />
      <main className="container py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Assignments</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Customize how assignments are displayed
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as "dueDate" | "title")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments?.map((assignment) => {
            const hasSubmitted = submissions?.some(
              (sub) => sub.assignmentId === assignment.id
            );
            return (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={
                  user?.role === "student" && !hasSubmitted
                    ? () => setSelectedAssignment(assignment)
                    : undefined
                }
                onView={
                  user?.role === "teacher"
                    ? () => setSelectedAssignment(assignment)
                    : undefined
                }
              />
            );
          })}
        </div>

        {selectedAssignment && user?.role === "student" && (
          <Dialog open={true} onOpenChange={() => setSelectedAssignment(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Assignment</DialogTitle>
                <DialogDescription>
                  Submit your work for "{selectedAssignment.title}"
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSubmitAssignment(formData.get("content") as string);
                }}
                className="space-y-4"
              >
                <Textarea
                  name="content"
                  placeholder="Enter your submission..."
                  className="min-h-[200px]"
                  required
                />
                <Button type="submit">Submit Assignment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
