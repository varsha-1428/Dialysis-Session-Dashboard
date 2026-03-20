import { CLINICAL_THRESHOLDS } from '../config/clinicalThresholds'
import { ISession } from '../models/Session';

export class AnomalyService {
  /**
   * Detects clinical anomalies in a dialysis session
   * @param currentSession The session being evaluated
   * @param dryWeight The patient's target weight
   * @param previousPostWeight The post-weight from the last completed session (for IDWG)
   */
  static detect(
    currentSession: Partial<ISession>, 
    dryWeight: number, 
    previousPostWeight?: number
  ): string[] {
    const anomalies: string[] = [];
    const { vitals, preWeight, postWeight, startTime, endTime } = currentSession;

    // 1. High Post-Dialysis Systolic BP
    if (vitals?.systolicBP && vitals.systolicBP >= CLINICAL_THRESHOLDS.MAX_POST_SYSTOLIC_BP) {
      anomalies.push(`High Post-Dialysis SBP: ${vitals.systolicBP} mmHg`);
    }

    // 2. Excess Interdialytic Weight Gain (IDWG)
    // Formula: (Current Pre-Weight - Previous Post-Weight) / Dry Weight
    if (preWeight && previousPostWeight && dryWeight) {
      const weightGain = preWeight - previousPostWeight;
      const gainPercentage = weightGain / dryWeight;

      if (gainPercentage >= CLINICAL_THRESHOLDS.IDWG_PERCENT_LIMIT) {
        const percentDisplay = (gainPercentage * 100).toFixed(1);
        anomalies.push(`Excessive IDWG: ${percentDisplay}% of dry weight`);
      }
    }

    // 3. Abnormal Session Duration
    if (startTime && endTime) {
      const durationMins = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const deviation = Math.abs(durationMins - CLINICAL_THRESHOLDS.TARGET_DURATION_MINS);

      if (deviation >= CLINICAL_THRESHOLDS.DURATION_DEVIATION_TOLERANCE) {
        anomalies.push(`Abnormal Duration: ${Math.round(durationMins)} mins`);
      }
    }

    return anomalies;
  }
}