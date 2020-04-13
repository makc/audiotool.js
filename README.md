#### What's this? ####

Just a script to help you use Audiotool in your fiddles.


#### How to use? ####

Include [audiotool.js](https://makc.github.io/audiotool.js/audiotool.js) and then do something like [this](https://jsfiddle.net/rkwL26bz/):

```javascript
var audiotool = new Audiotool ();
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


#### CORS error ####

Currently their API has a bug that prevents this script from working. It is [unlikely](https://twitter.com/andremichelle/status/1245564907581554688) that they will fix it.
