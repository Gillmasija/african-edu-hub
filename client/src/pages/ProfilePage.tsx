import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { LogOut, User as UserIcon } from "lucide-react";
import type { Assignment, Submission } from "@db/schema";

export default function ProfilePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: assignments } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile"
      });
    }
  };

  const stats = {
    submissions: submissions?.length || 0,
    assignments: assignments?.length || 0,
    completionRate: submissions?.length && assignments?.length
      ? Math.round((submissions.length / assignments.length) * 100)
      : 0,
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pt-16">
      <Navigation />
      <div 
        className="relative h-48 bg-primary/10 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      <main className="container -mt-24 py-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-background">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-primary/10">
                    <UserIcon className="h-12 w-12 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    ) : (
                      <p className="text-lg font-medium">
                        {user?.fullName || user?.username}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <p className="capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {isEditing ? (
                    <Button onClick={handleSaveProfile}>Save Profile</Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader>
                <CardTitle className="text-lg text-primary">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.assignments}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader>
                <CardTitle className="text-lg text-primary">Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.submissions}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader>
                <CardTitle className="text-lg text-primary">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.completionRate}%</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions?.slice(0, 5).map((submission) => {
                  const assignment = assignments?.find(
                    (a) => a.id === submission.assignmentId
                  );
                  return (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{assignment?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDistance(new Date(submission.submittedAt), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      {submission.grade && (
                        <p className="text-lg font-bold">{submission.grade}%</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
