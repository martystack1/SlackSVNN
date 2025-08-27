function deleteAllFormQuestions() {
 var form = FormApp.getActiveForm(); // Gets the currently active Google Form

 // Get all items (questions, sections, images, etc.) in the form
 var items = form.getItems();

 // Loop through the items in reverse order to avoid index issues after deletion
 for (var i = items.length - 1; i >= 0; i--) {
   var item = items[i];
   // Optional: You can add a condition here if you want to exclude certain item types from deletion.
   // For example, to keep page breaks:
   // if (item.getType() !== FormApp.ItemType.PAGE_BREAK) {
   form.deleteItem(item); // Deletes the current item
   // }
 }
 Logger.log("All questions deleted from the form.");
}
