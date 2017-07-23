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


var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {

        console.log("Begin onDeviceReady");

        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();


var gLocalStorage = window.localStorage;
var gInitializedWithLocalStorage = false;
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
    $(document).on("click", ".viewNavigator", ShowView);

});


function SessionSelectorClicked() {
    // The this variable is the selected html element (the Star that got clicked on)
    var sessionSelectorId = $(this).attr('id');
    console.log("Begin SessionSelectorClicked. sessionSelectorId = " + sessionSelectorId);

    var star = $("#" + sessionSelectorId);
    var rawId = sessionSelectorId.replace("sessionSelector", "");
    var sessionRowId = "sessionRow" + rawId;
    var sessionRow = $("#" + sessionRowId);
    console.log("sessionRowId = " + sessionRowId);

    // If already selected then deselect it.
    if (star.hasClass('StarSelected')) {
        // Do deselect
        star.attr('class', 'sessionSelector fa fa-star-o fa-lg');

        var storedSessionId = gLocalStorage.getItem(sessionSelectorId);
        //If the key is there, remove it.
        if (storedSessionId != null) {
            gLocalStorage.removeItem(sessionSelectorId);
        }



        if (!sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.addClass('sessionNotSelected');
            if (gShowStarredSessionsOnly) {
                ShowStarredSessions();
            }
        }        
    } else {
        // Do select
        star.attr('class', 'StarSelected sessionSelector fa fa-star fa-lg');
        star.attr('style', 'color:forestgreen');

        var storedSessionId = gLocalStorage.getItem(sessionSelectorId);
        //If the key is not set, track it.
        if (storedSessionId == null) {
            gLocalStorage.setItem(sessionSelectorId, sessionSelectorId);
        }


        if (sessionRow.hasClass('sessionNotSelected')) {
            sessionRow.removeClass('sessionNotSelected');
        }
    }

} 

function selectSessionSelector(sessionSelectorId) {

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
}

function ShowStarredSessions() {
    console.log("ShowStarredSessionsClicked");
    gShowStarredSessionsOnly = true;
    $('#viewTitle').html('Starred');
    $('.sessionNotSelected').hide();
}

function ShowAllSessions() {
    console.log("ShowAllSessionsClicked");
    $('#viewTitle').html('Schedule');
    gShowStarredSessionsOnly = false;
    $('.sessionRow').show();
}

function ShowView() {
    var targetView = $(this).attr("destinationView");
    var targetViewEle = $("#" + targetView);


    if (targetView == "schedView") {
        if (gInitializedWithLocalStorage == false) {
            //Loads stored selectedIds to highlight the UI
            for (i = 0; i < gLocalStorage.length; i++) {
                var key = gLocalStorage.key(i);

                if (key.indexOf("sessionSelector") >= 0) {
                    selectSessionSelector(key);
                }
            }
            gInitializedWithLocalStorage = true;
        }
        var filterMode = $(this).attr("filterMode");

        if (filterMode == "starred") {
            ShowStarredSessions();
        } else {
            ShowAllSessions();
        }
    } else {
        var title = targetViewEle.attr("pageViewTitle");
        $('#viewTitle').html(title);
    }


    $(".pageView").each(function () {
        $(this).hide();
    });

    targetViewEle.show();

   
}

