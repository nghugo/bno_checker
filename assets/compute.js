import { DAY, isFeb29, indexAdd5YearsMinus1Day, indexMinus1YearAdd1Day, indexMinus4YearsAdd1Day, indexAdd4Years } from "./computeHelper.js";

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// * all indices are taken as the millisecond count since the epoch  *
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

export function getEarliestValidILRPeriod(bnoStartIndex, isAbsent) {
  /** given a bno start date represented in millisecond index since the epoch,
      and also the days of absences using the closure isAbsent
      returns the earliest valid ILR qualifying period
      note, this makes user of the function isFeb29 as well */
  var candidateILRStartIndex = bnoStartIndex;
  var candidateILREndIndex = indexAdd5YearsMinus1Day(candidateILRStartIndex);

  function lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex) {
    var absentCount = 0;
    var yearWindowRightIndex = candidateILREndIndex;
    var yearWindowLeftIndex = indexMinus1YearAdd1Day(yearWindowRightIndex);
    // phase 1: grow window from right to left
    for (let i = yearWindowRightIndex; i >= yearWindowLeftIndex; i -= DAY) {
      if (isAbsent(i)) {
        absentCount += 1;
      }
      if (absentCount > 180) {
        return i + DAY;
      }
    }

    // phase 2: shift window from right to left, adjusting for Feb29
    while (yearWindowLeftIndex >= candidateILRStartIndex) {
      if (absentCount > 180) {
        return yearWindowLeftIndex + DAY;
      }

      // adjust for feb29
      if (isFeb29(yearWindowLeftIndex)) {
        yearWindowLeftIndex -= DAY;
        if (isAbsent(yearWindowLeftIndex)) {
          absentCount += 1;
        }
      }
      if (isFeb29(yearWindowRightIndex + DAY)) {
        yearWindowRightIndex -= DAY;
        if (isAbsent(yearWindowRightIndex + DAY)) {
          absentCount -= 1;
        }
      }

      // shift window by 1 unit
      yearWindowLeftIndex -= DAY;
      yearWindowRightIndex -= DAY;

      if (isAbsent(yearWindowLeftIndex)) {
        absentCount += 1;
      }
      if (isAbsent(yearWindowRightIndex + DAY)) {
        absentCount -= 1;
      }
    }

    // phase 3: if absentCount did not exceed 180, return null
    return null;
  }

  while (lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex) !== null) {
    candidateILRStartIndex = lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex);
    candidateILREndIndex = indexAdd5YearsMinus1Day(candidateILRStartIndex);
  }

  const earliestValidILRStartIndex = candidateILRStartIndex;
  const earliestValidILREndIndex = candidateILREndIndex;
  return [earliestValidILRStartIndex, earliestValidILREndIndex];
}

export function projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent) {
  /** returns the number of continuous absences available starting from the projection day without violating earliest ILR
      special case: if return -1, then projection is out of bounds to the left
      special case: if return -2, then projection is out of bounds to the right*/

  // case 1: projection is out of bounds (before start)
  if (projectionIndex < earliestValidILRStartIndex) {
    return [-1, "out of bounds"];
  }

  // case 2: projection is out of bounds (after end)
  if (projectionIndex > earliestValidILREndIndex) {
    return [-2, "out of bounds"];
  }

  // case 3: projection within bounds, so init remainingCount = 180 - absentCount
  // then shift window until remaining === 0 or yearWindowRightIndex === earliestValidILREndIndex
  // the number of continuous absences available is given by (yearWindowRightIndex - projectionIndex - DAY) / DAY

  // phase 1: get initial absentCount
  var absentCount = 0;
  for (let i = Math.max(indexMinus1YearAdd1Day(projectionIndex), earliestValidILRStartIndex); i <= projectionIndex - DAY; i += DAY) {
    if (isAbsent(i)) {
      absentCount += 1;
    }
  }
  var remainingCount = 180 - absentCount;

  // phase 2: shift window to the right, adjusting for Feb29
  var yearWindowLeftIndex = indexMinus1YearAdd1Day(projectionIndex);
  var yearWindowRightIndex = projectionIndex - DAY;
  while (remainingCount > 0) {
    //  && yearWindowRightIndex < earliestValidILREndIndex
    if (yearWindowLeftIndex >= earliestValidILRStartIndex && isAbsent(yearWindowLeftIndex)) {
      remainingCount = Math.min(1 + remainingCount, 180);
    }

    // adjust for Feb29 currently leaving from LHS (correct dates and +1 correct -> see test case 1, 2)
    if (isFeb29(yearWindowLeftIndex)) {
      yearWindowLeftIndex += DAY; // increment left window once here and once below
      if (yearWindowLeftIndex >= earliestValidILRStartIndex && isAbsent(yearWindowLeftIndex)) {
        remainingCount = Math.min(1 + remainingCount, 180);
      }
    }
    // adjust for Feb29 about to enter from the RHS (correct dates and -1 correct -> see test case 3, 4)
    if (isFeb29(yearWindowRightIndex + DAY)) {
      yearWindowLeftIndex -= DAY; // cancel out window increment below

      // amend: delete the following line of code, since it duplicates minus remaining
      // remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
    }

    // increment window
    yearWindowLeftIndex += DAY;
    yearWindowRightIndex += DAY;
    remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
  }

  const continuousAbsences = (yearWindowRightIndex - (projectionIndex - DAY)) / DAY;
  return [continuousAbsences, "in bound"];
}

export function getCitizenshipConstrainedEarliestStartIndex(ilrObtainedCheckboxChecked, ilrObtainedDateFieldIndex, earliestValidILREndIndex) {
  /** citizenship process is 5 years and must end at least 1 year after obtaining ILR
      ILR qualifying period is 5 years
      thus, earliest start date for citizenship qualifying period = backtrack 4 years from the point of obtaining ILR
      add 1 day to account for inclusive start and end (eg a 4 year period starting on 2024-Jun-28 ends on 2028-Jun-27) */
  if (ilrObtainedCheckboxChecked) {
    return indexMinus4YearsAdd1Day(ilrObtainedDateFieldIndex);
  }
  return indexMinus4YearsAdd1Day(earliestValidILREndIndex);
}

export function getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent) {
  /** shift window until 3 requirements are satisfied
      they are:
      1. absentCountFULL <= 450 
      2. absentCountRHS <= 90 
      3. !isAbsent(candidateL)
      then return the 2 window pointers (which indicate the earliest period one can qualify for british citizenship) */

  var candidateL = citizenshipConstrainedEarliestStartIndex; // candidateL is an inclusive left bound for FULL
  var candidateM = indexAdd4Years(citizenshipConstrainedEarliestStartIndex); // candidateM is an inclusive left bound for RHS
  var candidateR = indexAdd5YearsMinus1Day(citizenshipConstrainedEarliestStartIndex); // candidateR is an inclusive right bound for both FULL and RHS

  // the range {candidateL , ..., candidateR} inclusive belongs to FULL
  // the range {candidateM , ..., candidateR} inclusive belongs to RHS

  // initialize 2 windows
  var absentCountFULL = 0;
  for (let i = candidateL; i <= candidateR; i += DAY) {
    if (isAbsent(i)) {
      absentCountFULL++;
    }
  }
  var absentCountRHS = 0;
  for (let j = candidateM; j <= candidateR; j += DAY) {
    if (isAbsent(j)) {
      absentCountRHS++;
    }
  }

  // shift the 2 windows, and adjusting for Feb29, and make sure first day is NOT absent
  while (absentCountFULL > 450 || absentCountRHS > 90 || isAbsent(candidateL)) {
    if (isFeb29(candidateR + DAY)) {
      // add DAY -> a new Day entering from the right of window
      if (isAbsent(candidateR + DAY)) {
        // add DAY -> a new Day entering from the right of window
        absentCountFULL++;
        absentCountRHS++;
      }
      candidateR += DAY;
    }
    if (isAbsent(candidateR + DAY)) {
      // add DAY -> a new Day entering from the right of window
      absentCountFULL++;
      absentCountRHS++;
    }

    if (isFeb29(candidateL)) {
      // do not add DAY -> an old Day exiting from the left of window
      if (isAbsent(candidateL)) {
        // do not add DAY -> an old Day exiting from the left of window
        absentCountFULL--;
      }
      candidateL += DAY;
    }
    if (isAbsent(candidateL)) {
      // do not add DAY -> an old Day exiting from the left of window
      absentCountFULL--;
    }

    if (isFeb29(candidateM)) {
      // do not add DAY -> an old Day exiting from the left of window
      if (isAbsent(candidateM)) {
        // do not add DAY -> an old Day exiting from the left of window
        absentCountRHS--;
      }
      candidateM += DAY;
    }
    if (isAbsent(candidateM)) {
      // do not add DAY -> an old Day exiting from the left of window
      absentCountRHS--;
    }
    candidateL += DAY;
    candidateM += DAY;
    candidateR += DAY;
  }

  const earliestValidCitizenshipStartIndex = candidateL;
  const earliestValidCitizenshipMidIndex = candidateM;
  const earliestValidCitizenshipEndIndex = candidateR;

  return [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex];
}

export function projectRemainingCitizenship(projectionIndex, earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex, isAbsent) {
  // returns the number of absences available starting from the projection day without violating earliest Citizenship
  // special case: if return -1, then projection is out of bounds to the left
  // special case: if return -2, then projection is out of bounds to the right

  // case 1: projection is out of bounds (before start)
  if (projectionIndex < earliestValidCitizenshipStartIndex) {
    return [-1, -1, "out of bounds"];
  }

  // case 2: projection is out of bounds (after end)
  if (projectionIndex > earliestValidCitizenshipEndIndex) {
    return [-2, -2, "out of bounds"];
  }

  // case 3 projection within bounds, either:
  // -> A. only in FULL
  // -> B. in both FULL and RHS
  // hence, init remainingCountFULL = 450, and init remainingCountRHS = null (or 90)

  var remainingCountFULL = 450;

  for (
    let i = earliestValidCitizenshipStartIndex;
    i < projectionIndex; // do not count projection index
    i += DAY
  ) {
    if (isAbsent(i)) {
      remainingCountFULL--;
    }
  }

  var remainingCountRHS = null; // remainingCountRHS stays null if we do not enter the 'if' block below
  if (projectionIndex >= earliestValidCitizenshipMidIndex) {
    remainingCountRHS = 90;
    for (
      let i = earliestValidCitizenshipMidIndex;
      i < projectionIndex; // do not count projection index
      i += DAY
    ) {
      if (isAbsent(i)) {
        remainingCountRHS--;
      }
    }
    return [remainingCountFULL, remainingCountRHS, "in RHS bound"]; // case 3B
  }
  return [remainingCountFULL, remainingCountRHS, "in FULL bound"]; // case 3A
}
