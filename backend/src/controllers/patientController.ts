import { Request, Response } from 'express';
import { Patient } from '../models/Patient';
import { Session } from '../models/Session';
import { AnomalyService } from '../services/anomalyService';

export const getTodaySchedule = async (req: Request, res: Response) => {
  try {
    // 1. Define "Today" boundaries (Midnight to Midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 2. Fetch all patients
    const patients = await Patient.find();

    // 3. Fetch all sessions that happened today
    const sessionsToday = await Session.find({
      startTime: { $gte: startOfToday, $lte: endOfToday }
    });

    // 4. Merge them so the frontend gets a list of Patients + their Today's Session (if any)
    const schedule = await Promise.all(
      patients.map(async (patient) => {
      const session = sessionsToday.find(s => s.patientId.toString() === patient._id.toString());
      let computedAnomalies: string[] = [];

      if (session) {
        const previousCompleted = await Session.findOne({
          patientId: patient._id,
          endTime: { $lt: startOfToday },
          postWeight: { $exists: true, $ne: null },
        }).sort({ endTime: -1 });

        const previousPostWeight = previousCompleted?.postWeight;
        computedAnomalies = AnomalyService.detect(session as any, patient.dryWeight, previousPostWeight);
      }
      
      return {
        patient,
        session: session
          ? { ...session.toObject(), anomalies: computedAnomalies }
          : null, // null means "Not Started"
        status: session ? (session.endTime ? 'Completed' : 'In Progress') : 'Not Started'
      };
    })
    );

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s schedule', error });
  }
};

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { name, mrn, dryWeight, dateOfBirth } = req.body;
    
    // Check if MRN already exists
    const existing = await Patient.findOne({ mrn });
    if (existing) return res.status(400).json({ message: "MRN already exists" });

    const newPatient = new Patient({ name, mrn, dryWeight, dateOfBirth });
    await newPatient.save();
    
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: "Error registering patient", error });
  }
};