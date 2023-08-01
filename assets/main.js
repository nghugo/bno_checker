import { updateDisplaySection } from "./displaySection.js";
import { setInputValidationMessages } from "./inputValidationMessages.js";

const form = document.getElementById("form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent default submission (page reload)

  var ilrStart = document.getElementById("ilrStart");
  var projection = document.getElementById("projection");
  var absentStartCollection = document.getElementsByClassName("absentStart");
  var absentEndCollection = document.getElementsByClassName("absentEnd");

  // add validation messages to input fields by injecting CSS classes
  // and return boolean validInputs_boolean indicator
  const res = setInputValidationMessages(
    ilrStart,
    projection,
    absentStartCollection,
    absentEndCollection
  );

  const validInputs_boolean = res[0];
  const ilrStartValue = res[1];
  const projectionValue = res[2];
  const absentStartCollectionValues = res[3];
  const absentEndCollectionValues = res[4];

  // add text to display section for user feedback
  updateDisplaySection(
    validInputs_boolean,
    ilrStartValue,
    projectionValue,
    absentStartCollectionValues,
    absentEndCollectionValues
  );
});
