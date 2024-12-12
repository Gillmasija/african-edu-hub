import { useQuery } from "@tanstack/react-query";
import { AssignmentCard } from "../assignments/AssignmentCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import type { Assignment, Submission } from "@db/schema";

export function StudentDashboard() {
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  if (isLoadingAssignments || isLoadingSubmissions) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingAssignments = assignments?.filter(
    (assignment) => !submissions?.some((sub) => sub.assignmentId === assignment.id)
  ) || [];

  const completedAssignments = assignments?.filter(
    (assignment) => submissions?.some((sub) => sub.assignmentId === assignment.id)
  ) || [];

  const stats = {
    completed: completedAssignments.length,
    pending: pendingAssignments.length,
    total: assignments?.length || 0,
    completionRate: assignments?.length 
      ? Math.round((completedAssignments.length / assignments.length) * 100)
      : 0
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Completion Rate</CardTitle>
            <p className="text-sm text-muted-foreground">Your progress</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Pending</CardTitle>
            <p className="text-sm text-muted-foreground">Tasks to complete</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Completed</CardTitle>
            <p className="text-sm text-muted-foreground">Finished assignments</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-primary mb-4">Pending Assignments</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingAssignments.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <CardHeader>
                <CardTitle>All Caught Up!</CardTitle>
                <CardDescription>
                  You have completed all your assignments. Great work!
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            pendingAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={() => {
                  // Handle submit - Already implemented in AssignmentsPage
                }}
              />
            ))
          )}
        </div>
      </section>

      {completedAssignments.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {submissions
              ?.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .slice(0, 5)
              .map((submission) => {
                const assignment = assignments?.find(a => a.id === submission.assignmentId);
                return (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{assignment?.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDistance(new Date(submission.submittedAt), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                        {submission.grade && (
                          <div className="text-lg font-bold text-primary">
                            {submission.grade}%
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
