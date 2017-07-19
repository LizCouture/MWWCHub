$(document).ready( function(){
    // This grabs all the data for our schedule.
    //var data = loadDataFromJson("sampleData.json");
    //From JACK
    $.getJSON("sampleData2.json", function (data) {

        // For each entry, we create the block, then set all the values.
        $.each(data.schedules, function (index, value) {
            // This creates a <tr> element with an id of
            //   schedBlock0, schedBlock1, etc. filled with the html from
            //   schedule_block.html
            var scheduleBlock = $("<tr>", { id: 'schedBlock' + index, class: 'block shadow' });
            $(scheduleBlock).load("./schedule_block.html",
                function () {
                    //When the template loads, build it from the data.
                    populateSchedule(index, value);
                });

            // When we've built it, we attach it to tbody.
            var tbody = $("#schedule").find("tbody");
            tbody.append(scheduleBlock);
        });

    });
});


function populateSchedule(num, entry){
    var name = "#schedBlock" + num;
    var scheduleItem = $(name);
    scheduleItem.find("span.startTime").text(entry["startTime"]);
    scheduleItem.find("span.eventTitle").text(entry["speechTitle"]);

    //TODO: Do what we did for startTime for endTime, speechTitle, location,
    //  and speaker here.
        
}