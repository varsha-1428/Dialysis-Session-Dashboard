import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Patient } from '../models/Patient';
import { Session } from '../models/Session';
import { AnomalyService } from '../services/anomalyService';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to Atlas for seeding...');

    // 1. Clear existing data
    await Patient.deleteMany({});
    await Session.deleteMany({});

    // 2. Create Patients
    const patients = await Patient.insertMany([
      { name: 'John Doe', mrn: 'MRN001', dryWeight: 70, dateOfBirth: new Date('1975-05-12') },
      { name: 'Jane Smith', mrn: 'MRN002', dryWeight: 60, dateOfBirth: new Date('1988-08-24') },
      { name: 'Robert Brown', mrn: 'MRN003', dryWeight: 85, dateOfBirth: new Date('1960-01-15') }
    ]);

    // 3. Create a historical session for Jane (to test Weight Gain anomaly later)
    // Jane's previous post-weight was 60kg (exactly her dry weight)
    const prevSessionJane = await Session.create({
      patientId: patients[1]._id,
      startTime: new Date(Date.now() - 86400000), // Yesterday
      endTime: new Date(Date.now() - 86400000 + 14400000), 
      preWeight: 62,
      postWeight: 60, 
      vitals: { systolicBP: 130, diastolicBP: 80, pulse: 72 },
      machineId: 'MAC-01'
    });

    // 4. Create Today's Sessions
    const today = new Date();

    const sessions = [
      // John: Normal Session
      {
        patientId: patients[0]._id,
        startTime: today,
        preWeight: 71.5,
        vitals: { systolicBP: 125, diastolicBP: 82, pulse: 70 },
        machineId: 'MAC-01',
        notes: 'Patient feeling well.'
      },
      // Jane: High Weight Gain (Pre-weight 64kg vs prev post 60kg = 4kg gain. 4/60 = 6.6% > 5%)
      {
        patientId: patients[1]._id,
        startTime: today,
        preWeight: 64, 
        vitals: { systolicBP: 135, diastolicBP: 85, pulse: 78 },
        machineId: 'MAC-02',
        notes: 'Reported eating salty foods over weekend.'
      },
      // Robert: High BP (160 SBP)
      {
        patientId: patients[2]._id,
        startTime: today,
        preWeight: 87,
        vitals: { systolicBP: 165, diastolicBP: 95, pulse: 88 },
        machineId: 'MAC-03'
      }
    ];

    // 5. Save sessions with computed anomalies
    for (const s of sessions) {
      const prevPostWeight = s.patientId === patients[1]._id ? 60 : undefined;
      const detectedAnomalies = AnomalyService.detect(s as any, 70, prevPostWeight);
      
      await Session.create({ ...s, anomalies: detectedAnomalies });
    }

    console.log('Database Seeded Successfully! 🌱');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();