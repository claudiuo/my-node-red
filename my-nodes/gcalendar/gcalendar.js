/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// TODO: implement more functions in a drop down and change the Coreo call according to the function selected

// TODO: add optional event name field

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var tsession = require("temboo/core/temboosession");
var Google = require("temboo/Library/Google/Calendar");

function GetCalendarNextItemTimestamp(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    var credentials = RED.nodes.getCredentials(n.id);

    if ((credentials) && (credentials.hasOwnProperty("clientSecret"))) { this.clientSecret = credentials.clientSecret; }
    else { this.error("No Client Secret set in credentials"); }

    if ((credentials) && (credentials.hasOwnProperty("refreshToken"))) { this.refreshToken = credentials.refreshToken; }
    else { this.error("No Refresh Token set in credentials"); }

    if ((credentials) && (credentials.hasOwnProperty("clientId"))) { this.clientId = credentials.clientId; }
    else { this.error("No Client ID set in credentials"); }

    if ((credentials) && (credentials.hasOwnProperty("tembooUsername"))) { this.tembooUsername = credentials.tembooUsername; }
    else { this.error("No Temboo Username set in credentials"); }

    if ((credentials) && (credentials.hasOwnProperty("tembooAppname"))) { this.tembooAppname = credentials.tembooAppname; }
    else { this.error("No Temboo Appname set in credentials"); }

    if ((credentials) && (credentials.hasOwnProperty("tembooAppkey"))) { this.tembooAppkey = credentials.tembooAppkey; }
    else { this.error("No Temboo Appkey set in credentials"); }

    var session = new tsession.TembooSession(this.tembooUsername, this.tembooAppname, this.tembooAppkey);

    if ((credentials) && (credentials.hasOwnProperty("calendarId"))) { this.calendarId = credentials.calendarId; }
    else { this.error("No Calendar ID set in credentials"); }

    this.on("input",function(msg) {

        var getNextEventChoreo = new Google.GetNextEvent(session);

        // Instantiate and populate the input set for the choreo
        var getNextEventInputs = getNextEventChoreo.newInputSet();

        // Set inputs
        getNextEventInputs.set_ClientSecret(this.clientSecret);
        getNextEventInputs.set_RefreshToken(this.refreshToken);
        getNextEventInputs.set_ClientID(this.clientId);
        getNextEventInputs.set_CalendarID(this.calendarId);

        // Run the choreo, specifying success and error callback handlers
            node.status({fill:"blue",shape:"dot",text:"connected"});
            getNextEventChoreo.execute(
            getNextEventInputs,
            function(results){
                var msg = {};
                var response = results.get_Response();
                var jsonRes = JSON.parse(response);
                // check in case we got no response
                if(jsonRes != undefined && jsonRes != {} && jsonRes.start != undefined) {
                    var eventDate = new Date(jsonRes.start.dateTime);
                    msg.payload = eventDate.getTime();
                }
                console.log(msg.payload);
                node.status({});
                node.send(msg);
            },
            function(error){
                node.status({});
                console.log(error.type);
                console.log(error.message);
                node.send(null);
            }
        );
    });
}

RED.nodes.registerType("gcalendar",GetCalendarNextItemTimestamp);

// credentials helper functions
var querystring = require('querystring');

RED.httpAdmin.get('/gcalendar/:id',function(req,res) {
    var credentials = RED.nodes.getCredentials(req.params.id);
    if (credentials) {
        res.send(JSON.stringify({clientSecret:credentials.clientSecret,
                        refreshToken:credentials.refreshToken,
                        clientId:credentials.clientId,
                        tembooUsername:credentials.tembooUsername,
                        tembooAppname:credentials.tembooAppname,
                        tembooAppkey:credentials.tembooAppkey,
                        calendarId:credentials.calendarId
                }));
    } else {
        res.send(JSON.stringify({}));
    }
});

RED.httpAdmin.delete('/gcalendar/:id',function(req,res) {
    RED.nodes.deleteCredentials(req.params.id);
    res.send(200);
});

RED.httpAdmin.post('/gcalendar/:id',function(req,res) {
    var body = "";
    req.on('data', function(chunk) {
        body+=chunk;
    });
    req.on('end', function(){
        var newCreds = querystring.parse(body);
        var credentials = RED.nodes.getCredentials(req.params.id)||{};

        if (newCreds.clientSecret == null || newCreds.clientSecret == "") {
            delete credentials.clientSecret;
        } else {
            credentials.clientSecret = newCreds.clientSecret;
        }

        if (newCreds.refreshToken == null || newCreds.refreshToken == "") {
            delete credentials.refreshToken;
        } else {
            credentials.refreshToken = newCreds.refreshToken;
        }

        if (newCreds.clientId == null || newCreds.clientId == "") {
            delete credentials.clientId;
        } else {
            credentials.clientId = newCreds.clientId;
        }

        if (newCreds.tembooUsername == null || newCreds.tembooUsername == "") {
            delete credentials.tembooUsername;
        } else {
            credentials.tembooUsername = newCreds.tembooUsername;
        }

        if (newCreds.tembooAppname == null || newCreds.tembooAppname == "") {
            delete credentials.tembooAppname;
        } else {
            credentials.tembooAppname = newCreds.tembooAppname;
        }

        if (newCreds.tembooAppkey == null || newCreds.tembooAppkey == "") {
            delete credentials.tembooAppkey;
        } else {
            credentials.tembooAppkey = newCreds.tembooAppkey;
        }

        if (newCreds.calendarId == null || newCreds.calendarId == "") {
            delete credentials.calendarId;
        } else {
            credentials.calendarId = newCreds.calendarId;
        }

        RED.nodes.addCredentials(req.params.id,credentials);
        res.send(200);
    });
});
