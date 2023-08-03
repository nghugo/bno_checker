import {
  getEarliestValidILRPeriod,
  projectRemainingILR,
  getEarliestCitizenshipPeriod,
  projectRemainingCitizenship,
} from "./compute.js";

import {isAbsentFactory} from "./computeHelper.js"

export function updateDisplaySection(
  validInputs_bool,
  bnoStartValue,
  projectionValue,
  absentStartCollectionValues,
  absentEndCollectionValues,
  ilrObtainedCheckboxChecked,
  ilrObtainedDateFieldValue
) {
  function addDivNode(title, message) {
    const titleNode = document.createTextNode(title);
    const messageNode = document.createTextNode(message);

    const div = document.createElement("div");
    const h4 = document.createElement("h4");
    const p = document.createElement("p");

    h4.appendChild(titleNode);
    p.appendChild(messageNode);
    div.appendChild(h4);
    div.appendChild(p);
    const displaySection = document.getElementById("displaySection");
    displaySection.append(div);
  }

  // step 1: clear display section
  const displaySection = document.getElementById("displaySection");
  displaySection.innerHTML = "";

  // step 2: add messages to display section
  if (!validInputs_bool) {
    addDivNode("Invalid Input", "Please re-submit with valid input values.");
  } else {
    // valid inputs, so show the results

    // create isAbsent
    const isAbsent = isAbsentFactory(absentStartCollectionValues, absentEndCollectionValues);

    const [earliestValidILRStartIndex, earliestValidILREndIndex] =
      getEarliestValidILRPeriod(bnoStartValue, isAbsent);
      addDivNode("Earliest Valid ILR Qualifying Period", `The earliest 5-year period during which you can qualify for Indefinite Leave to Remain is from ${new Date(earliestValidILRStartIndex).toDateString()} to ${new Date(earliestValidILREndIndex).toDateString()}`)
  }

  // step 3: if display section is empty (nothing done in step 2), show initial message
  if (displaySection.innerHTML === "") {
    addDivNode(
      "Not Yet Submitted",
      "Please fill out the form and press submit."
    );
  }
}
