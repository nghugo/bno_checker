import {
  DAY,
  isFeb29,
  isAbsentFactory,
  indexAdd5YearsMinus1Day,
  indexMinus1YearAdd1Day,
  indexMinus4YearsAdd1Day,
  indexAdd4Years,
} from "./computeHelper.js";

// // **** **** **** **** **** **** **** **** **** **** **** **** ****

// const mockDateValue = "2024-02-01"; // use this to mock the constrainedStartIndex

// // // test case 9 for citizenship (cts 450 day test -> split 360 and 90) (pass)
// // 450 days after 2028-02-15 = 10 May 2029 (ie total 451 days)
// // expect to start 1 day after 2028-02-15 ie 2028-02-16 (yes indeed)
// const bnoStartValue = "2024-03-19"; // ignore this
// const absentStartCollectionValues = ["2028-02-15"];
// const absentEndCollectionValues = ["2029-05-10"];
// const projectionValue = "2029-05-09"; // 2, null expected
// // const projectionValue = "2029-05-10"; // 1, null expected
// //const projectionValue = "2029-05-11"; // 0, null expected

// const bnoStartIndex = new Date(bnoStartValue).getTime();
// const projectionIndex = new Date(projectionValue).getTime();
// console.log(`projectionIndex            is ${projectionIndex} ie ${new Date(projectionIndex)}`);

// const isAbsent = isAbsentFactory(absentStartCollectionValues, absentEndCollectionValues);

// // **** **** **** **** **** **** **** **** **** **** **** **** ****

// all indices are taken as the millisecond count since the epoch

export function getEarliestValidILRPeriod(bnoStartIndex, isAbsent) {
  // given a bno start date represented in millisecond index since the epoch,
  // and also the days of absences using the closure isAbsent
  // returns the earliest valid ILR qualification period
  // note, this makes user of the function isFeb29 as well
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
  // returns the number of continuous absences available starting from the projection day without violating earliest ILR
  // special case: if return -1, then projection is out of bounds to the left
  // special case: if return -2, then projection is out of bounds to the right

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
  // console.log(Math.max(indexMinus1YearAdd1Day(projectionIndex), earliestValidILRStartIndex))
  // console.log(projectionIndex - DAY)
  // console.log(indexMinus1YearAdd1Day(projectionIndex))
  // console.log(earliestValidILRStartIndex)
  for (
    let i = Math.max(indexMinus1YearAdd1Day(projectionIndex), earliestValidILRStartIndex);
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
      remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
    }

    // console.log(`left ${new Date(yearWindowLeftIndex)} right ${new Date(yearWindowRightIndex + DAY)}, ${(yearWindowRightIndex - (projectionIndex - DAY)) / DAY}, ${remainingCount}`)

    // increment window
    yearWindowLeftIndex += DAY;
    yearWindowRightIndex += DAY;
    remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
  }

  const continuousAbsences = (yearWindowRightIndex - (projectionIndex - DAY)) / DAY
  return [continuousAbsences, "in bound"];
}

export function getCitizenshipConstrainedEarliestStartIndex(
  ilrObtainedCheckboxChecked,
  ilrObtainedDateFieldIndex,
  earliestValidILREndIndex
) {
  // citizenship process is 5 years and must end at least 1 year after obtaining ILR
  // ILR qualification period is 5 years
  // thus, earliest start date for citizenship qualification period = backtrack 4 years from the point of obtaining ILR
  // add 1 day to account for inclusive start and end (eg a 4 year period starting on 2024-Jun-28 ends on 2028-Jun-27)
  if (ilrObtainedCheckboxChecked) {
    return indexMinus4YearsAdd1Day(ilrObtainedDateFieldIndex);
  }
  return indexMinus4YearsAdd1Day(earliestValidILREndIndex);
}

export function getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent) {
  var candidateL = citizenshipConstrainedEarliestStartIndex; // candidateL is an inclusive left bound for FULL
  var candidateM = indexAdd4Years(citizenshipConstrainedEarliestStartIndex); // candidateM is an inclusive left bound for RHS
  var candidateR = indexAdd5YearsMinus1Day(citizenshipConstrainedEarliestStartIndex); // candidateR is an inclusive right bound for both FULL and RHS

  // ie,
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

  // console.log("*********************");
  // console.log(
  //   new Date(candidateL).toDateString(),
  //   ",",
  //   new Date(candidateR).toDateString(),
  //   " FULL | RHS ",
  //   new Date(candidateM).toDateString(),
  //   ",",
  //   new Date(candidateR).toDateString(),
  //   absentCountFULL,
  //   absentCountRHS
  // );

  // shift the 2 windows, and adjusting for Feb29
  while (absentCountFULL > 450 || absentCountRHS > 90) {
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

    //   console.log(
    //     new Date(candidateL).toDateString(),
    //     ",",
    //     new Date(candidateR).toDateString(),
    //     " FULL | RHS ",
    //     new Date(candidateM).toDateString(),
    //     ",",
    //     new Date(candidateR).toDateString(),
    //     absentCountFULL,
    //     absentCountRHS
    //   );
  }
  // console.log("*********************");

  const earliestValidCitizenshipStartIndex = candidateL;
  const earliestValidCitizenshipMidIndex = candidateM;
  const earliestValidCitizenshipEndIndex = candidateR;

  return [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex];
}

export function projectRemainingCitizenship(
  projectionIndex,
  earliestValidCitizenshipStartIndex,
  earliestValidCitizenshipMidIndex,
  earliestValidCitizenshipEndIndex,
  isAbsent
) {
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
  // console.log(`new Date(earliestValidCitizenshipStartIndex) is ${new Date(earliestValidCitizenshipStartIndex)}`);
  // console.log(`new Date(projectionIndex) is ${new Date(projectionIndex)}`);

  for (
    let i = earliestValidCitizenshipStartIndex;
    i < projectionIndex; // do not count projection index
    i += DAY
  ) {
    // console.log(isAbsent(i), new Date(i))
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

// // **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
// // TESTING OUTPUT
// console.log(`bnoStartIndex is ${bnoStartIndex}`);
// console.log(`getEarliestValidILRPeriod(bnoStartIndex) is ${getEarliestValidILRPeriod(bnoStartIndex, isAbsent)}`);

// const arr = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
// const earliestValidILRStartIndex = arr[0];
// const earliestValidILREndIndex = arr[1];
// console.log(`earliestValidILRStartIndex is ${earliestValidILRStartIndex} ie ${new Date(earliestValidILRStartIndex)}`);
// console.log(`earliestValidILREndIndex   is ${earliestValidILREndIndex} ie ${new Date(earliestValidILREndIndex)}`);

// const ilrAbsencesRemaining = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex, isAbsent);
// console.log(`ilr absences remaining is ${ilrAbsencesRemaining}`);

// // mock input **** **** **** **** **** **** ****
// // const ilrObtainedCheckboxChecked = false;
// // const ilrObtainedDateFieldIndex = null;
// // const citizenshipConstrainedEarliestStartIndex =
// //   getCitizenshipConstrainedEarliestStartIndex(
// //     ilrObtainedCheckboxChecked,
// //     ilrObtainedDateFieldIndex,
// //     earliestValidILREndIndex
// //   );

// const citizenshipConstrainedEarliestStartIndex = new Date(mockDateValue).getTime();
// //  **** **** **** **** **** **** **** **** ****

// const arr2 = getEarliestCitizenshipPeriod(citizenshipConstrainedEarliestStartIndex, isAbsent);
// const earliestValidCitizenshipStartIndex = arr2[0];
// const earliestValidCitizenshipMidIndex = arr2[1];
// const earliestValidCitizenshipEndIndex = arr2[2];
// console.log(`earliestValidCitizenshipStartIndex is ${earliestValidCitizenshipStartIndex} ie ${new Date(earliestValidCitizenshipStartIndex)}`);
// console.log(`earliestValidCitizenshipEndIndex   is ${earliestValidCitizenshipEndIndex} ie ${new Date(earliestValidCitizenshipEndIndex)}`);

// const arr3 = projectRemainingCitizenship(
//   projectionIndex,
//   earliestValidCitizenshipStartIndex,
//   earliestValidCitizenshipMidIndex,
//   earliestValidCitizenshipEndIndex,
//   isAbsent
// );
// console.log(`citizenship absences remaining on projection date is ${arr3}`);

// // **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
