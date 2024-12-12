import { useQuery } from "@tanstack/react-query";
import { AssignmentCard } from "../assignments/AssignmentCard";
import { AssignmentForm } from "../assignments/AssignmentForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { Assignment, Class, InsertAssignment } from "@db/schema";

export function TeacherDashboard() {
  const { toast } = useToast();
  const { user } = useUser();
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const handleCreateAssignment = async (data: InsertAssignment) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          teacherId: user?.id,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Create a notification for all students in the class
      await fetch("/api/notifications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: data.classId,
          message: `New assignment: ${data.title}`,
        }),
        credentials: "include",
      });

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assignment",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Total Assignments</CardTitle>
            <p className="text-sm text-muted-foreground">Active learning materials</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{assignments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Pending Submissions</CardTitle>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Average Score</CardTitle>
            <p className="text-sm text-muted-foreground">Class performance</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">N/A</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Your Assignments</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new learning assignment for your students.
              </DialogDescription>
            </DialogHeader>
            <AssignmentForm onSubmit={handleCreateAssignment} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-[200px] animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : assignments.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <CardHeader>
              <CardTitle>No Assignments Yet</CardTitle>
              <CardDescription>
                Start by creating your first assignment using the button above.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onView={() => {
                // Handle view submissions
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
