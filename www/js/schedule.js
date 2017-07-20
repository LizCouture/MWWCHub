var gShowStarredSessionsOnly = false;


$(document).ready(function () {

    console.log("Start Init");

    $.getJSON("scheduleData.json", function (data) {

        var template = $("#scheduleTemplate").html();
        var compliedTemplate = Handlebars.compile(template);
        var generatedHTML = compliedTemplate(data);
        $("#scheduleRegion").append(generatedHTML);

    });

    $(document).on("click", ".sessionSelector", SessionSelectorClicked);
    $(document).on("click", "#ShowStarredSessions", ShowStarredSessions);
    $(document).on("click", "#ShowAllSessions", ShowAllSessions);
});


function SessionSelectorClicked() {
    // The this variable is the selected html element (the Star that got clicked on)
    var sessionSelectorId = $(this).attr('id')
    console.log("Begin SessionSelectorClicked. sessionSelectorId = " + sessionSelectorId);

    var star = $("#" + sessionSelectorId)
    var rawId = sessionSelectorId.replace("sessionSelector", "");
    var sessionRowId = "sessionRow" + rawId
    var sessionRow = $("#" + sessionRowId)
    console.log("sessionRowId = " + sessionRowId);

    // If already selected then unselect it.
    if (star.hasClass('StarSelected')) {
        // Do unselect
        star.attr('class', 'sessionSelector fa fa-star-o fa-lg');
        if (!sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.addClass('sessionNotSelected');
            if (gShowStarredSessionsOnly) {
                ShowStarredSessions();
            }
        }        
    } else {
        // Do selected
        star.attr('class', 'StarSelected sessionSelector fa fa-star fa-lg');
        star.attr('style', 'color:forestgreen');
        if (sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.removeClass('sessionNotSelected');
        }
    }

} 


function ShowStarredSessions() {
    console.log("ShowStarredSessionsClicked");
    gShowStarredSessionsOnly = true;
    $('#ScheduleTitle').html('Starred');
    $('.sessionNotSelected').hide();
}

function ShowAllSessions() {
    console.log("ShowAllSessionsClicked");
    $('#ScheduleTitle').html('Schedule');
    gShowStarredSessionsOnly = false;
    $('.sessionRow').show();
}
