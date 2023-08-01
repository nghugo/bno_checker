// setError: add error CSS class to input field
const setError = (element, message) => {
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  errorDisplay.innerText = message;
  validateInput.classList.add("error");
  validateInput.classList.remove("success");
};

// setSuccess: add success CSS class to input field
const setSuccess = (element) => {
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  errorDisplay.innerText = "";
  validateInput.classList.add("success");
  validateInput.classList.remove("error");
};

// inject CSS classes via setError vs setSuccess to each input field, depending on validation
// return boolean indicator of whether all inputs are valid
export function setInputValidationMessages(
  ilrStart,
  projection,
  absentStartCollection,
  absentEndCollection
) {
  var ilrStartValue = ilrStart.value;
  var projectionValue = projection.value;
  var absentStartCollectionValues = Array.from(absentStartCollection).map(
    (element) => element.value
  );
  var absentEndCollectionValues = Array.from(absentEndCollection).map(
    (element) => element.value
  );

  var validInputs = true; // one of the return values

  function ilrStartDateExists() {
    // validate ILR start date exists and in range
    if (ilrStartValue == "") {
      setError(ilrStart, "ILR start date is required");
      validInputs = false;
    } else if (
      new Date(ilrStartValue) < new Date("1970-01-01") ||
      new Date(ilrStartValue) > new Date("9999-12-31")
    ) {
      setError(
        ilrStart,
        "ILR start date must be between 01-Jan-1970 and 31-Dec-9999"
      );
      validInputs = false;
    } else {
      setSuccess(ilrStart);
    }
  }

  function ilrProjectionDateInRangeIfExists() {
    // validate projection date in range if exists
    if (projectionValue != "") {
      if (
        new Date(projectionValue) < new Date("1970-01-01") ||
        new Date(projectionValue) > new Date("9999-12-31")
      ) {
        setError(
          projection,
          "Projection date must be between 01-Jan-1970 and 31-Dec-9999"
        );
        validInputs = false;
      } else if (new Date(projectionValue) < new Date(ilrStartValue)) {
        setError(
          projection,
          "Projection date must be within 5-years after ILR start date"
        );
        validInputs = false;
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
        validInputs = false;
      } else {
        setSuccess(projection);
      }
    } else {
      setSuccess(projection);
    }
  }

  function absentStartDateExistsAllIntervals() {
    // validate absent start date exists for all intervals added by the user
    for (var i = 0; i < absentStartCollectionValues.length; i++) {
      //absentStartCollectionValues.length==absentEndCollectionValues.length
      if (absentStartCollectionValues[i] == "") {
        setError(
          absentStartCollection[i],
          `First day is required (interval ${i + 1})`
        );
        validInputs = false;
      } else {
        setSuccess(absentStartCollection[i]);
      }
    }
  }

  function absentEndDateExistsAllIntervalsAndAfterStart() {
    // validate absent end date exists and are after start for all intervals added by the user
    for (var i = 0; i < absentEndCollectionValues.length; i++) {
      //absentStartCollectionValues.length==absentEndCollectionValues.length
      if (absentEndCollectionValues[i] == "") {
        setError(
          absentEndCollection[i],
          `Last day is required (interval ${i + 1})`
        );
        validInputs = false;
      } else if (
        absentStartCollectionValues[i] > absentEndCollectionValues[i]
      ) {
        // JS turns the strings YYYYMMDD to date format automatically
        setError(
          absentEndCollection[i],
          `Last day must be on or after first day (interval ${i + 1})`
        );
        validInputs = false;
      } else {
        setSuccess(absentEndCollection[i]);
      }
    }
  }

  function absendStartEndDateIntervalsNoOverlap() {
    // validate absent start, end date intervals do not overlap
    // can flicker from success -> error, but easier to implement
    const unsortedPairs = [];
    for (var i = 0; i < absentStartCollectionValues.length; i++) {
      unsortedPairs.push([
        [absentStartCollectionValues[i]],
        [absentEndCollectionValues[i]],
      ]);
    }
    const sortedPairs = unsortedPairs.slice(0); // create copy
    sortedPairs.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    var len = unsortedPairs.length;
    var sortedToOriginal = new Array(len);
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
        validInputs = false;
        setError(
          absentEndCollection[sortedToOriginal[i - 1]],
          `Must not overlap with interval ${sortedToOriginal[i] + 1}`
        ); // +1 for 1-based indexing
        validInputs = false;
      }
    }
  }

  ilrStartDateExists();
  ilrProjectionDateInRangeIfExists();
  absentStartDateExistsAllIntervals();
  absentEndDateExistsAllIntervalsAndAfterStart();
  absendStartEndDateIntervalsNoOverlap();

  return [
    validInputs,
    ilrStartValue,
    projectionValue,
    absentStartCollectionValues,
    absentEndCollectionValues,
  ];
}
