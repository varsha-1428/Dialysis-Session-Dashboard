import { Request, Response } from "express";
import mongoose from "mongoose";
import { Patient } from "../models/Patient";
import { Session } from "../models/Session";
import { AnomalyService } from "../services/anomalyService";

function assertFiniteNumber(value: unknown, fieldName: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for ${fieldName}`);
  }
}

function toDate(value: unknown): Date {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid datetime value");
  }
  return d;
}

export const startSession = async (req: Request, res: Response) => {
  try {
    const { patientId, preWeight, machineId, startTime } = req.body as {
      patientId?: string;
      preWeight?: number;
      machineId?: string;
      startTime?: string;
    };

    if (!patientId || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ message: "patientId is required" });
    }

    assertFiniteNumber(preWeight, "preWeight");

    if (!machineId || typeof machineId !== "string" || !machineId.trim()) {
      return res.status(400).json({ message: "machineId is required" });
    }

    const start = startTime ? toDate(startTime) : new Date();

    // One session per patient per day (keyed by startTime date).
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Session.findOne({
      patientId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existing) {
      return res.status(400).json({ message: "Session already exists for this patient and day" });
    }

    const session = await Session.create({
      patientId,
      startTime: start,
      preWeight,
      machineId: machineId.trim(),
      notes: "",
    });

    res.status(201).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error starting session";
    res.status(400).json({ message });
  }
};

export const completeSession = async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      endTime,
      postWeight,
      vitals,
      notes,
      machineId,
    } = req.body as {
      sessionId?: string;
      endTime?: string;
      postWeight?: number;
      vitals?: { systolicBP?: number; diastolicBP?: number; pulse?: number };
      notes?: string;
      machineId?: string;
    };

    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.endTime) {
      return res.status(400).json({ message: "Session is already completed" });
    }

    assertFiniteNumber(postWeight, "postWeight");

    const completedAt = endTime ? toDate(endTime) : new Date();
    if (completedAt.getTime() < session.startTime.getTime()) {
      return res.status(400).json({ message: "endTime must be after startTime" });
    }

    const systolic = vitals?.systolicBP;
    const diastolic = vitals?.diastolicBP;
    if (typeof systolic !== "number" || !Number.isFinite(systolic)) {
      return res.status(400).json({ message: "Invalid numeric value for systolicBP" });
    }
    if (typeof diastolic !== "number" || !Number.isFinite(diastolic)) {
      return res.status(400).json({ message: "Invalid numeric value for diastolicBP" });
    }

    const pulseVal = vitals?.pulse;
    if (pulseVal !== undefined && (typeof pulseVal !== "number" || !Number.isFinite(pulseVal))) {
      return res.status(400).json({ message: "Invalid numeric value for pulse" });
    }

    const patient = await Patient.findById(session.patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Previous completed session for IDWG (endTime strictly before today's start boundary).
    const startOfDay = new Date(session.startTime);
    startOfDay.setHours(0, 0, 0, 0);

    const previousCompleted = await Session.findOne({
      patientId: session.patientId,
      endTime: { $lt: startOfDay },
      postWeight: { $exists: true, $ne: null },
    }).sort({ endTime: -1 });

    const previousPostWeight = previousCompleted?.postWeight;

    const anomalies = AnomalyService.detect(
      {
        ...session.toObject(),
        endTime: completedAt,
        postWeight,
        vitals: {
          systolicBP: systolic,
          diastolicBP: diastolic,
          pulse: pulseVal,
        },
      },
      patient.dryWeight,
      previousPostWeight
    );

    session.endTime = completedAt;
    session.postWeight = postWeight;
    session.vitals = {
      systolicBP: systolic,
      diastolicBP: diastolic,
      pulse: pulseVal,
    };
    session.notes = typeof notes === "string" ? notes : session.notes;
    if (machineId && typeof machineId === "string") {
      session.machineId = machineId.trim();
    }
    session.anomalies = anomalies;

    await session.save();
    res.status(200).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error completing session";
    res.status(400).json({ message });
  }
};

export const updateSessionNotes = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const { notes } = req.body as { notes?: string };
    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({ message: "notes must be a string" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.notes = notes ?? session.notes;
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error updating notes";
    res.status(400).json({ message });
  }
};

