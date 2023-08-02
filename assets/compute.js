// **** **** **** **** **** **** **** **** **** **** **** **** ****
// test input
// const absentStartCollectionValues = ["2023-08-01", "2023-11-01"];
// const absentEndCollectionValues = ["2023-08-31", "2024-11-30"];
// const bnoStartValue = "2023-07-01";
// const bnoStartIndex = new Date(bnoStartValue).getTime();

const absentStartCollectionValues = ["2021-10-10", "2021-11-05"];
const absentEndCollectionValues = ["2021-10-30", "2040-02-05"];
const bnoStartValue = "2020-11-18";
const bnoStartIndex = new Date(bnoStartValue).getTime();
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

// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
// TESTING OUTPUT
console.log(`bnoStartIndex is ${bnoStartIndex}`)
console.log(`earliestValidILRPeriod(bnoStartIndex) is ${earliestValidILRPeriod(bnoStartIndex)}`)
for (var index of earliestValidILRPeriod(bnoStartIndex)) {
  console.log(`date: ${new Date(index)}`)
}

// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** ****
