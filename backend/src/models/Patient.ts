import { Schema, model, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  mrn: string;
  dryWeight: number;
  dateOfBirth: Date;
  createdAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: { 
      type: String, 
      required: [true, 'Patient name is required'], 
      trim: true 
    },
    mrn: { 
      type: String, 
      required: [true, 'MRN is required'], 
      unique: true, 
      trim: true 
    },
    dryWeight: { 
      type: Number, 
      required: [true, 'Dry weight is required'],
      min: [20, 'Dry weight must be at least 20kg'] 
    },
    dateOfBirth: { 
      type: Date, 
      required: [true, 'Date of birth is required'] 
    },
  },
  { timestamps: true }
);

export const Patient = model<IPatient>('Patient', patientSchema);