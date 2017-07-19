$(document).ready( function(){
    // This grabs all the data for our schedule.
    var data = loadDataFromJson("sampleData.json");

    // For each entry, we create the block, then set all the values.
    $.each(data, function(index, value){
        // This creates a <tr> element with an id of
        //   schedBlock0, schedBlock1, etc. filled with the html from
        //   schedule_block.html
        var scheduleBlock = $("<tr>", {id: 'schedBlock' + index, class: 'block shadow'});
        $(scheduleBlock).load("./schedule_block.html",
            function(){
                //When the template loads, build it from the data.
                populateSchedule(index,value);
            });

        // When we've built it, we attach it to tbody.
        var tbody = $("#schedule").find("tbody");
        tbody.append(scheduleBlock);
    });
});


function loadDataFromJson(sampleData){
    //TODO: In the future, this should load the info from json.
    // For now, we'll just build the json ourselves and return it.

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
    scheduledata[2] =
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

function populateSchedule(num, entry){
    var name = "#schedBlock" + num;
    $(name).find("span.startTime").text(entry["startTime"]);
    $(name).find("span.endTime").text(entry["endTime"]);
    $(name).find("span.speechTitle").text(entry["speechTitle"]);
    $(name).find("span.location").text(entry["location"]);
    $(name).find("span.speaker").text(entry["speaker"]);
    $(name).find("span.description").text(entry["description"]);
    //TODO: Do what we did for startTime for endTime, speechTitle, location,
    //  and speaker here.
        
}
