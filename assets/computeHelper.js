export const DAY = 1000 * 3600 * 24; // day in miliseconds

export function isFeb29(index) {
  // returns boolean
  const d = new Date(index).getDate() == 29; // 1 based indexing
  const m = new Date(index).getMonth() == 1; // 0 based indexing
  return d && m;
}

export function isAbsentFactory(
  absentStartCollectionValues,
  absentEndCollectionValues
) {
  // isAbsentFactory returns a first class function (call this isAbsent) as a closure
  // isAbsent can be called to determine if an index belongs to an absent date
  const absentIndexSet = new Set();
  for (let i = 0; i < absentStartCollectionValues.length; i++) {
    const lower = new Date(absentStartCollectionValues[i]).getTime();
    const upper = new Date(absentEndCollectionValues[i]).getTime();
    var index = lower;
    while (index <= upper) {
      absentIndexSet.add(index);
      index += 1 * DAY;
    }
  }
  function isAbsent(index) {
    return absentIndexSet.has(index);
  }
  return isAbsent;
}

export function indexAdd5YearsMinus1Day(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() + 5); // add 5 years
  resDate.setDate(resDate.getDate() - 1); // minus 1 day
  var resIndex = resDate.getTime();
  return resIndex;
}

export function indexMinus5YearsAdd1Day(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() - 5); // minus 5 years
  resDate.setDate(resDate.getDate() + 1); // add 1 day
  var resIndex = resDate.getTime();
  return resIndex;
}

export function indexMinus1YearAdd1Day(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() - 1); // minus 1 year
  resDate.setDate(resDate.getDate() + 1); // add 1 day
  var resIndex = resDate.getTime();
  return resIndex;
}

export function indexAdd4Years(inputIndex) {
  // automatically adjust for Feb29
  var resDate = new Date(inputIndex);
  resDate.setFullYear(resDate.getFullYear() + 4); // add 4 years
  var resIndex = resDate.getTime();
  return resIndex;
}