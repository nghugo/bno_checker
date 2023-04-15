const paragraph = document.createElement("p");
// const node = document.createTextNode("THIS IS NEWLY APPENDED BY JAVASCRIPT");
// paragraph.appendChild(node);

const placeholder = document.getElementById("myPlaceholder");

var counter = 1

var dateSection =
  `<div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for time interval #${counter} *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for for time interval #${counter} *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div>`;
placeholder.insertAdjacentHTML("beforebegin", dateSection);  //append element after placeholder, rather than inside

counter++
var dateSection =
  `<div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for time interval #${counter} *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for for time interval #${counter} *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div>`;
placeholder.insertAdjacentHTML("beforebegin", dateSection);  //append element after placeholder, rather than inside

counter++
var dateSection =
  `<div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for time interval #${counter} *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for for time interval #${counter} *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div>`;

placeholder.insertAdjacentHTML("beforebegin", dateSection);  //append element after placeholder, rather than inside

// <!-- DATESECTION --> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div> <!-- DATESECTION -->
