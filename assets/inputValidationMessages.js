export function setInputValidationMessages(
  // inject CSS classes via setError vs setSuccess to each input field, depending on validation
  // return boolean indicator of whether all inputs are valid
  ilrStart,
  projection,
  absentStartCollection,
  absentEndCollection
) {
  const ilrStartValue = ilrStart.value;
  const projectionValue = projection.value;
  const absentStartCollectionValues = Array.from(absentStartCollection).map(
    (element) => element.value
  );
  const absentEndCollectionValues = Array.from(absentEndCollection).map(
    (element) => element.value
  );

  // These each return bool and inject CSS class to the input fields (via setError or setSuccess)
  const start_bool = ilrStartDateExists(ilrStart, ilrStartValue);
  const proj_bool = ilrProjectionDateInRangeIfExists(projection, ilrStartValue, projectionValue);
  const startAbs_bool = absentStartDateExistsAllIntervals(absentStartCollection, absentStartCollectionValues);
  const endAbs_bool = absentEndDateExistsAllIntervalsAndAfterStart(absentEndCollection, absentStartCollectionValues, absentEndCollectionValues);
  const startEndAbs_bool = absendStartEndDateIntervalsNoOverlap(absentStartCollection, absentEndCollection, absentStartCollectionValues, absentEndCollectionValues);
  
  const validInputs = start_bool && proj_bool && startAbs_bool && endAbs_bool && startEndAbs_bool;

  return [
    validInputs,
    ilrStartValue,
    projectionValue,
    absentStartCollectionValues,
    absentEndCollectionValues,
  ];
}

function setError(element, message) {
  // setError: add error CSS class to input field
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  errorDisplay.innerText = message;
  validateInput.classList.add("error");
  validateInput.classList.remove("success");
};

function setSuccess(element)  {
  // setSuccess: add success CSS class to input field
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  errorDisplay.innerText = "";
  validateInput.classList.add("success");
  validateInput.classList.remove("error");
};

function ilrStartDateExists(ilrStart, ilrStartValue) {
  // validate ILR start date exists and in range
  var res = true;
  if (ilrStartValue == "") {
    setError(ilrStart, "ILR start date is required");
    res = false;
  } else if (
    new Date(ilrStartValue) < new Date("1970-01-01") ||
    new Date(ilrStartValue) > new Date("9999-12-31")
  ) {
    setError(
      ilrStart,
      "ILR start date must be between 01-Jan-1970 and 31-Dec-9999"
    );
    res = false;
  } else {
    setSuccess(ilrStart);
  }
  return res;
}

function ilrProjectionDateInRangeIfExists(
  projection,
  ilrStartValue,
  projectionValue
) {
  // validate projection date in range if exists
  var res = true;
  if (projectionValue != "") {
    if (
      new Date(projectionValue) < new Date("1970-01-01") ||
      new Date(projectionValue) > new Date("9999-12-31")
    ) {
      setError(
        projection,
        "Projection date must be between 01-Jan-1970 and 31-Dec-9999"
      );
      res = false;
    } else if (new Date(projectionValue) < new Date(ilrStartValue)) {
      setError(
        projection,
        "Projection date must be within 5-years after ILR start date"
      );
      res = false;
    } else if (
      new Date(projectionValue) >
      new Date(
        new Date(ilrStartValue).setFullYear(
          new Date().getFullYear(ilrStartValue) + 5
        )
      )
    ) {
      setError(
        projection,
        "Projection date must be within 5-years after ILR start date"
      );
      res = false;
    } else {
      setSuccess(projection);
    }
  } else {
    setSuccess(projection);
  }
  return res;
}

function absentStartDateExistsAllIntervals(
  absentStartCollection,
  absentStartCollectionValues
) {
  // validate absent start date exists for all intervals added by the user
  var res = true;
  for (var i = 0; i < absentStartCollectionValues.length; i++) {
    //absentStartCollectionValues.length==absentEndCollectionValues.length
    if (absentStartCollectionValues[i] == "") {
      setError(
        absentStartCollection[i],
        `First day is required (interval ${i + 1})`
      );
      res = false;
    } else {
      setSuccess(absentStartCollection[i]);
    }
  }
  return res;
}

function absentEndDateExistsAllIntervalsAndAfterStart(
  absentEndCollection,
  absentStartCollectionValues,
  absentEndCollectionValues
) {
  // validate absent end date exists and are after start for all intervals added by the user
  var res = true;
  for (var i = 0; i < absentEndCollectionValues.length; i++) {
    if (absentEndCollectionValues[i] == "") {
      setError(
        absentEndCollection[i],
        `Last day is required (interval ${i + 1})`
      );
      res = false;
    } else if (absentStartCollectionValues[i] > absentEndCollectionValues[i]) {
      // JS turns the strings YYYYMMDD to date format automatically
      setError(
        absentEndCollection[i],
        `Last day must be on or after first day (interval ${i + 1})`
      );
      res = false;
    } else {
      setSuccess(absentEndCollection[i]);
    }
  }
  return res;
}

function absendStartEndDateIntervalsNoOverlap(
  absentStartCollection,
  absentEndCollection,
  absentStartCollectionValues,
  absentEndCollectionValues
) {
  // validate absent start, end date intervals do not overlap
  var res = true;
  const unsortedPairs = [];
  for (var i = 0; i < absentStartCollectionValues.length; i++) {
    unsortedPairs.push([
      [absentStartCollectionValues[i]],
      [absentEndCollectionValues[i]],
    ]);
  }
  const sortedPairs = unsortedPairs.slice(0); // create copy
  sortedPairs.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const len = unsortedPairs.length;
  const sortedToOriginal = new Array(len);
  for (var i = 0; i < len; i++) sortedToOriginal[i] = i;
  sortedToOriginal.sort(
    (a, b) => new Date(unsortedPairs[a][0]) - new Date(unsortedPairs[b][0])
  );

  for (var i = 1; i < sortedPairs.length; i++) {
    // begin with i=1 to allow for i-1
    if (
      sortedPairs[i][0] < sortedPairs[i - 1][1] &&
      sortedPairs[i][0] != "" &&
      sortedPairs[i - 1][1] != ""
    ) {
      // sortedPairs[i]'s start is before sortedPairs[i-1]'s end
      setError(
        absentStartCollection[sortedToOriginal[i]],
        `Must not overlap with interval ${sortedToOriginal[i - 1] + 1}`
      ); // +1 for 1-based indexing
      res = false;
      setError(
        absentEndCollection[sortedToOriginal[i - 1]],
        `Must not overlap with interval ${sortedToOriginal[i] + 1}`
      ); // +1 for 1-based indexing
      res = false;
    }
  }
  return res;
}
