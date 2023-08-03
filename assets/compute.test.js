import { describe, expect, test, it } from "vitest";
import {
  getEarliestValidILRPeriod,
  projectRemainingILR,
  getCitizenshipConstrainedEarliestStartIndex,
  getEarliestCitizenshipPeriod,
  projectRemainingCitizenship,
} from "./compute";
import { isAbsentFactory } from "./computeHelper";

describe("#Check ILR absences", () => {
  it("returns 104 consecutive days remaining for indefinite leave to remain", () => {
    // 76 (days between 2024-May-21, 2024-Aug-04 INCLUSIVE) + 104 (projected remaining absences) = 180 constraint
    // Feb29 leaves from LHS
    const bnoStartIndex = new Date("2023-11-18").getTime();
    const isAbsent = isAbsentFactory(["2024-01-09", "2024-05-21"], ["2024-03-12", "2024-08-04"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2025-01-27").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(
      projectionIndex,
      earliestValidILRStartIndex,
      earliestValidILREndIndex,
      isAbsent
    );
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([
      104,
      "in bound",
    ]);
  });

  it("returns 99 consecutive days remaining for indefinite leave to remain", () => {
    // 81 (days between 2023-Jun-01, 2023-Aug-20 INCLUSIVE) + 99 (projected remaining absences) = 180 constraint
    // Feb29 enters from RHS
    const bnoStartIndex = new Date("2023-01-18").getTime();
    const isAbsent = isAbsentFactory(["2023-01-25", "2023-06-01"], ["2023-03-12", "2023-08-20"]);
    const [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
    const projectionIndex = new Date("2024-02-09").getTime();
    const ilrAbsencesRemaining = projectRemainingILR(
      projectionIndex,
      earliestValidILRStartIndex,
      earliestValidILREndIndex,
      isAbsent
    );
    expect(projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent)).toStrictEqual([
      99,
      "in bound",
    ]);
  });

});

