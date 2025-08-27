function buildForm() {
 var form = FormApp.openById("1YfkRf05XGS_4mq-44z7f_MHUS43-YrhZRC9KHdQshW4");
  // ---- Q1: Name
 form.addTextItem()
     .setTitle("Name")
     .setRequired(true);
  // ---- Q2: Slack Username (hidden if you want to prefill later)
 var slackQ = form.addTextItem()
     .setTitle("Slack Username (auto-filled — do not edit)")
     .setRequired(true);
  // store this item’s ID so you can prefill it with Slack variable in the URL
 Logger.log("Slack Username entry ID: " + slackQ.getId());
  var dockDoors = [];


 // Generate DD02–DD54
 for (var i = 2; i <= 54; i++) {
   var label = "DD" + (i < 10 ? "0" + i : i); // ensures DD02, DD03...
   dockDoors.push(label);
 }


 // Generate PS01–PS41
 var parking = [];
 for (var j = 1; j <= 41; j++) {
   var label = "PS" + (j < 10 ? "0" + j : j);
   parking.push(label);
 }


 // Add section for Dock Doors
 form.addSectionHeaderItem().setTitle("Dock Doors");
 dockDoors.forEach(function(name) {
   form.addTextItem().setTitle(name);
 });


 // Add section for Parking Slips
 form.addSectionHeaderItem().setTitle("Parking Slips");
 parking.forEach(function(name) {
   form.addTextItem().setTitle(name);
 });
}
