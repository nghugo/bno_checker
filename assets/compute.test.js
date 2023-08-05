import { describe, expect, test, it } from "vitest";
import {
  getEarliestValidILRPeriod,
  projectRemainingILR,
  getCitizenshipConstrainedEarliestStartIndex,
  getEarliestCitizenshipPeriod,
  projectRemainingCitizenship,
} from "./compute";
import { isAbsentFactory } from "./computeHelper";

describe("#Check ILR absence projection", () => {
  // Recall that the objective is to find the longest consecutive absence possible starting from projection date,
  // but without breaking the 180 day limit and thus invalidating the ILR qualifying period.
  // This means exactly using up the 180 day limit

  it("returns 104 consecutive days remaining for indefinite leave to remain", () => {
    // 76 (days between 2024-May-21, 2024-Aug-04 INCLUSIVE) + 104 (projected remaining absences) = 180 constraint
    // Feb29 leaves from LHS
    const bnoStartIndex = new Date("2023-11-18").getTime();
    const isAbsent = isAbsentFactory(["2024-01-09", "2024-05-21"], ["2024-03-12", "2024-08-04"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2025-01-27").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent);
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([104, "in bound"]);
  });

  it("returns 100 consecutive days remaining for indefinite leave to remain", () => {
    // 80 (81 days between 2023-Jun-01, 2023-Aug-20 INCLUSIVE - 29Feb of 2024) + 100 (projected remaining absences) = 180 constraint
    // Feb29 enters from RHS
    const bnoStartIndex = new Date("2023-01-18").getTime();
    const isAbsent = isAbsentFactory(["2023-01-25", "2023-06-01"], ["2023-03-12", "2023-08-20"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2024-02-09").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent);
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([100, "in bound"]);
  });

  it("returns 56 consecutive days remaining for indefinite leave to remain", () => {
    //   46 (days between 2023-Nov-13, 2023-Dec-28 INCLUSIVE)
    // + 78 (days between 2024-Jan-23, 2024-Apr-09 INCLUSIVE)
    // + 56 (projected remaining absences) = 180 constraint
    // 2 periods of absences
    const bnoStartIndex = new Date("2020-11-18").getTime();
    const isAbsent = isAbsentFactory(["2023-11-13", "2024-01-23"], ["2023-12-28", "2024-04-09"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2024-05-27").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent);
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([56, "in bound"]);
  });
});

describe("#Check citizenship 90 day absence projection", () => {
  //   Check against the number of remaining absences remaining (90) for the citizenship qualifying period

  const isAbsent = isAbsentFactory(["2028-02-15"], ["2028-05-14"]); // 90 day absence
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(
    citizenshipConstrainedEarliestStartIndex,
    isAbsent
  );

  it("returns 89 days of absence remaining", () => {
    // 89 days after 15 February 2028 = 14 May 2028 (ie total 90 days)
    projectionIndex = new Date("2028-02-16").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([449, 89, "in RHS bound"]);
  });

  it("returns 90 days of absence remaining", () => {
    projectionIndex = new Date("2028-02-15").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([450, 90, "in RHS bound"]);
  });

  it("returns 1 day of absence remaining", () => {
    projectionIndex = new Date("2028-05-14").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([361, 1, "in RHS bound"]);
  });
});

describe("#Check citizenship 450 day absence projection", () => {
  // Check against the number of remaining absences remaining (450) for the citizenship qualifying period
  // 449 days after 2028-02-15 = 9 May 2029 (ie total 450 days)
  // Earliest start on 9 feb 2025 (4 years + 89 days before 2029-05-09)
  const isAbsent = isAbsentFactory(["2028-02-15"], ["2029-05-09"]); // 450 day absence
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(
    citizenshipConstrainedEarliestStartIndex,
    isAbsent
  );

  it("returns 90 days of absence remaining", () => {
    projectionIndex = new Date("2029-02-09").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([90, 90, "in RHS bound"]);
  });

  it("returns 1 day of absence remaining", () => {
    projectionIndex = new Date("2029-05-09").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([1, 1, "in RHS bound"]);
  });
});

describe("#Check citizenship 451 day absence projection", () => {
  // Check against the number of remaining absences remaining (451) for the citizenship qualifying period
  // 450 days after 2028-02-15 = 10 May 2029 (ie total 451 days)
  // Earliest start on 9 feb 2025 (4 years + 90 days before 2029-05-10)
  const isAbsent = isAbsentFactory(["2028-02-15"], ["2029-05-10"]); // 451 day absence
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(
    citizenshipConstrainedEarliestStartIndex,
    isAbsent
  );

  it("returns out of bounds to the left", () => {
    projectionIndex = new Date("2029-05-10").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([-1, -1, "out of bounds"]);
  });

  it("returns 450 days of absence remaining", () => {
    projectionIndex = new Date("2029-05-11").getTime();
    expect(
      projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      )
    ).toStrictEqual([450, null, "in FULL bound"]);
  });
});