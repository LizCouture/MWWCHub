// This is pseudocode it doesn't really work.  Sorry! <3

var data = loadDataFromJson("schedule.json");
var sched = document.getElementById('schedule');
var innerHtml = "";

for (var i = =; i < data.length; i++){
    var liString = "<li class='schedule_item'>";
    liString += "<div class='left_side'><p class='time'>" + data[i]['time'];
    liString += "</p></div>";
    // Then also add in the other pieces
    liString += "</li>";
    innerHTML += liString;
}

sched.innerHtml = innerHTML;

function loadDataFromJson(filename){
    //Loads the JSON from a file and stores it in an array
}
