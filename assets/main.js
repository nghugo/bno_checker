import { setInputValidationMessages } from "./inputValidationMessages.js";
// import { updateDisplaySection } from "./displaySection.js";

const form = document.getElementById("form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent default submission (page reload)

  const bnoStart = document.getElementById("bnoStart");
  const projection = document.getElementById("projection");
  const absentStartCollection = document.getElementsByClassName("absentStart");
  const absentEndCollection = document.getElementsByClassName("absentEnd");
  const ilrObtainedCheckbox = document.getElementById("ilr-obtained-checkbox");
  const ilrObtainedDateField = document.getElementById("ilr-obtained-datefield");

  // add validation messages to input fields by injecting CSS classes
  // and return boolean validInputs_bool indicator
  const res = setInputValidationMessages(
    bnoStart,
    projection,
    absentStartCollection,
    absentEndCollection,
    ilrObtainedCheckbox,
    ilrObtainedDateField,
  );

  const validInputs_bool = res[0];
  const bnoStartValue = res[1];
  const projectionValue = res[2];
  const absentStartCollectionValues = res[3];
  const absentEndCollectionValues = res[4];
  const ilrObtainedCheckboxChecked = res[5];
  const ilrObtainedDateFieldValue = res[6];

  // // add text to display section for user feedback
  // updateDisplaySection(
  //   validInputs_bool,
  //   bnoStartValue,
  //   projectionValue,
  //   absentStartCollectionValues,
  //   absentEndCollectionValues,
  //   ilrObtainedCheckboxChecked,
  //   ilrObtainedDateFieldValue,
  // );
});
