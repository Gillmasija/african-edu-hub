import { type Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { assignments, notifications, submissions } from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express) {
  setupAuth(app);
  const httpServer = createServer(app);

  // Assignments
  // Classes
  app.post("/api/classes", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "teacher") {
      return res.status(403).send("Not authorized");
    }

    const { name, description } = req.body;
    const [newClass] = await db
      .insert(classes)
      .values({
        name,
        description,
        teacherId: req.user!.id,
      })
      .returning();

    res.json(newClass);
  });

  app.get("/api/classes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const user = req.user!;
    if (user.role === "teacher") {
      const results = await db
        .select()
        .from(classes)
        .where(eq(classes.teacherId, user.id));
      return res.json(results);
    } else {
      const results = await db
        .select({
          class: classes,
        })
        .from(studentClasses)
        .innerJoin(classes, eq(studentClasses.classId, classes.id))
        .where(eq(studentClasses.studentId, user.id));
      return res.json(results.map(r => r.class));
    }
  });

  app.post("/api/classes/:id/enroll", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "student") {
      return res.status(403).send("Not authorized");
    }

    const classId = parseInt(req.params.id);
    const [enrollment] = await db
      .insert(studentClasses)
      .values({
        studentId: req.user!.id,
        classId,
      })
      .returning();

    res.json(enrollment);
  });

  app.get("/api/assignments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const user = req.user!;
    let query = db.select().from(assignments);

    if (user.role === "student") {
      // Students see all assignments
      const results = await query;
      return res.json(results);
    } else {
      // Teachers see only their assignments
      const results = await query.where(eq(assignments.teacherId, user.id));
      return res.json(results);
    }
  });

  app.post("/api/assignments", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "teacher") {
      return res.status(403).send("Not authorized");
    }

    const { title, description, dueDate, classId, scheduledFor } = req.body;

    // Verify that the teacher owns this class
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.id, classId),
        eq(classes.teacherId, req.user!.id)
      ))
      .limit(1);

    if (!classRecord) {
      return res.status(403).send("You can only create assignments for your own classes");
    }

    const [assignment] = await db
      .insert(assignments)
      .values({
        title,
        description,
        dueDate: new Date(dueDate),
        classId,
        teacherId: req.user!.id,
        createdAt: scheduledFor ? new Date(scheduledFor) : new Date(),
      })
      .returning();

    // Notify all students in the class
    const students = await db
      .select({
        studentId: studentClasses.studentId
      })
      .from(studentClasses)
      .where(eq(studentClasses.classId, classId));

    // Create notifications for each student
    if (students.length > 0) {
      await db.insert(notifications).values(
        students.map(s => ({
          userId: s.studentId,
          message: `New assignment "${title}" has been posted in your class`,
        }))
      );
    }

    res.json(assignment);
  });

  // Submissions
  app.post("/api/assignments/:id/submit", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "student") {
      return res.status(403).send("Not authorized");
    }

    const assignmentId = parseInt(req.params.id);
    const { content } = req.body;

    const [submission] = await db
      .insert(submissions)
      .values({
        assignmentId,
        studentId: req.user!.id,
        content,
      })
      .returning();

    res.json(submission);
  });

  app.get("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const user = req.user!;
    if (user.role === "student") {
      const results = await db
        .select()
        .from(submissions)
        .where(eq(submissions.studentId, user.id));
      return res.json(results);
    } else {
      const results = await db
        .select()
        .from(submissions)
        .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .where(eq(assignments.teacherId, user.id));
      return res.json(results);
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(notifications.createdAt);

    res.json(results);
  });

  app.post("/api/notifications/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { id } = req.body;
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, req.user!.id)
        )
      );

    res.json({ success: true });
  });

  return httpServer;
}
