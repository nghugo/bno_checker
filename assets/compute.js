// **** **** **** **** **** **** **** **** **** **** **** **** ****
// test input
// const absentStartCollectionValues = ["2023-08-01", "2023-11-01"];
// const absentEndCollectionValues = ["2023-08-31", "2024-11-30"];
// const bnoStartValue = "2023-07-01";
// const bnoStartIndex = new Date(bnoStartValue).getTime();

// const absentStartCollectionValues = ["2023-01-10", "2024-02-20"];
// const absentEndCollectionValues = ["2023-03-30", "2024-03-07"];
// const bnoStartValue = "2020-11-18";
// const projectionValue = "2024-02-25";

const absentStartCollectionValues = ["2023-07-05"];
const absentEndCollectionValues = ["2023-12-31"];
const bnoStartValue = "2020-11-18";
const projectionValue = "2024-07-05";

const bnoStartIndex = new Date(bnoStartValue).getTime();
const projectionIndex = new Date(projectionValue).getTime();
console.log(`projectionIndex            is ${projectionIndex} ie ${new Date(projectionIndex)}`)
// **** **** **** **** **** **** **** **** **** **** **** **** ****

// all indices are taken as the millisecond count since the epoch

import {
  DAY,
  isFeb29,
  isAbsentFactory,
  indexAdd5Years,
  indexMinus1Year,
} from "./computeHelper.js";

const isAbsent = isAbsentFactory(
  absentStartCollectionValues,
  absentEndCollectionValues
);

function earliestValidILRPeriod(bnoStartIndex) {
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

function projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex) {
  // returns the number of continuous absences available starting from the projection day

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
    let i = Math.max(indexMinus1Year(projectionIndex), earliestValidILRStartIndex);
    i <= projectionIndex - DAY;
    i += DAY
  ) {
    if (isAbsent(i)) {
      absentCount += 1;
    }
  }
  var remainingCount = 180 - absentCount;
  console.log(`initial remainingCount is ${remainingCount}`)

  // phase 2: shift window to the right, adjusting for Feb29
  var yearWindowLeftIndex = indexMinus1Year(projectionIndex);
  var yearWindowRightIndex = projectionIndex - DAY;
  while (remainingCount > 0) {  //  && yearWindowRightIndex < earliestValidILREndIndex
    if (yearWindowLeftIndex >= earliestValidILRStartIndex && isAbsent(yearWindowLeftIndex)) {
      remainingCount = Math.min(1 + remainingCount, 180);
    }

    // adjust for Feb29 about to enter from the RHS, return immediately if remainingCount reaches 0
    if (isFeb29(yearWindowRightIndex + DAY)) {
      yearWindowRightIndex += DAY;
      remainingCount -= 1;
      if (remainingCount === 0) {
        return (yearWindowRightIndex - (projectionIndex - DAY)) / DAY;
      }
    }
    // adjust for Feb29 currently leaving from LHS
    if (isFeb29(yearWindowLeftIndex)) {
      yearWindowLeftIndex += DAY;
      if (yearWindowLeftIndex >= earliestValidILRStartIndex && isAbsent(yearWindowLeftIndex)) {
        remainingCount = Math.min(1 + remainingCount, 180);
      }
    }

    // increment window
    yearWindowLeftIndex += DAY;
    yearWindowRightIndex += DAY;
    remainingCount -= 1; // represents adding a day of continuous absence starting from the projection date
  }

  return (yearWindowRightIndex - (projectionIndex - DAY)) / DAY;
}

// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
// TESTING OUTPUT
console.log(`bnoStartIndex is ${bnoStartIndex}`);
console.log(
  `earliestValidILRPeriod(bnoStartIndex) is ${earliestValidILRPeriod(
    bnoStartIndex
  )}`
);

const arr = earliestValidILRPeriod(bnoStartIndex);
const earliestValidILRStartIndex = arr[0];
const earliestValidILREndIndex = arr[1];
console.log(`earliestValidILRStartIndex is ${earliestValidILRStartIndex} ie ${new Date(earliestValidILRStartIndex)}`)
console.log(`earliestValidILREndIndex   is ${earliestValidILREndIndex} ie ${new Date(earliestValidILREndIndex)}`)

const remain = projectRemainingILR(projectionIndex, earliestValidILRStartIndex, earliestValidILREndIndex);
console.log(`remain is ${remain}`);

// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
