# calendar

edit/view to toggle edit/readonly mode.  Only authorized users would have this option; the rest are readonly without the toggle.

use < & > to move through months; there's some oddity around january of this year.

in Edit mode, use 'add group' to add a grouping of users for each day.  Current calendar has "events" (eg AM, PM, etc)
and also "groups" (e.g. cardiologists).  These have been combined here, for ease of use, and "Cardiologist" or "AM" or
"Cardiologist/AM" work.

Once there's a group tap the add person button to add a user to that group.  Multiple groups = multiple add buttons.

I generated the person list by mixing the last last names in oncall with the first first names.  

use the x to remove the person, or the pencil to write a comment.  leaving the comment saves it, so remove the text to delete.
there is no 'cancel' to simply the interface.  The comments are similar to "AM only" or "starts at 9", etc.

needed:
- css/ux improvements
- add comments to group and/or to date (I forget which is used)
- page (current calender uses name to open a ppd search page in an iframe; Handoffs uses an oncall paging service with the
pager id which is stored in the db; unclear which was best to do...)
- add/edit/create calendars
- edit other calendar features
- determine calendar editors
- determine persons
- backend
"etc"
