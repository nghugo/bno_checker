import { describe, expect, it } from "vitest";
import { getEarliestValidILRPeriod, projectRemainingILR, getEarliestCitizenshipPeriod, projectRemainingCitizenship } from "./compute";
import { isAbsentFactory } from "./computeHelper";

describe("#Check earliest valid ILR period", () => {
  
  it("returns [2020-11-18, 2025-11-17] (no absences)", () => {
    // no absences
    const bnoStartIndex = new Date("2020-11-18").getTime();
    const isAbsent = isAbsentFactory([], []);
    expect(getEarliestValidILRPeriod(bnoStartIndex, isAbsent)).toStrictEqual([new Date("2020-11-18").getTime(), new Date("2025-11-17").getTime()]);
  });

  it("returns [2020-11-18, 2025-11-17] (180 days absent)", () => {
    // 180 days between 2023-Nov-13, 2024-May-10 INCLUSIVE
    const bnoStartIndex = new Date("2020-11-18").getTime();
    const isAbsent = isAbsentFactory(["2023-11-13"], ["2024-05-10"]);
    expect(getEarliestValidILRPeriod(bnoStartIndex, isAbsent)).toStrictEqual([new Date("2020-11-18").getTime(), new Date("2025-11-17").getTime()]);
  });

  it("returns [2023-11-14, 2028-11-13] (181 days absent)", () => {
    // 181 days between 2023-Nov-13, 2024-May-11 INCLUSIVE
    const bnoStartIndex = new Date("2020-11-18").getTime();
    const isAbsent = isAbsentFactory(["2023-11-13"], ["2024-05-11"]);
    expect(getEarliestValidILRPeriod(bnoStartIndex, isAbsent)).toStrictEqual([new Date("2023-11-14").getTime(), new Date("2028-11-13").getTime()]);
  });

});

describe("#Check ILR absence projection", () => {
  /** Recall that the objective is to find the longest consecutive absence possible starting from projection date,
      but without breaking the 180 day limit and thus invalidating the ILR qualifying period.
      This means exactly using up the 180 day limit */

  it("returns 104 consecutive days remaining for indefinite leave to remain", () => {
    /** 76 (days between 2024-May-21, 2024-Aug-04 INCLUSIVE) 
        + 104 (projected remaining absences) = 180 constraint
        Feb29 leaves from LHS */
    const bnoStartIndex = new Date("2023-11-18").getTime();
    const isAbsent = isAbsentFactory(["2024-01-09", "2024-05-21"], ["2024-03-12", "2024-08-04"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2025-01-27").getTime();
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([104, "in bound"]);
  });

  it("returns 100 consecutive days remaining for indefinite leave to remain", () => {
    /** 80 (81 days between 2023-Jun-01, 2023-Aug-20 INCLUSIVE - 29Feb of 2024) 
        + 100 (projected remaining absences) = 180 constraint
        Feb29 enters from RHS */
    const bnoStartIndex = new Date("2023-01-18").getTime();
    const isAbsent = isAbsentFactory(["2023-01-25", "2023-06-01"], ["2023-03-12", "2023-08-20"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2024-02-09").getTime();
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([100, "in bound"]);
  });

  it("returns 56 consecutive days remaining for indefinite leave to remain", () => {
    /** 46 (days between 2023-Nov-13, 2023-Dec-28 INCLUSIVE)
        + 78 (days between 2024-Jan-23, 2024-Apr-09 INCLUSIVE)
        + 56 (projected remaining absences) = 180 constraint
        2 periods of absences */

    const bnoStartIndex = new Date("2020-11-18").getTime();
    const isAbsent = isAbsentFactory(["2023-11-13", "2024-01-23"], ["2023-12-28", "2024-04-09"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2024-05-27").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent);
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([56, "in bound"]);
  });
});

describe("#Check earliest valid citizensip period", () => {
  
  it("returns [2024-02-01, 2028-02-01, 2029-01-31] (450 days absent first 4 years)", () => {
    // 450 days between 2024-Feb-15, 2025-May-09 INCLUSIVE
    const isAbsent = isAbsentFactory(["2024-02-15"], ["2025-05-09"]); // 450 days absent
    const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
    expect(getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent)).toStrictEqual(
      [new Date("2024-02-01").getTime(), new Date("2028-02-01").getTime(), new Date("2029-01-31").getTime()]
    );
  });

  it("returns [2025-05-11, 2029-05-11, 2030-05-10] (451 days absent first 4 years)", () => {
    /** 451 days between 2024-Feb-15, 2025-May-09 INCLUSIVE 
        But cannot be absent on the first day for citizenship
    */
    const isAbsent = isAbsentFactory(["2024-02-15"], ["2025-05-10"]); // 451 days absent
    const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
    expect(getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent)).toStrictEqual(
      [new Date("2025-05-11").getTime(), new Date("2029-05-11").getTime(), new Date("2030-05-10").getTime()]
    );
  });

  it("returns [2024-02-01, 2028-02-01, 2029-01-31] (90 days absent in the last year)", () => {
    // 90 days between 2028-Feb-15, 2028-May-14 INCLUSIVE 
    const isAbsent = isAbsentFactory(["2028-02-15"], ["2028-05-14"]); // 90 days absent
    const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
    expect(getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent)).toStrictEqual(
      [new Date("2024-02-01").getTime(), new Date("2028-02-01").getTime(), new Date("2029-01-31").getTime()]
    );
  });

  it("returns [2024-02-16, 2028-02-16, 2029-02-15] (91 days absent in the last year)", () => {
    // 91 days between 2028-Feb-15, 2028-May-15 INCLUSIVE 
    const isAbsent = isAbsentFactory(["2028-02-15"], ["2028-05-15"]); // 91 days absent
    const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
    expect(getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent)).toStrictEqual(
      [new Date("2024-02-16").getTime(), new Date("2028-02-16").getTime(), new Date("2029-02-15").getTime()]
    );
  });
});

describe("#Check citizenship projection (450 days absent in first 4 years)", () => {
  /** Check against the number of remaining absences remaining (450) for the citizenship qualifying period
      449 days after 2028-02-15 = 9 May 2029 (ie total 450 days)
      Earliest start on 9 feb 2025 (4 years + 89 days before 2029-05-09) */
  const isAbsent = isAbsentFactory(["2028-02-15"], ["2029-05-09"]); // 450 days absent
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent);

  it("returns 90 days of absence remaining", () => {
    projectionIndex = new Date("2029-02-09").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([90, 90, "in RHS bound"]);
  });

  it("returns 1 day of absence remaining", () => {
    projectionIndex = new Date("2029-05-09").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([1, 1, "in RHS bound"]);
  });
});

describe("#Check citizenship projection (451 days absent)", () => {
  /** Check against the number of remaining absences remaining (451) for the citizenship qualifying period
      Earliest start on 11 May 2029 (first non-absent day) */
  const isAbsent = isAbsentFactory(["2028-02-15"], ["2029-05-10"]); // 451 days absent
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent);

  it("returns out of bounds to the left", () => {
    projectionIndex = new Date("2029-05-10").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([-1, -1, "out of bounds"]);
  });

  it("returns 450 days of absence remaining", () => {
    projectionIndex = new Date("2029-05-11").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([450, null, "in FULL bound"]);
  });
});

describe("#Check citizenship projection (90 days absent in the last year)", () => {
  //  Check against the number of remaining absences remaining (90) for the citizenship qualifying period

  const isAbsent = isAbsentFactory(["2028-02-15"], ["2028-05-14"]); // 90 days absent
  var projectionIndex;
  const citizenshipConstrainedEarliestStartIndex = new Date("2024-02-01").getTime();
  const [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent);

  it("returns 89 days of absence remaining", () => {
    // 89 days after 15 February 2028 = 14 May 2028 (ie total 90 days)
    projectionIndex = new Date("2028-02-16").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([449, 89, "in RHS bound"]);
  });

  it("returns 90 days of absence remaining", () => {
    projectionIndex = new Date("2028-02-15").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([450, 90, "in RHS bound"]);
  });

  it("returns 1 day of absence remaining", () => {
    projectionIndex = new Date("2028-05-14").getTime();
    expect(projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent)).toStrictEqual([361, 1, "in RHS bound"]);
  });
});