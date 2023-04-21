const paragraph = document.createElement("p");
// const node = document.createTextNode("THIS IS NEWLY APPENDED BY JAVASCRIPT");
// paragraph.appendChild(node);

const placeholder = document.getElementById("myPlaceholder");

var counter;
var dateSection;

window.onload = function () {
  if (counter == undefined || counter == 0) {
    document.getElementsByClassName("addminus minus")[0].disabled = true;
  }
};

function addDateSection() {
  if (counter == undefined) {
    counter = 0;
  }
  counter += 1;
  document.getElementsByClassName("addminus minus")[0].disabled = false;
  dateSection = `
  <div
    class="wrap-input rs1-wrap-input validateInput"
    id="dateSectionLeft${counter}"
    invalidInputMessage="First day outside of the UK is required and needs to be after ILR start date"
  >
    <span class="label-input"
      >First day outside of the UK (interval ${counter}) *</span
    >
    <input class="input leaveStart" type="date" name='leaveStart${counter}' max="9999-12-31"/>
    <div class="error"></div>
  </div>
  <div
    class="wrap-input rs1-wrap-input validateInput"
    id="dateSectionRight${counter}"
    invalidInputMessage="Last day outside of the UK is required and needs to be after 1. ILR start date and 2. first day outside of the UK"
  >
    <span class="label-input"
      >Last day outside of the UK (interval ${counter}) *</span
    >
    <input class="input leaveEnd" type="date" name='leaveEnd${counter}' max="9999-12-31"/>
    <div class="error"></div>
  </div>
    `;
  placeholder.insertAdjacentHTML("beforebegin", dateSection); //append element after placeholder, rather than inside
}

function removeDateSection() {
  if (counter > 0) {
    // Only perform action when counter is positive
    if (confirm("Delete the bottom-most time interval?")) {
      document.getElementById(`dateSectionLeft${counter}`).remove();
      document.getElementById(`dateSectionRight${counter}`).remove();
      counter -= 1;
    }
  }
  if (counter == 0) {
    document.getElementsByClassName("addminus minus")[0].disabled = true;
  }
}
