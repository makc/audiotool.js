#### What's this? ####

Just a script to help you use Audiotool in your fiddles.


#### How to use? ####

Include audiotool.js and then do something like this:

```javascript
audiotool.getRandomTrack (function (track) {
	var div = document.createElement ('div');
	div.innerHTML = 'Random track: ' + track.name + '<br />\
		<audio controls autoplay>\
			<source src="' + track.urls[0] + '" type="audio/mpeg">\
			<source src="' + track.urls[1] + '" type="audio/ogg">\
		</audio>';
	document.body.appendChild (div);
});
```