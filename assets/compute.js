// **** **** **** **** **** **** **** **** **** **** **** **** ****
// test input
// const absentStartCollectionValues = ["2023-08-01", "2023-11-01"];
// const absentEndCollectionValues = ["2023-08-31", "2024-11-30"];
// const bnoStartValue = "2023-07-01";
// const bnoStartIndex = new Date(bnoStartValue).getTime();

// Recall that the objective is to find the longest consecutive absence possible starting from projection date
// but without breaking the 180 day limit and thus invalidating the ILR qualification period
// this means exactly using up the 180 day limit

// // Feb29 leaves from LHS (test case 1) for ilr  (75+1) + 104 = 180
// // output remaining = 104
// // days between 2024 may 21 to 2024 aug 04 INCLUSIVE = (75+1) = 76 days
// const absentStartCollectionValues = ["2024-01-09", "2024-05-21"];
// const absentEndCollectionValues = ["2024-03-12", "2024-08-04"];
// const bnoStartValue = "2023-11-18";
// const projectionValue = "2025-01-27";

// // Feb29 leaves from LHS (test case 2) for ilr
// // 180 exactly, since the quota of absent days last year are recovered when they exit the LHS of window
// const absentStartCollectionValues = ["2024-01-09"];
// const absentEndCollectionValues = ["2024-03-12"];
// const bnoStartValue = "2023-11-18";
// const projectionValue = "2025-01-27";

// // Feb29 enters from RHS (test case 3) for ilr  (85+1) + 94 = 180
// days between 2023 may 1 and 2023 july 25 INCLUSIVE = 85+1 = 86 days
// output remaining = 94
// const absentStartCollectionValues = ["2023-01-09", "2023-05-01"];
// const absentEndCollectionValues = ["2023-04-12", "2023-07-25"];
// const bnoStartValue = "2020-11-18";
// const projectionValue = "2024-01-27";

// // Feb29 enters from RHS (test case 4) for ilr  (80+1) + 99 = 180
// days between 2023 june 01 and 2023 aug 20 INCLUSIVE = (80+1) = 81 days
// output remaining = 99
// const absentStartCollectionValues = ["2023-01-25", "2023-06-01"];
// const absentEndCollectionValues = ["2023-03-12", "2023-08-20"];
// const bnoStartValue = "2023-01-18";
// const projectionValue = "2024-02-09";

// // no Feb29, but 2 holidays (test case 5) for ilr
// // 81 + 47 + 52 = 180
// // days between 2021-06-01 and 2021-08-20 INCLUSIVE = 80+1
// // days between 2022-01-25 and 2022-03-12 = 46+1
// // output remaining = 52
// const absentStartCollectionValues = ["2021-06-01", "2022-01-25"];
// const absentEndCollectionValues = ["2021-08-20", "2022-03-12"];
// const bnoStartValue = "2021-01-18";
// const projectionValue = "2022-04-05";

// 78 + 46 + 56 = 180 (test case 6) for ilr
// days between 2023-11-13 and 2023-12-28 INCLUSIVE = 45+1
// days between 2024-01-23 and 2024-04-09 = 77+1
// output remaining = 56
// const absentStartCollectionValues = ["2023-11-13", "2024-01-23"];
// const absentEndCollectionValues = ["2023-12-28", "2024-04-09"];
// const bnoStartValue = "2020-11-18";
// const projectionValue = "2024-05-27";

// // test case 7 for citizenship
// const absentStartCollectionValues = ["2023-01-20"];
// const absentEndCollectionValues = ["2024-04-16"];
// const bnoStartValue = "2020-01-18";
// const projectionValue = "2024-04-17";

// const constrainedStartDateMockValue = "2020-01-18";
// const constrainedStartIndex = new Date(constrainedStartDateMockValue).getTime();

// const bnoStartIndex = new Date(bnoStartValue).getTime();
// const projectionIndex = new Date(projectionValue).getTime();
// console.log(
//   `projectionIndex            is ${projectionIndex} ie ${new Date(
//     projectionIndex
//   )}`
// );

// const isAbsent = isAbsentFactory(
//   absentStartCollectionValues,
//   absentEndCollectionValues
// );

// **** **** **** **** **** **** **** **** **** **** **** **** ****

// all indices are taken as the millisecond count since the epoch

import {
  DAY,
  isFeb29,
  isAbsentFactory,
  indexAdd5Years,
  indexMinus5Years,
  indexMinus1Year,
} from "./computeHelper.js";

export function earliestValidILRPeriod(bnoStartIndex, isAbsent) {
  // given a bno start date represented in millisecond index since the epoch,
  // and also the days of absences using the closure isAbsent
  // returns the earliest valid ILR qualification period
  // note, this makes user of the function isFeb29 as well
  var candidateILRStartIndex = bnoStartIndex;
  var candidateILREndIndex = indexAdd5Years(candidateILRStartIndex);

  function lastInvalidILRStartPointInPeriod(
    candidateILRStartIndex,
    candidateILREndIndex
  ) {
    var absentCount = 0;
    var yearWindowRightIndex = candidateILREndIndex;
    var yearWindowLeftIndex = indexMinus1Year(yearWindowRightIndex);
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

  while (
    lastInvalidILRStartPointInPeriod(
      candidateILRStartIndex,
      candidateILREndIndex
    ) !== null
  ) {
    candidateILRStartIndex = lastInvalidILRStartPointInPeriod(
      candidateILRStartIndex,
      candidateILREndIndex
    );
    candidateILREndIndex = indexAdd5Years(candidateILRStartIndex);
  }

  const earliestValidILRStartIndex = candidateILRStartIndex;
  const earliestValidILREndIndex = candidateILREndIndex;
  return [earliestValidILRStartIndex, earliestValidILREndIndex];
}

export function projectRemainingILR(
  projectionIndex,
  earliestValidILRStartIndex,
  earliestValidILREndIndex,
  isAbsent,
) {
  // returns the number of continuous absences available starting from the projection day without violating earliest ILR
  // special case: if return -1, then projection is out of bounds to the left
  // special case: if return -2, then projection is out of bounds to the right

  // case 1: projection is out of bounds (before start)
  if (projectionIndex < earliestValidILRStartIndex) {
    return -1;
  }

  // case 2: projection is out of bounds (after end)
  if (projectionIndex > earliestValidILREndIndex) {
    return -2;
  }

  // case 3: projection within bounds, so init remainingCount = 180 - absentCount
  // then shift window until remaining === 0 or yearWindowRightIndex === earliestValidILREndIndex
  // the number of continuous absences available is given by (yearWindowRightIndex - projectionIndex - DAY) / DAY

  // phase 1: get initial absentCount
  var absentCount = 0;
  // console.log(Math.max(indexMinus1Year(projectionIndex), earliestValidILRStartIndex))
  // console.log(projectionIndex - DAY)
  // console.log(indexMinus1Year(projectionIndex))
  // console.log(earliestValidILRStartIndex)
  for (
    let i = Math.max(
      indexMinus1Year(projectionIndex),
      earliestValidILRStartIndex
    );
    i <= projectionIndex - DAY;
    i += DAY
  ) {
    if (isAbsent(i)) {
      absentCount += 1;
    }
  }
  var remainingCount = 180 - absentCount;
  // console.log(`initial remainingCount is ${remainingCount}`)

  // phase 2: shift window to the right, adjusting for Feb29
  var yearWindowLeftIndex = indexMinus1Year(projectionIndex);
  var yearWindowRightIndex = projectionIndex - DAY;
  while (remainingCount > 0) {
    //  && yearWindowRightIndex < earliestValidILREndIndex
    if (
      yearWindowLeftIndex >= earliestValidILRStartIndex &&
      isAbsent(yearWindowLeftIndex)
    ) {
      remainingCount = Math.min(1 + remainingCount, 180);
    }

    // adjust for Feb29 currently leaving from LHS (correct dates and +1 correct -> see test case 1, 2)
    if (isFeb29(yearWindowLeftIndex)) {
      yearWindowLeftIndex += DAY; // increment left window once here and once below
      if (
        yearWindowLeftIndex >= earliestValidILRStartIndex &&
        isAbsent(yearWindowLeftIndex)
      ) {
        remainingCount = Math.min(1 + remainingCount, 180);
      }
    }
    // adjust for Feb29 about to enter from the RHS (correct dates and -1 correct -> see test case 3, 4)
    if (isFeb29(yearWindowRightIndex + DAY)) {
      yearWindowLeftIndex -= DAY; // cancel out window increment below
      remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
    }

    // console.log(`left ${new Date(yearWindowLeftIndex)} right ${new Date(yearWindowRightIndex + DAY)}, ${(yearWindowRightIndex - (projectionIndex - DAY)) / DAY}, ${remainingCount}`)

    // increment window
    yearWindowLeftIndex += DAY;
    yearWindowRightIndex += DAY;
    remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
  }

  return (yearWindowRightIndex - (projectionIndex - DAY)) / DAY;
}

export function earliestCitizenshipPeriod(constrainedStartIndex, isAbsent) {
  var candidateL = constrainedStartIndex;
  var candidateR = indexAdd5Years(constrainedStartIndex);

  var absentCount = 0;
  for (let i = candidateL; i <= candidateR; i += DAY) {
    if (isAbsent(i)) {
      absentCount++;
    }
  }
  // console.log("*********************")
  // console.log(new Date(candidateL), new Date(candidateR), absentCount)
  while (absentCount > 450) {
    if (isFeb29(candidateR + DAY)) {
      if (isAbsent(candidateR + DAY)) {
        absentCount++;
      }
      candidateR += DAY;
    }
    if (isFeb29(candidateL)) {
      if (isAbsent(candidateL)) {
        absentCount--;
      }
      candidateL += DAY;
    }
    if (isAbsent(candidateL)) {
      absentCount--;
    }
    if (isAbsent(candidateR + DAY)) {
      absentCount++;
    }
    candidateL += DAY;
    candidateR += DAY;
    // console.log(new Date(candidateL), new Date(candidateR), absentCount)
  }
  // console.log("*********************")

  const earliestCitizenshipStartIndex = candidateL;
  const earliestCitizenshipEndIndex = candidateR;

  return [earliestCitizenshipStartIndex, earliestCitizenshipEndIndex];
}

export function projectRemainingCitizenship(
  projectionIndex,
  earliestValidCitizenshipStartIndex,
  earliestValidCitizenshipEndIndex,
  isAbsent,
) {
  // returns the number of absences available starting from the projection day without violating earliest Citizenship
  // special case: if return -1, then projection is out of bounds to the left
  // special case: if return -2, then projection is out of bounds to the right

  // case 1: projection is out of bounds (before start)
  if (projectionIndex < earliestValidCitizenshipStartIndex) {
    return -1;
  }

  // case 2: projection is out of bounds (after end)
  if (projectionIndex > earliestValidCitizenshipEndIndex) {
    return -2;
  }

  // case 3: projection within bounds, so init remainingCount = 450
  var remainingCount = 450;
  for (
    let i = earliestValidCitizenshipStartIndex;
    i < projectionIndex; // do not count projection index
    i += DAY
  ) {
    if (isAbsent(i)) {
      remainingCount--;
    }
  }
  return remainingCount;
}

// // **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
// // TESTING OUTPUT
// console.log(`bnoStartIndex is ${bnoStartIndex}`);
// console.log(
//   `earliestValidILRPeriod(bnoStartIndex) is ${earliestValidILRPeriod(
//     bnoStartIndex
//   )}`
// );

// const arr = earliestValidILRPeriod(bnoStartIndex);
// const earliestValidILRStartIndex = arr[0];
// const earliestValidILREndIndex = arr[1];
// console.log(
//   `earliestValidILRStartIndex is ${earliestValidILRStartIndex} ie ${new Date(
//     earliestValidILRStartIndex
//   )}`
// );
// console.log(
//   `earliestValidILREndIndex   is ${earliestValidILREndIndex} ie ${new Date(
//     earliestValidILREndIndex
//   )}`
// );

// const remain = projectRemainingILR(
//   projectionIndex,
//   earliestValidILRStartIndex,
//   earliestValidILREndIndex
// );
// console.log(`remain is ${remain}`);

// const arr2 = earliestCitizenshipPeriod(constrainedStartIndex);
// const earliestValidCitizenshipStartIndex = arr2[0];
// const earliestValidCitizenshipEndIndex = arr2[1];
// console.log(
//   `earliestValidCitizenshipStartIndex is ${earliestValidCitizenshipStartIndex} ie ${new Date(
//     earliestValidCitizenshipStartIndex
//   )}`
// );
// console.log(
//   `earliestValidCitizenshipEndIndex   is ${earliestValidCitizenshipEndIndex} ie ${new Date(
//     earliestValidCitizenshipEndIndex
//   )}`
// );

// console.log(
//   `citizenship absences remaining on projection date is ${projectRemainingCitizenship(
//     projectionIndex,
//     earliestValidCitizenshipStartIndex,
//     earliestValidCitizenshipEndIndex
//   )} out of 450`
// );

// // **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
