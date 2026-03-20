import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  patientId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  preWeight: number;
  postWeight?: number;
  vitals: {
    systolicBP: number;
    diastolicBP: number;
    pulse: number;
  };
  machineId: string;
  notes: string;
  anomalies: string[]; // Store detected issues like "High SBP"
}

const sessionSchema = new Schema<ISession>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    preWeight: {
      type: Number,
      required: [true, "Pre-dialysis weight is required"],
    },
    postWeight: {
      type: Number,
    },
    vitals: {
      systolicBP: { type: Number, required: true },
      diastolicBP: { type: Number, required: true },
      pulse: { type: Number, required: true },
    },
    machineId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    anomalies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for Status: Not Started / In Progress / Completed
sessionSchema.virtual("status").get(function () {
  if (!this.startTime) return "Not Started";
  if (this.startTime && !this.endTime) return "In Progress";
  return "Completed";
});

export const Session = model<ISession>("Session", sessionSchema);
