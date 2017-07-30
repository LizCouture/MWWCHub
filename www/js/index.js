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


var gSurveyWebPageUrl = "https://goo.gl/forms/sv0fOr4uRf8v1z0A3"

var gLocalStorage = window.localStorage;
var gInitializedWithLocalStorage = false;

var gHomeViewTitle = "MetroWest Conference For Women";

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

        $.getJSON("data/schedule.json", function (data) {

            var schedTemplate = $("#scheduleTemplate").html();
            var compliedSchedTemplate = Handlebars.compile(schedTemplate);
            var generatedHTML = compliedSchedTemplate(data);
            $("#scheduleRegion").append(generatedHTML);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Get schedule data failed: " + err);
            });


        $.getJSON("data/speakers.json", function (data) {
            gSpeakers = data.speakers;

            //$(gSpeakers).each(function () {
            //    this.show = true;
            //    this.visible = false;
            //});

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
        $(document).on("click", ".eventInfo", ShowSessionDetail);
        $(document).on("click", "#overviewNavigator", ShowOverview);
        $(document).on("click", "#goBackNavigator", GoBackClicked);

        $("#loadingStatus").hide();
        $("#navigationPanel").show();

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
    gActiveView = targetView;

    if (targetView === "surveyView") {

        if (device.platform.toUpperCase() === 'IOS' || device.platform.toUpperCase() === 'BROWSER') {
            window.open(gSurveyWebPageUrl, '_system');
        } else if (device.platform.toUpperCase() === 'ANDROID') {
            navigator.app.loadUrl(gSurveyWebPageUrl, { openExternal: true });
        }
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
    $('.sessionRow').show();

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

    var sessionDetail = {};
    sessionDetail.startTime = "9:00 AM";
    sessionDetail.endTime = "10:00 AM";
    sessionDetail.speechTitle = "A Healthy You - The Foundation of Success";
    sessionDetail.speaker = "Sandra Harmon, RN, MSN, Rachael Rubin, Linda Townsend, Lisa Vasile, NP";
    sessionDetail.location = "Room 240";
    sessionDetail.speakerInfoItems = gSpeakers;

    var generatedHTML = gCompliedSessionDetailTemplate(sessionDetail);
    $("#sessionDetailRegion").html(generatedHTML);

    sessionDetail = null;

    $(".footer").hide();
    targetViewEle.show();

    console.log("ShowSessionDetail completed");
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


function GoBackClicked() {
    gIsGoingBackToActiveView = true;
    $(window).scrollTop(0);
    ShowView();
}


