// **** **** **** **** **** **** **** **** **** **** **** **** ****
// test input
// const absentStartCollectionValues = ["2023-08-01", "2023-11-01"];
// const absentEndCollectionValues = ["2023-08-31", "2024-11-30"];
// const bnoStartValue = "2023-07-01";
// const bnoStartIndex = new Date(bnoStartValue).getTime();

const absentStartCollectionValues = ["2023-01-01"];
const absentEndCollectionValues = ["2023-06-29"];
const bnoStartValue = "2023-01-01";
const bnoStartIndex = new Date(bnoStartValue).getTime();
// **** **** **** **** **** **** **** **** **** **** **** **** ****


// all indices are taken as the milisecond count since the epoch
const DAY = 1000 * 3600 * 24; // day in miliseconds

function isFeb29(index) {
  // returns boolean
  const d = new Date(index).getDate() == 29; // 1 based indexing
  const m = new Date(index).getMonth() == 1; // 0 based indexing
  return d && m;
}

for (var absentStartValue of absentStartCollectionValues) {
  console.log(
    `absentStartValue received as ${absentStartValue} with index ${new Date(
      absentStartValue
    ).getTime()}`
  );
}
for (var absentEndValue of absentEndCollectionValues) {
  console.log(
    `absentEndValue received as ${absentEndValue} with index ${new Date(
      absentEndValue
    ).getTime()}`
  );
}

function isAbsentFactory(
  absentStartCollectionValues,
  absentEndCollectionValues
) {
  // isAbsentFactory returns a first class function (call this isAbsent) as a closure
  // isAbsent can be called to determine if an index belongs to an absent date
  const absentIndexSet = new Set();
  for (let i = 0; i < absentStartCollectionValues.length; i++) {
    const lower = new Date(absentStartCollectionValues[i]).getTime();
    const upper = new Date(absentEndCollectionValues[i]).getTime();
    console.log(lower, upper, "*****************");
    var index = lower;
    while (index <= upper) {
      absentIndexSet.add(index);
      index += 1 * DAY;
    }
  }
  console.log(absentIndexSet)
  function isAbsent(index) {
    return absentIndexSet.has(index);
  }
  return isAbsent;
}

const isAbsent = isAbsentFactory(
  absentStartCollectionValues,
  absentEndCollectionValues
);

function indexAdd5Years(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() + 5); // add 5 years
  resDate.setDate(resDate.getDate() - 1); // minus 1 day
  var resIndex = resDate.getTime();
  return resIndex
}

function indexMinus1Year(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() - 1); // minus 1 year
  resDate.setDate(resDate.getDate() + 1); // add 1 day
  var resIndex = resDate.getTime();
  return resIndex
}

function earliestValidILRPeriod(bnoStartIndex) {
  var candidateILRStartIndex = bnoStartIndex;
  var candidateILREndIndex = indexAdd5Years(candidateILRStartIndex);

  function lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex) {
    var absentCount = 0;
    var yearWindowRightIndex = candidateILREndIndex;
    var yearWindowLeftIndex = indexMinus1Year(yearWindowRightIndex);
    // phase 1: grow window from right to left
    for (let i = yearWindowRightIndex; i >= yearWindowLeftIndex; i -= DAY) {
      // console.log(absentCount)
      if (isAbsent(i)) {
        absentCount += 1
      }
      if (absentCount > 180) {
        return i + DAY
      }
    }

    // phase 2: shift window from right to left, adjusting for Feb29
    while (yearWindowLeftIndex >= candidateILRStartIndex) {
      // handle feb29 at current pos
      if (isFeb29(yearWindowLeftIndex)) {
        yearWindowLeftIndex -= DAY
        if (isAbsent(yearWindowLeftIndex)) {
          absentCount += 1
        }
      }
      if (isFeb29(yearWindowRightIndex + DAY)) {
        yearWindowRightIndex -= DAY
        if (isAbsent(yearWindowRightIndex + DAY)) {
          absentCount -= 1
        }
      }
      if (absentCount > 180) {
        return yearWindowLeftIndex + DAY
      }

      // then shift window by 1 unit
      yearWindowLeftIndex -= DAY;
      yearWindowRightIndex -= DAY;
     
      if (isAbsent(yearWindowLeftIndex)) {
        absentCount += 1
      }
      if (isAbsent(yearWindowRightIndex + DAY)) {
        absentCount -= 1
      }
    }

    // phase 3: if absentCount did not exceed 180, return null
    return null
  }

  while (lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex) !== null) {
    candidateILRStartIndex = lastInvalidILRStartPointInPeriod(candidateILRStartIndex, candidateILREndIndex);
    candidateILREndIndex = indexAdd5Years(candidateILRStartIndex);
  }

  const earliestValidILRStartIndex = candidateILRStartIndex;
  const earliestValidILREndIndex = candidateILREndIndex;
  return [earliestValidILRStartIndex, earliestValidILREndIndex]
}


// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** 
// TESTING 
console.log(`bnoStartIndex is ${bnoStartIndex}`)
console.log(`earliestValidILRPeriod(bnoStartIndex) is ${earliestValidILRPeriod(bnoStartIndex)}`)
for (var index of earliestValidILRPeriod(bnoStartIndex)) {
  console.log(`date: ${new Date(index)}`)
}

// **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** **** 


