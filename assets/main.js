const paragraph = document.createElement("p");
const node = document.createTextNode("THIS IS NEWLY APPENDED BY JAVASCRIPT");
paragraph.appendChild(node);

const placeholder = document.getElementById("myPlaceholder");
placeholder.before(paragraph); //append element after placeholder, rather than inside

var newHTML0 = '<div style="width:100%">New Text Via insertAdjacentHTML</div>'
placeholder.insertAdjacentHTML('beforebegin', newHTML0)



// var newHTML1 = "<div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div>"
// var newHTML2 = "<div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div>"

placeholder.insertAdjacentHTML('beforebegin', newHTML)



// <!-- DATESECTION --> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your first day outside of the UK for this period, or delete this block" > <span class="label-input100" >First day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveStart" +String(1) /> </div> <div class="wrap-input100 rs1-wrap-input100 validate-input" data-validate="Please enter your last day outside of the UK for this period, or delete this block" > <span class="label-input100" >Last day outside of the UK for this interval of time *</span > <input class="input100" type="date" name="leaveEnd" +String(1) /> </div> <!-- DATESECTION -->