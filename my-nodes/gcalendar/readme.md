Simple node-red node that reads next event from a given Google Calendar and outputs the timestamp of this event, if found.

First version used credentials stored in settings.js but since this is not the right way of doing things, current version stores the settings in the credentials file associated with the flow.

Note: this node uses Temboo to simplify authentication and so it needs the temboo node module; the module installed via npm is old; use the temboo library downloaded directly from temboo.com.
