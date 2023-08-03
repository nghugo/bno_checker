// window.onload = function () {
//   document.getElementById("ilr-obtain-date").disabled = true;
// };

console.log("script running")

const ilrObtainedCheckbox = document.getElementById("ilr-obtained-checkbox");
const ilrObtainedDateField = document.getElementById("ilr-obtained-datefield");

ilrObtainedCheckbox.addEventListener("change", (event) => {
    if (ilrObtainedCheckbox.checked) {
        // ilrObtainedDateField.setAttribute('required', '');
        ilrObtainedDateField.removeAttribute('disabled', '');
    } else {
        // ilrObtainedDateField.removeAttribute('required', '');
        ilrObtainedDateField.setAttribute('disabled', '');
    }
});
