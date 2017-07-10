// This is pseudocode it doesn't really work.  Sorry! <3
window.onload = function(){
var data = loadDataFromJson("schedule.json");
var sched = document.getElementById('schedule');
var innerHtml = "";

//TODO: Figure out a way to do this that doesn't involve complete writing
// all the HTML from Javascript lol
for (var i = 0; i < data.length; i++){
    var liString = "<li class='schedule_item'>";
    liString += "<div class='left_half'><p class='time'>" + data[i]['time'];
    liString += "</p></div>";
    // Then also add in the other pieces
    liString += "<div class='right_half'><p>Other stuff goes here.</p></div>";
    liString += "</li>";
    innerHtml += liString;
}

sched.innerHTML = innerHtml;
}

function loadDataFromJson(filename){
    //Loads the JSON from a file and stores it in an array
    //TODO: ACTUALLY LOAD DATA FROM JSONs
    var sample = [];
    sample[0] = {
        "title" : "Sample 1",
        "time" : "3:00",
        "presentor" : "Jane Doe",
        "location" : "Room 3",
        "description" : "This is a description for a schedule item." +
            "  It's real long and goes on for a few lines."
    };
    sample[1] = {
        "title" : "Sample 2",
        "time" : "4:00",
        "presentor" : "Sally Smith",
        "location" : "Room 1",
        "description" : "This is a description for a different item." +
            "  It's real long and goes on for a few lines."
    };
    return sample;
}
