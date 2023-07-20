import { getArrays } from "./compute.js";
import { validILR } from "./compute.js";

const form = document.getElementById("form");

function addPNodeDisplay(textMessage) {
  var para = document.createElement("p");
  var text = document.createTextNode(textMessage);
  para.appendChild(text);
  var displaySection = document.getElementById("displaySection");
  displaySection.append(para);
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // always prevent default submission (page reload)

  ilrStart = document.getElementById("ilrStart");
  projection = document.getElementById("projection");
  leaveStartCollection = document.getElementsByClassName("leaveStart");
  leaveEndCollection = document.getElementsByClassName("leaveEnd");

  // clear display section
  var displaySection = document.getElementById("displaySection");
  displaySection.innerHTML="";

  check = true;
  validateInputs();

  if (check) {
    [inUK, isFeb29] = getArrays(
      ilrStartValue,
      leaveStartValues,
      leaveEndValues
    );
    [isValid, firstInvalid, earliestRestartDate, remainingAbsences] = validILR(
      inUK,
      isFeb29,
      projection
    );
    if (isValid) {
      addPNodeDisplay(
        `Your 5-year qualifying period towards Indefinite Leave to Remain is valid.`
      );

      if (projectionValue != "") {
        addPNodeDisplay(
          `On projection date ${projectionDate.toDateString()}, you have ${remainingAbsences} remaining whole day absence(s).`
        );
      } else {
        addPNodeDisplay(
          `Since you have not provided a projection date, no remaining whole day absences calculation has been carried out.`
        );
      }
    } else {
      addPNodeDisplay(
        `Your 5-year qualifying period towards Indefinite Leave to Remain is invalid, hence remaining absences cannot be computed.`
      );
      addPNodeDisplay(
        `According to your specified whole day absences, the earliest date you can restart another 5-year qualifying period towards a valid Indefinite Leave To Remain is ${earliestRestartDate.toDateString()}. You can check for the the new qualifying period to ILR by entering the new start date in the above form.`
      );
    }
  } else {
    addPNodeDisplay(`Please submit again with valid input values.`);
  }
  
  console.log("******************")
  console.log(displaySection.innerHTML==="")
  if (displaySection.innerHTML==="") {
    addPNodeDisplay("Please fill out the form and press submit")
  }
});

const setError = (element, message) => {
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  check = false; // change the nonlocal variable to false
  errorDisplay.innerText = message;
  validateInput.classList.add("error");
  validateInput.classList.remove("success");
};

const setSuccess = (element) => {
  const validateInput = element.parentElement;
  const errorDisplay = validateInput.querySelector(".error");
  errorDisplay.innerText = "";
  validateInput.classList.add("success");
  validateInput.classList.remove("error");
};

const validateInputs = () => {
  ilrStartValue = ilrStart.value;
  projectionValue = projection.value;
  leaveStartValues = Array.from(leaveStartCollection).map(
    (element) => element.value
  );
  leaveEndValues = Array.from(leaveEndCollection).map(
    (element) => element.value
  );

  console.log(`ilrStart is  ${ilrStartValue}`);
  console.log(
    `new Date(ilrStartValue) is a date object?  ${
      new Date(ilrStartValue) instanceof Date
    }`
  );
  console.log(`projection is  ${projectionValue}`);
  console.log(
    `Array.from(leaveStartCollection) length is  ${
      Array.from(leaveStartCollection).length
    }`
  );
  console.log(
    `Array.from(leaveEndCollection) length is  ${
      Array.from(leaveEndCollection).length
    }`
  );
  console.log(
    `Array.from(leaveStartCollection) is an array? ${Array.isArray(
      Array.from(leaveStartCollection)
    )}`
  );
  console.log(`leaveStartValues is  ${leaveStartValues}`);
  console.log(`leaveEndValues is  ${leaveEndValues}`);

  // validate ILR start date
  if (ilrStartValue == "") {
    setError(ilrStart, "ILR start date is required");
  } else if (
    new Date(ilrStartValue) < new Date("1970-01-01") ||
    new Date(ilrStartValue) > new Date("9999-12-31")
  ) {
    setError(
      ilrStart,
      "ILR start date must be between 01-Jan-1970 and 31-Dec-9999"
    );
  } else {
    setSuccess(ilrStart);
  }

  // validate projection date
  if (projectionValue != "") {
    if (
      new Date(projectionValue) < new Date("1970-01-01") ||
      new Date(projectionValue) > new Date("9999-12-31")
    ) {
      setError(
        projection,
        "Projection date must be between 01-Jan-1970 and 31-Dec-9999"
      );
    } else if (new Date(projectionValue) < new Date(ilrStartValue)) {
      setError(
        projection,
        "Projection date must be within 5-years after ILR start date"
      );
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
    } else {
      setSuccess(projection);
    }
  } else {
    setSuccess(projection);
  }

  // validate leave start dates (part 1/2)
  for (var i = 0; i < leaveStartValues.length; i++) {
    //leaveStartValues.length==leaveEndValues.length
    if (leaveStartValues[i] == "") {
      setError(
        leaveStartCollection[i],
        `First day is required (interval ${i + 1})`
      );
    } else {
      setSuccess(leaveStartCollection[i]);
    }
  }

  // validate leave end dates (part 1/2)
  for (var i = 0; i < leaveEndValues.length; i++) {
    //leaveStartValues.length==leaveEndValues.length
    if (leaveEndValues[i] == "") {
      setError(
        leaveEndCollection[i],
        `Last day is required (interval ${i + 1})`
      );
    } else if (leaveStartValues[i] > leaveEndValues[i]) {
      // JS turns the strings YYYYMMDD to date format automatically
      setError(
        leaveEndCollection[i],
        `Last day must be on or after first day (interval ${i + 1})`
      );
    } else {
      setSuccess(leaveEndCollection[i]);
    }
  }

  // validate leave start and leave end dates (part 2/2),
  // can flicker from success -> error, but easier to implement
  const unsortedPairs = [];
  for (var i = 0; i < leaveStartValues.length; i++) {
    unsortedPairs.push([[leaveStartValues[i]], [leaveEndValues[i]]]);
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
        leaveStartCollection[sortedToOriginal[i]],
        `Must not overlap with interval ${sortedToOriginal[i - 1] + 1}`
      ); // +1 for 1-based indexing
      setError(
        leaveEndCollection[sortedToOriginal[i - 1]],
        `Must not overlap with interval ${sortedToOriginal[i] + 1}`
      ); // +1 for 1-based indexing
    }
  }
};
