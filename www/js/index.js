/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var gSurveyReceiver = "jenmaseda@metrowestconferenceforwomen.com";
var gSurveyEmailSubject = "Feedback";
var gSurveyEmailBody = "Please provide your feedback:";
var gSurveyHref = "mailto:" + gSurveyReceiver + "?subject=" + gSurveyEmailSubject + "&body=" + gSurveyEmailBody;

// Currently not using a Survey Google Feedback form.
//var gSurveyWebPageUrl = "https://goo.gl/forms/sv0fOr4uRf8v1z0A3"

var gLocalStorage = window.localStorage;
var gInitializedWithLocalStorage = false;

var gOverviewLoaded = false;
var gExhibitorsLoaded = false;
var gSponsorsLoaded = false;
var gAboutUsLoaded = false;

var gActiveView = "homeView";
var gActiveGoBackTitle = "Home";
var gIsGoingBackToActiveView = false;

var gIsShowStarredSessionsOnly = false;

var gCompliedSessionDetailTemplate = null;
var gSpeakers = null;





var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    onDeviceReady: function () {

        console.log("onDeviceReady begin");

        if (!window.device) {
            window.device = { platform: 'Browser' };
        }

        Handlebars.registerHelper('GetLocalTimeLabel', GetLocalTimeFromUtcDateTimeString);

        $.getJSON("data/schedule.json", function (data) {
            var jsonRoot = {};
            jsonRoot.sessions = data;
            var schedTemplate = $("#scheduleTemplate").html();
            var compliedSchedTemplate = Handlebars.compile(schedTemplate);
            var generatedHTML = compliedSchedTemplate(jsonRoot);
            $("#scheduleRegion").append(generatedHTML);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Get schedule data failed: " + err);
            });


        $.getJSON("data/speakers.json", function (data) {
            gSpeakers = data;

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Get speakers data failed: " + err);
            });

        console.log("Start preparing the session detail UI template to be bind with a selected session.");

        var sessionDetailTemplate = $("#sessionDetailTemplate").html();
        gCompliedSessionDetailTemplate = Handlebars.compile(sessionDetailTemplate);

        console.log("Completed preparing the session detail UI template.");


        $(document).on("click", ".sessionSelector", SessionSelectorClicked);
        $(document).on("click", ".viewNavigator", ShowView);
        $(document).on("click", ".sessionDetailNavigator", ShowSessionDetail);
        $(document).on("click", "#overviewNavigator", ShowOverview);
        $(document).on("click", "#aboutUsNavigator", ShowAboutUs);
        $(document).on("click", "#goBackNavigator", GoBackClicked);
        $(document).on("click", "#exhibitorsNavigator", ShowExhibitors);
        $(document).on("click", "#sponsorsNavigator", ShowSponsors);

        $("#launchEmailClientForSurvey").attr("href", gSurveyHref);

        $("#loadingStatus").hide();
        $("#navigationPanel").fadeIn(300);
        $("#homeLogo").fadeIn(300);
        $("#footer").slideDown(300);
        $("#header").slideDown(300);

        console.log("onDeviceReady Completed");
    }
};

app.initialize();



function ShowView() {
    console.log("ShowView begin");

    var targetView = null;

    if (gIsGoingBackToActiveView) {
        targetView = gActiveView;
        gIsGoingBackToActiveView = false;
    } else {
        targetView = $(this).attr("destinationView");
    }
    var targetViewEle = $("#" + targetView);

    if (targetView !== "surveyView") {
        gActiveView = targetView;
    }

    if (targetView === "surveyView") {

        if (device.platform.toUpperCase() === 'IOS' || device.platform.toUpperCase() === 'BROWSER') {
            window.open(gSurveyHref);
        } else if (device.platform.toUpperCase() === 'ANDROID') {
            navigator.app.loadUrl(gSurveyHref);
        }

        //Not used at this point. The Survey link uses mailto: in the href.
        //if (device.platform.toUpperCase() === 'IOS' || device.platform.toUpperCase() === 'BROWSER') {
        //    window.open(gSurveyWebPageUrl, '_system');
        //} else if (device.platform.toUpperCase() === 'ANDROID') {
        //    navigator.app.loadUrl(gSurveyWebPageUrl, { openExternal: true });
        //}
        return;
    }

    if (targetView === "schedView") {

        if (gInitializedWithLocalStorage === false) {
            //Loads stored selected session IDs to restore selected session in the schedule
            for (i = 0; i < gLocalStorage.length; i++) {
                var key = gLocalStorage.key(i);
                if (key.indexOf("sessionSelector") >= 0) {
                    SelectSessionSelector(key);
                }
            }
            gInitializedWithLocalStorage = true;
        }

        var filterMode = $(this).attr("filterMode");
        console.log("The schedView's filterMode is " + filterMode);

        if (filterMode === "starred") {
            ShowStarredSessionsOnly();
        } else {
            ShowAllSessions();
        }
    } else {
        var title = targetViewEle.attr("pageViewTitle");
        gActiveGoBackTitle = title;
        $("#viewTitle").html(title);
    }

    if (targetView === "homeView") {
        gActiveGoBackTitle = "Home";
    }

    $(".pageView").each(function () {
        $(this).hide();
    });

    targetViewEle.show();
    $(".footer").show();
    $("#goBackNavigator").hide();

    console.log("ShowView completed");
}



function SessionSelectorClicked() {
    // The this variable is the selected html element (the Star that got clicked on)
    var sessionSelectorId = $(this).attr('id');
    console.log("SessionSelectorClicked begin. sessionSelectorId = " + sessionSelectorId);

    var star = $(this);
    var rawId = sessionSelectorId.replace("sessionSelector", "");
    var sessionRowId = "sessionRow" + rawId;
    var sessionRow = $("#" + sessionRowId);
    console.log("sessionRowId = " + sessionRowId);

    var storedSessionId = null;

    // If already selected then deselect it.
    if (star.hasClass('StarSelected')) {
        // Do deselect
        console.log("In SessionSelectorClicked - Do deselect begin");
        star.attr('class', 'sessionSelector fa fa-star-o fa-lg');

        storedSessionId = gLocalStorage.getItem(sessionSelectorId);
        //If the key is there, remove it.
        if (storedSessionId !== null) {
            gLocalStorage.removeItem(sessionSelectorId);
            console.log("In SessionSelectorClicked - Remove sessionSelectorId from storage: " + sessionSelectorId);
        }

        if (!sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.addClass('sessionNotSelected');
            if (gIsShowStarredSessionsOnly) {
                ShowStarredSessionsOnly();
            }
        } 
        console.log("In SessionSelectorClicked - Do deselect completed");
    } else {
        // Do select
        console.log("In SessionSelectorClicked - Do select begin");

        star.attr('class', 'StarSelected sessionSelector fa fa-star fa-lg');
        star.attr('style', 'color:forestgreen');

        storedSessionId = gLocalStorage.getItem(sessionSelectorId);
        //If the key is not set, track it.
        if (storedSessionId === null) {
            gLocalStorage.setItem(sessionSelectorId, sessionSelectorId);
        }

        if (sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.removeClass('sessionNotSelected');
        }
        console.log("In SessionSelectorClicked - Do select completed");
    }

    console.log("SessionSelectorClicked completed");
} 


function SelectSessionSelector(sessionSelectorId) {
    console.log("SelectSessionSelector begin");

    var star = $("#" + sessionSelectorId);
    var rawId = sessionSelectorId.replace("sessionSelector", "");
    var sessionRowId = "sessionRow" + rawId;
    var sessionRow = $("#" + sessionRowId);

    // Do select
    star.attr('class', 'StarSelected sessionSelector fa fa-star fa-lg');
    star.attr('style', 'color:forestgreen');

    if (sessionRow.hasClass('sessionNotSelected')) {
        sessionRow.removeClass('sessionNotSelected');
    }

    console.log("SelectSessionSelector completed");
}


function ShowStarredSessionsOnly() {
    console.log("ShowStarredSessionsOnly begin");

    gIsShowStarredSessionsOnly = true;
    gActiveGoBackTitle = "Starred";
    $('#viewTitle').html('Starred');
    $('.sessionNotSelected').fadeOut(300);

    console.log("ShowStarredSessionsOnly completed");
}


function ShowAllSessions() {
    console.log("ShowAllSessions begin");

    gActiveGoBackTitle = "Schedule";
    $('#viewTitle').html('Schedule');
    gIsShowStarredSessionsOnly = false;
    $('.sessionRow').fadeIn(300);

    console.log("ShowAllSessions completed");
}


function ShowSessionDetail() {
    console.log("ShowSessionDetail begin");

    $(".pageView").each(function () {
        $(this).hide();
    });

    $("#goBackLabel").html(gActiveGoBackTitle);
    $("#goBackNavigator").show();

    var targetViewEle = $("#sessionDetailModalView");

    var title = targetViewEle.attr("pageViewTitle");
    $("#viewTitle").html(title);

    var sessionRow = $(this).parents(".sessionRow");
    var sessionRowId = sessionRow.attr("id");

    //Retrieve and set the time.
    var startTimeEle = $("#" + sessionRowId + " th a span").filter(".startTime");
    var startTime = $(startTimeEle).html();
    var endTimeEle = $("#" + sessionRowId + " th a span").filter(".endTime");
    var endTime = $(endTimeEle).html();

    var sessionDetail = {};
    sessionDetail.startTime = startTime;
    sessionDetail.endTime = endTime;

    //Retrieve and set the speech title.
    var speechTitleEle = $("#" + sessionRowId + " td div p span").filter(".eventTitle");
    var speechTitle = $(speechTitleEle).html();
    sessionDetail.speechTitle = speechTitle;

    //Retrieve and set the location.
    var locationEle = $("#" + sessionRowId + " td div p span").filter(".eventLocation");
    var location = $(locationEle).html();
    sessionDetail.location = location;
    
    var speakerEle = $("#" + sessionRowId + " td div p span").filter(".eventSpeaker");
    var speakersToBeMatched = $(speakerEle).html();

    $(gSpeakers).each(function (index) {
        var speaker = this.name;
        if (speakersToBeMatched.indexOf(speaker) >= 0) {
            this.show = true;
        } else {
            this.show = false;
        }
    });

    sessionDetail.speakerInfoItems = gSpeakers;

    var generatedHTML = gCompliedSessionDetailTemplate(sessionDetail);
    $("#sessionDetailRegion").html(generatedHTML);

    //Retrieve and set star state.
    var rawId = sessionRowId.replace("sessionRow", "");
    var starEle = $("#sessionSelector" + rawId);
    var starInSessionDetail = $("#sessionDetailSelector");
    starInSessionDetail.attr("sessionRawId", rawId)

    if (starEle.attr("class").indexOf("StarSelected") >= 0) {
        starInSessionDetail.attr('class', 'StarSelected fa fa-star fa-lg');
        starInSessionDetail.attr('style', 'color:forestgreen');
    } else {
        starInSessionDetail.attr('class', 'fa fa-star-o fa-lg');
    }

    $(document).off("click", "#sessionDetailSelector", starInSessionDetailClicked);
    $(document).on("click", "#sessionDetailSelector", starInSessionDetailClicked);

    sessionDetail = null;

    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowSessionDetail completed");
}

function starInSessionDetailClicked() {


    var starEle = $(this);

    if (starEle.attr("class").indexOf("StarSelected") >= 0) {
        //If selected, do deselect.
        starEle.attr('class', 'fa fa-star-o fa-lg');
    } else {
        //If not selected, do select.
        starEle.attr('class', 'StarSelected fa fa-star fa-lg');
        starEle.attr('style', 'color:forestgreen');
    }

    //Click the corresponding star in the schedule.
    var rawId = starEle.attr("sessionRawId");
    var starFromSched = $("#sessionSelector" + rawId);
    starFromSched.click();

}

function ShowOverview() {
    console.log("ShowOverview begin");

    $(".pageView").each(function () {
        $(this).hide();
    });

    var targetViewEle = $("#overviewModalView");

    var title = targetViewEle.attr("pageViewTitle");
    $("#viewTitle").html(title);

    $("#goBackLabel").html(gActiveGoBackTitle);
    $("#goBackNavigator").show();

    $("#overviewRegion").load("data/overview.html #overviewContent"); 

    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowOverview completed");
}


function ShowAboutUs() {
    console.log("ShowAboutUs begin");

    $(".pageView").each(function () {
        $(this).hide();
    });

    var targetViewEle = $("#aboutUsModalView");

    var title = targetViewEle.attr("pageViewTitle");
    $("#viewTitle").html(title);

    $("#goBackLabel").html(gActiveGoBackTitle);
    $("#goBackNavigator").show();

    $("#aboutUsRegion").load("data/aboutUs.html #aboutUsContent");

    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowAboutUs completed");
}


function ShowExhibitors() {
    console.log("ShowExhibitors begin");

    $(".pageView").each(function () {
        $(this).hide();
    });

    var targetViewEle = $("#exhibitorsModalView");

    var title = targetViewEle.attr("pageViewTitle");
    $("#viewTitle").html(title);

    $("#goBackLabel").html(gActiveGoBackTitle);
    $("#goBackNavigator").show();

    if (gExhibitorsLoaded === false) {

        $.getJSON("data/exhibitors.json", function (data) {
            var jsonRoot = {};
            jsonRoot.exhibitors = data;
            var exhTemplate = $("#exhibitorsTemplate").html();
            var compliedExhTemplate = Handlebars.compile(exhTemplate);
            var generatedHTML = compliedExhTemplate(jsonRoot);
            $("#exhibitorsRegion").append(generatedHTML);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Get exhibitors data failed: " + err);
            });
        gExhibitorsLoaded = true;
    }
    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowExhibitors completed");
}

function ShowSponsors() {
    console.log("ShowSponsors begin");

    $(".pageView").each(function () {
        $(this).hide();
    });

    var targetViewEle = $("#sponsorsModalView");

    var title = targetViewEle.attr("pageViewTitle");
    $("#viewTitle").html(title);

    $("#goBackLabel").html(gActiveGoBackTitle);
    $("#goBackNavigator").show();

    if (gSponsorsLoaded === false) {

        $.getJSON("data/sponsors.json", function (data) {
            var jsonRoot = {};
            jsonRoot.sponsors = data;
            var spTemplate = $("#sponsorsTemplate").html();
            var compliedSpTemplate = Handlebars.compile(spTemplate);
            var generatedHTML = compliedSpTemplate(jsonRoot);
            $("#sponsorsRegion").append(generatedHTML);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Get sponsors data failed: " + err);
        });
        gSponsorsLoaded = true;
    }
    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowSponsors completed");
}

function GoBackClicked() {
    gIsGoingBackToActiveView = true;
    $(window).scrollTop(0);
    ShowView();
}


function GetLocalTimeFromUtcDateTimeString(utcDateTimeInString) {
    // for example, "1899-12-30T14:45:00.000Z" is 2:45 PM UTC and 9:45 AM is Eastern Standard Time.
    var timeTicks = Date.parse(utcDateTimeInString);
    var date = new Date(timeTicks);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    // The hour '0' should be '12'
    hours = hours ? hours : 12;
    // Prefix with a 0 if less than 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}



