# Dialysis-Session-Dashboard
A clinical workflow application aimed at improving the reliability and efficiency of dialysis session tracking, helping healthcare staff identify potential patient risks early and make more informed decisions during treatment.

## 🦉Assumptions & Decisions

| # | Area                | Ambiguity                                                                 | Decision                                                                                     |
|---|---------------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| 1 | Today’s Schedule    | Whether schedule is pre-existing or created on the same day               | Treated as sessions created for the current date                                             |
| 2 | Session Status      | Whether status is stored or derived                                       | Derived from timestamps (`startTime`, `endTime`)                                             |
| 3 | IDWG Calculation    | What if previous session data is missing                                  | Not evaluated if previous post-weight is unavailable                                         |
| 4 | End-of-Day Handling | Whether incomplete sessions carry forward to the next day                 | Each day is independent; no automatic carry-over                                             |

## 🦉Anomaly Detection Criteria
- Excess Interdialytic Weight Gain (IDWG)

  Threshold:
  IDWG ≥ 5% of dry body weight
  
  Justification:
  Clinical guidelines recommend maintaining IDWG below 4–4.5%. Observational evidence indicates an increased risk of cardiovascular complications and mortality beyond approximately 5%, making this a practical threshold to flag excessive fluid gain.

- High Post-Dialysis Systolic Blood Pressure (SBP)

  Threshold:
  Post-dialysis SBP ≥ 150 mmHg
  
  Justification:
  Clinical guidelines suggest optimal outcomes within the 120–139 mmHg range. Observational evidence shows increased cardiovascular risk above this range, making 150 mmHg a practical cutoff to identify patients outside the optimal range.

- Abnormal Dialysis Session Duration

  Threshold:
  Session duration deviating significantly (e.g., ≥ 30 minutes) from the prescribed target duration
  
  Justification:
  Clinical practice typically targets dialysis sessions of approximately 3.5–4 hours. Observational evidence indicates that shorter-than-target sessions (especially < 240 minutes) are associated with increased mortality and inadequate toxin clearance. While longer sessions may improve clearance, optimal durations beyond standard targets are not well established. A deviation threshold (e.g., ≥ 30 minutes) serves as a practical criterion to flag sessions that may indicate suboptimal dialysis delivery.
