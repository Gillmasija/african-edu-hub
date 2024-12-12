import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import type { Assignment } from "@db/schema";

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit?: () => void;
  onView?: () => void;
}

export function AssignmentCard({ assignment, onSubmit, onView }: AssignmentCardProps) {
  const dueIn = formatDistance(new Date(assignment.dueDate), new Date(), { addSuffix: true });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {assignment.description}
        </p>
        <p className="mt-4 text-sm font-medium">
          Due {dueIn}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onSubmit && (
          <Button onClick={onSubmit} className="flex-1">
            Submit
          </Button>
        )}
        {onView && (
          <Button onClick={onView} variant="outline" className="flex-1">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
