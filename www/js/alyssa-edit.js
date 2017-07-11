window.onload = function(){
    var data = loadDataFromJson("sampleData.json");
    var sched = document.getElementById('schedule');
    var innerHtml = "";


    //TODO: Figure out a way to do this that doesn't involve complete writing
    // all the HTML from Javascript lol
    for (var i = 0; i < data.length; i++){
        $("#schedule").load("./schedule_block.html");
        /*    var liString = "<li class='scheduleTesting_item'>";
              liString += "<div class='left_half'><p class='time'>" + data[i]['time'];
              liString += "</p></div>";
        // Then also add in the other pieces
        liString += "<div class='right_half'><p>Other stuff goes here.</p></div>";
        liString += "</li>";
        innerHtml += liString;*/
    }

}

function loadDataFromJson(sampleData){
    //Loads the JSON from a file and stores it in an array
    var scheduledata = [];
    scheduledata[0] = 
    {
        "speechTitle": "Open Your Own Damn Door",
        "startTime": "9:00am", "endTime": "10:00am",
        "location": "Sample Room",
        "speaker": "Dr.Patti Fletcher, Nicole Sahin",
        "description": "This is where you would put the description for this Keynote"
    };
    scheduledata[1] = 
    {
        "speechTitle": "A HEALTHY YOU - THE FOUNDATION OF SUCCESS",
        "startTime": "2:00pm",
        "endTime": "3:00pm",
        "location": "Other Room",
        "speaker": "Rachael Rubin, Linda Townsend, Lisa Vasile, Jenna Stockwell",
        "description": "Describe this speech here."
    };
    scheduledata[3] =
    {
        "speechTitle": "INNOVATION LEADERS - FORGING NEW MINDSETS",
        "startTime": "1:00pm",
        "endTime": "2:00pm",
        "location": "Sample Room",
        "speaker": "Bobbie Carlton, Carol Fishman Cohen, Ilyssa Greene Frey, Cheryl Kiser",
        "description": "Describe this speech over here."
    }
    return scheduledata;
}
