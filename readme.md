## Streamer Interrogation
This is a project created in a few hours to take messages from chat that start with !question, !state, and !taunt and add them to a list that can be approved or denied by moderators. From there, they can make messages appear on stream using a browser source capture in OBS.

### Pages
- hostname:3000 : main page
- hostname:3000/admin: admin page
- hostname:3000/streamer_view: streamer page to be a browser source in OBS. (should be 800 x 800)

### Configuration
```env
TWITCH_USERNAME=Twitch username of the bot
TWITCH_OAUTH_TOKEN=0auth token of bot
TWITCH_CHANNEL=Twitch channel to monitor chat of
ALERT_IMG=URL to alert image that will appear on stream
```
