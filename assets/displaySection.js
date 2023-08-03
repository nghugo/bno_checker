import {
  earliestValidILRPeriod,
  projectRemainingILR,
  earliestCitizenshipPeriod,
  projectRemainingCitizenship,
} from "./compute.js";

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
    
    const div = document.createElement("div")
    const h4 = document.createElement("h4")
    const p = document.createElement("p");
    
    h4.appendChild(titleNode)
    p.appendChild(messageNode)
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
  }

  // step 3: if display section is empty (nothing done in step 2), show initial message
  if (displaySection.innerHTML === "") {
    addDivNode("Not Yet Submitted", "Please fill out the form and press submit.");
  }
}
