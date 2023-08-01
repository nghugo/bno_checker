import { getArrays } from "./compute.js";
import { validBNO } from "./compute.js";
 
export function updateDisplaySection(
  validInputs_bool,
  bnoStartValue,
  projectionValue,
  absentStartCollectionValues,
  absentEndCollectionValues
) {
  function addPNode(textMessage) {
    const para = document.createElement("p");
    const text = document.createTextNode(textMessage);
    para.appendChild(text);
    const displaySection = document.getElementById("displaySection");
    displaySection.append(para);
  }

  // step 1: clear display section first
  const displaySection = document.getElementById("displaySection");
  displaySection.innerHTML = "";

  // step 2: add messages to display section
  if (!validInputs_bool) {
    addPNode(`Please submit again with valid input values.`);
  } else {
    const res = getArrays(
      bnoStartValue,
      absentStartCollectionValues,
      absentEndCollectionValues
    );
    const inUK = res[0];
    const isFeb29 = res[1];

    const res2 = validBNO(inUK, isFeb29, bnoStartValue, projectionValue);
    const validPeriod = res2[0];
    const firstInvalid = res2[1];
    const earliestRestartDate = res2[2];
    const remainingAbsences = res2[3];

    if (validPeriod) {
      addPNode(
        `Your 5-year qualifying period towards Indefinite Leave to Remain is valid.`
      );

      if (projectionValue != "") {
        const projectionDate = new Date(projectionValue);
        addPNode(
          `On projection date ${projectionDate.toDateString()}, you have ${remainingAbsences} remaining whole day absence(s).`
        );
      } else {
        addPNode(
          `Since you have not provided a projection date, no remaining whole day absences calculation was carried out.`
        );
      }
    } else {
      addPNode(
        `Your 5-year qualifying period towards Indefinite Leave to Remain is invalid, hence remaining absences cannot be computed.`
      );
      addPNode(
        `According to your specified whole day absences, the earliest date you can restart another 5-year qualifying period towards a valid Indefinite Leave To Remain is ${earliestRestartDate.toDateString()}. You can check for the the new qualifying period to BNO by entering the new start date in the above form.`
      );
    }
  }

  // step 3: if display section is still empty, show alt message
  if (displaySection.innerHTML === "") {
    addPNode("Please fill out the form and press submit");
  }
}
