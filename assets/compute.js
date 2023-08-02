// function datediff(first, second) {
//     return Math.round((second - first) / (1000 * 60 * 60 * 24));
// }

// test input
const absentStartCollectionValues = ["2023-08-01", "2023-11-01"];
const absentEndCollectionValues = ["2023-08-31", "2023-11-30"];

// **** **** **** **** **** **** **** **** **** **** **** **** ****
// all indices are taken as the milisecond count since the epoch

const DAY = 1000 * 3600 * 24; // day in miliseconds
function daysBetween(firstDateIndex, secondDateIndex) {
  var diff = Math.floor(
    (secondDateIndex - firstDateIndex) / (24 * 60 * 60 * 1000)
  );
  return diff;
}

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
  for (let i; i < absentStartCollectionValues.length; i++) {
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

const isAbsent = isAbsentFactory(
  daysBetween,
  absentStartCollectionValues,
  absentEndCollectionValues
);
console.log(`isAbsent(1690848000000) is ${isAbsent(1690848000000)}`); // expect true
console.log(
  `isAbsent(1690848000000 + 1*DAY) is ${isAbsent(1690848000000 + 1 * DAY)}`
); // expect true
console.log(
  `isAbsent(1690848000000 + 5*DAY) is ${isAbsent(1690848000000 + 5 * DAY)}`
); // expect true
console.log(`isAbsent(1693440000000) is ${isAbsent(1693440000000)}`); // expect true
console.log(
  `isAbsent(1693440000000 + 1*DAY) is ${isAbsent(1693440000000 + 1 * DAY)}`
); // expect false

function earliestValidILRPeriod(bnoStartIndex, absences) {
  1;
}
// **** **** **** **** **** **** **** **** **** **** **** **** ****
// export function getArrays(
//   bnoStartValue,
//   absentStartCollectionValues,
//   absentEndCollectionValues
// ) {
//   const bnoStartDate = new Date(bnoStartValue);
//   const bnoEndDate = new Date(bnoStartValue);
//   bnoEndDate.setFullYear(bnoEndDate.getFullYear() + 5); // add 5 years
//   bnoEndDate.setDate(bnoEndDate.getDate() - 1); // minus 1 day
//   const windowSize = daysBetween(bnoStartDate, bnoEndDate);
//   console.log(`bnoStart is ${bnoStart}`);
//   console.log(`bnoStartValue is ${bnoStartValue}`);
//   console.log(`bnoStartDate is ${bnoStartDate}`);
//   console.log(`bnoEndDate is ${bnoEndDate}`);
//   console.log(`windowSize is ${windowSize}`);
//   const inUK = Array(windowSize).fill(1);
//   const isFeb29 = Array(windowSize).fill(false);
//   // create isFeb29 array to handle leap years
//   const irlStartYear = Number(bnoStartDate.getFullYear());
//   for (let y = Number(irlStartYear); y < irlStartYear + 5; y++) {
//     if (
//       y % 4 == 0 &&
//       new Date(`${y}-02-29`) >= bnoStartDate &&
//       new Date(`${y}-02-29`) < bnoEndDate
//     ) {
//       var distanceFeb29 = daysBetween(bnoStartDate, new Date(`${y}-02-29`));
//       isFeb29[distanceFeb29] = true;
//       console.log(
//         `in year ${y}, marked index ${distanceFeb29} as true in isFeb29`
//       );
//     } else {
//       console.log(`in year ${y}, did not mark any dates as true in isFeb29`);
//     }
//   }
//   function boundSlicer(slicer, inUK) {
//     const lowerBound = 0;
//     const upperBound = inUK.length;
//     if (slicer < lowerBound) {
//       return lowerBound;
//     } else if (slicer > upperBound) {
//       return upperBound;
//     } else {
//       return slicer;
//     }
//   }
//   function markLeave(start, end, inUK) {
//     start = boundSlicer(start, inUK);
//     end = boundSlicer(end, inUK);
//     for (let i = start; i < end; i++) {
//       // right exclusive as needed for slicers
//       inUK[i] = 0;
//     }
//     console.log(`Marking leave from ${start} to ${end}. Successful?`);
//     console.log(
//       inUK[start - 1] == 1,
//       inUK[start] == 0,
//       inUK[end - 1] == 0,
//       inUK[end] == 1
//     );
//   }
//   for (var absentStartValue of absentStartCollectionValues) {
//     console.log(`absentStartValue received as ${absentStartValue}`);
//   }
//   for (var absentEndValue of absentEndCollectionValues) {
//     console.log(`absentEndValue received as ${absentEndValue}`);
//   }
//   const zippedValues = absentStartCollectionValues.map(function (entry, i) {
//     return [entry, absentEndCollectionValues[i]];
//   });
//   for (let zippedValue of zippedValues) {
//     var distanceStart = daysBetween(bnoStartDate, new Date(zippedValue[0])); // zippedValue[0] corresponds to absentStart
//     var distanceEnd = daysBetween(bnoStartDate, new Date(zippedValue[1])) + 1; // zippedValue[1] corresponds to absentEnd, +1 for right inclusive
//     markLeave(distanceStart, distanceEnd, inUK);
//   }
//   return [inUK, isFeb29];
// }
// export function validBNO(inUK, isFeb29, bnoStartValue, projectionValue) {
//   // if Feb29 in window, then windowSize=366
//   // if Feb29 not in window, then windowSize=365
//   // maxAbroad=180
//   //initialize window, counter, firstInvalid, projectionIndex
//   var abroadCounter = 0;
//   var validPeriod = true;
//   var firstInvalid = null;
//   var lastInvalid = null;
//   var earliestRestart = null;
//   var remainingAbsences = 180;
//   var projectionIndex;
//   const bnoStartDate = new Date(bnoStartValue);
//   if (projectionValue != "") {
//     const projectionDate = new Date(projectionValue);
//     const projectionIndex = daysBetween(bnoStartDate, projectionDate);
//     console.log(`projectionIndex is ${projectionIndex}`);
//   }
//   // l, r slicers
//   var l = 0;
//   var rDate = new Date(bnoStartValue);
//   rDate.setFullYear(rDate.getFullYear() + 1); // add 1 year
//   rDate.setDate(rDate.getDate() - 1); // minus 1 day
//   var r = daysBetween(bnoStartDate, rDate) + 1; // +1 since slicer
//   for (var i = 0; i < r; i++) {
//     if (inUK[i] == 0) {
//       abroadCounter += 1;
//     }
//     if (abroadCounter > 180) {
//       if (validPeriod) {
//         // execute once only
//         validPeriod = false;
//       }
//       if (firstInvalid) {
//         firstInvalid = 0;
//       }
//       lastInvalid = 0;
//       earliestRestart = 0;
//     }
//   }
//   if (projectionValue != "" && projectionIndex < r - 1) {
//     remainingAbsences = 180;
//     for (i = 0; i < projectionIndex; i++) {
//       if (inUK[i] == 0) {
//         remainingAbsences = Math.max(0, remainingAbsences - 1);
//       }
//     }
//   }
//   // console.log(`i, projectionIndex are ${i}, ${projectionIndex} and do they match? ${i==projectionIndex}`)
//   console.log(`l initialized as ${l}`);
//   console.log(`r initialized as ${r}`);
//   console.log(`abroadCounter initialized as ${abroadCounter}`);
//   // sliding window
//   function increment_l(l, abroadCounter, lastInvalid) {
//     l += 1;
//     if (inUK[l - 1] == 0) {
//       // -1 because we want to look at previous pointer
//       abroadCounter -= 1;
//     }
//     return [l, abroadCounter];
//   }
//   function increment_r(r, abroadCounter) {
//     r += 1;
//     if (inUK[r - 1] == 0) {
//       // -1 to convert right slicer to right pointer
//       abroadCounter += 1;
//     }
//     return [r, abroadCounter];
//   }
//   // at each step: check counter and slide window
//   while (r < inUK.length) {
//     if (projectionValue != "") {
//       if (r - 1 == projectionIndex) {
//         // convert slicer to index, so -1
//         remainingAbsences = Math.max(0, 180 - abroadCounter);
//       }
//     }
//     if (abroadCounter > 180) {
//       // check abroadCounter to update the 2 invalid dates
//       validPeriod = false;
//       if (firstInvalid == null) {
//         // updated once only
//         firstInvalid = r - 1; // -1 to convert slicer to index
//       }
//       lastInvalid = r - 1; // -1 to convert slicer to index
//       earliestRestart = l;
//     }
//     if (isFeb29[l]) {
//       [l, abroadCounter] = increment_l(l, abroadCounter);
//     }
//     if (isFeb29[r]) {
//       [r, abroadCounter] = increment_r(r, abroadCounter);
//     }
//     [l, abroadCounter] = increment_l(l, abroadCounter);
//     [r, abroadCounter] = increment_r(r, abroadCounter);
//   }
//   if (lastInvalid != null) {
//     var lastInvalidDate = new Date(bnoStartValue);
//     lastInvalidDate.setDate(lastInvalidDate.getDate() + lastInvalid); // plus lastInvalid days
//     console.log(`lastInvalidDate is ${lastInvalidDate}`);
//   }
//   var earliestRestartDate
//   if (earliestRestart !== null) {
//     earliestRestart += 1; //+1 since the last window is invalid, but the very next is valid
//     earliestRestartDate = new Date(bnoStartValue);
//     earliestRestartDate.setDate(
//       earliestRestartDate.getDate() + earliestRestart
//     );
//   } else {
//     earliestRestartDate = null;
//   }
//   console.log(`finally, l is ${l}`);
//   console.log(`finally, r is ${r}`);
//   console.log(`finally, remainingAbsences is ${remainingAbsences}`);
//   console.log(`finally, earliestRestart is ${earliestRestart}`);
//   return [validPeriod, firstInvalid, earliestRestartDate, remainingAbsences];
// }
