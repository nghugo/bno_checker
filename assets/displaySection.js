import {
  getEarliestValidILRPeriod,
  projectRemainingILR,
  getCitizenshipConstrainedEarliestStartIndex,
  getEarliestCitizenshipPeriod,
  projectRemainingCitizenship,
} from "./compute.js";

import { isAbsentFactory } from "./computeHelper.js";

export function updateDisplaySection(
  validInputs_bool,
  bnoStartValue,
  projectionValue,
  absentStartCollectionValues,
  absentEndCollectionValues,
  ilrObtainedCheckboxChecked,
  ilrObtainedDateFieldValue
) {
  const bnoStartIndex = new Date(bnoStartValue).getTime();
  const projectionIndex = new Date(projectionValue).getTime();
  const isAbsent = isAbsentFactory(absentStartCollectionValues, absentEndCollectionValues);
  const ilrObtainedDateFieldIndex = new Date(ilrObtainedDateFieldValue).getTime();

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

  var earliestValidILRStartIndex; // only defined if !ilrObtainedCheckboxChecked in step 2 ilr
  var earliestValidILREndIndex; // only defined if !ilrObtainedCheckboxChecked in step 2 ilr

  var earliestValidCitizenshipStartIndex; // will be defined in step 2 citizenship
  var earliestValidCitizenshipMidIndex; // will be defined in step 2 citizenship
  var earliestValidCitizenshipEndIndex; // will be defined in step 2 citizenship

  // step 1: clear display section
  const displaySection = document.getElementById("displaySection");
  displaySection.innerHTML = "";

  // step 2: add messages to display section
  if (!validInputs_bool) {
    // invalid inputs, so request re-submit
    addDivNode("Invalid Input", "Please re-submit with valid input values.");
  } else {
    // valid inputs, so display results

    // part 2A: earliest indefinite leave to remain qualifying period
    if (!ilrObtainedCheckboxChecked) {
      // if indefinite leave to remain not yet obtained
      [earliestValidILRStartIndex, earliestValidILREndIndex] = getEarliestValidILRPeriod(bnoStartIndex, isAbsent);
      addDivNode(
        "Earliest Valid ILR Qualifying Period",
        `From 
        ${new Date(earliestValidILRStartIndex).toDateString()} to ${new Date(earliestValidILREndIndex).toDateString()}.`
      );
    }

    // part 2B: earliest citizenship qualifying period
    const citizenshipConstrainedEarliestStartIndex = getCitizenshipConstrainedEarliestStartIndex(
      ilrObtainedCheckboxChecked,
      ilrObtainedDateFieldIndex,
      earliestValidILREndIndex
    );
    [earliestValidCitizenshipStartIndex, earliestValidCitizenshipMidIndex, earliestValidCitizenshipEndIndex] = getEarliestCitizenshipPeriod(
      citizenshipConstrainedEarliestStartIndex,
      isAbsent
    );
    addDivNode(
      "Earliest Valid Citizenship Qualifying Period",
      `From 
        ${new Date(earliestValidCitizenshipStartIndex).toDateString()} to ${new Date(earliestValidCitizenshipEndIndex).toDateString()}.`
    );

    // part 2C: projection if user has entered projection date

    if (projectionIndex) {
      // part 2C-1: indefinite leave to remain projection
      if (!ilrObtainedCheckboxChecked) {
        // if indefinite leave to remain not yet obtained
        const [continuousAbsences, boundednessILR] = projectRemainingILR(
          projectionIndex,
          earliestValidILRStartIndex,
          earliestValidILREndIndex,
          isAbsent
        );

        var ilrProjectionMessage;
        if (boundednessILR === "out of bounds") {
          if (continuousAbsences === -1) {
            ilrProjectionMessage = `Your projection date ${new Date(
              projectionValue
            ).toDateString()} is too early relative to your earliest valid ILR qualifying period. (Out of bounds to the left.)`;
          } else {
            // continuousAbsences === -2
            ilrProjectionMessage = `Your projection date ${new Date(
              projectionValue
            ).toDateString()} is too late relative to your earliest valid ILR qualifying period. (Out of bounds to the right.)`;
          }
        } else {
          // boundednessILR === "in bound"
          ilrProjectionMessage = `Starting from and including your specified projection date of ${new Date(
            projectionValue
          ).toDateString()}, you can be continuously absent for at most ${continuousAbsences} day(s) without violating the 180 day / year constraint of your earliest indefinite leave to remain qualifying period.`;
        }
        addDivNode("Remaining Absences on Your Projection Date for ILR", ilrProjectionMessage);
      }

      // part 2C-2: citizenship projection
      // ["out of bounds", "in RHS bound", "in FULL bound"]
      const [remainingCountFULL, remainingCountRHS, boundednessCITIZENSHIP] = projectRemainingCitizenship(
        projectionIndex,
        earliestValidCitizenshipStartIndex,
        earliestValidCitizenshipMidIndex,
        earliestValidCitizenshipEndIndex,
        isAbsent
      );
      var citizenshipProjectionMessage;
      if (boundednessCITIZENSHIP === "out of bounds") {
        if (remainingCountFULL === -1) {
          citizenshipProjectionMessage = `Your projection date ${new Date(
            projectionValue
          ).toDateString()} is too early relative to your earliest valid citizenship qualifying period. (Out of bounds to the left.)`;
        } else {
          citizenshipProjectionMessage = `Your projection date ${new Date(
            projectionValue
          ).toDateString()} is too late relative to your earliest valid citizenship qualifying period.  (Out of bounds to the right.)`;
        }
      } else {
        if (boundednessCITIZENSHIP === "in RHS bound") {
          citizenshipProjectionMessage = `Your specified projection date ${new Date(
            projectionValue
          ).toDateString()} falls into the last 1 year of your earliest citizenship qualifying period. You have ${remainingCountRHS} out of 90 absences remaining.`;
        } else {
          // boundednessCITIZENSHIP === "in FULL bound"
          citizenshipProjectionMessage = `Your specified projection date ${new Date(
            projectionValue
          ).toDateString()} falls into the first 4 years of your earliest citizenship qualifying period. You have ${remainingCountFULL} out of 450 absences remaining for the full qualifying period, and ${Math.min(
            remainingCountFULL,
            90
          )} out of 90 absences remaining for the last year of the qualifying period.`;
        }
      }
      addDivNode("Remaining Absences on Your Projection Date for Citizenship", citizenshipProjectionMessage);
    }
  }

  // step 3: if display section is empty (nothing done in step 2), show initial message
  if (displaySection.innerHTML === "") {
    addDivNode("Not Yet Submitted", "Please fill out the form and press submit.");
  }
}
