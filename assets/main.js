import { setInputValidationMessages } from "./inputValidationMessages.js";
import { updateDisplaySection } from "./displaySection.js";

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
  const validInputs_bool = setInputValidationMessages(
    bnoStart,
    projection,
    absentStartCollection,
    absentEndCollection,
    ilrObtainedCheckbox,
    ilrObtainedDateField,
  );

  
  // add text to display section for user feedback    
  updateDisplaySection(
    validInputs_bool,
    bnoStart.value,
    projection.value,
    Array.from(absentStartCollection).map((element) => element.value),
    Array.from(absentEndCollection).map((element) => element.value),
    ilrObtainedCheckbox.checked,
    ilrObtainedDateField.value,
  );
});
