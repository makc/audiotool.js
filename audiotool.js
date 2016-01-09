function Audiotool () {
	var request = function (url, error, prepare) {
		var xhr = new XMLHttpRequest ();
		xhr.open ('GET', url);
		xhr.onerror = xhr.ontimeout = xhr.onabort = function () {
			if (error) error (); error = null;
		};
		prepare (xhr);
		xhr.send ();
	};

	var getPeaks = function (url, success, error) {
		request (url, error, function (xhr) {
			xhr.responseType = 'arraybuffer';
			xhr.onreadystatechange = function () { if (xhr.readyState == 4) {
				var i, bytes = new Uint8Array (xhr.response);

				for (i = 0; i < 4; i++) if (bytes[i] != 'PEAK'.charCodeAt (i)) return error && error ();

				var length = bytes.length;
				if (length != bytes[8] * 256 + bytes[9] + 10) return error && error ();

				var peaks = new Array (length - 10);
				for (i = 10; i < length; i++) peaks[i - 10] = bytes[i];

				success (peaks);
			}};
		});
	};

	// in case anyone needs to call this separately
	this.getPeaks = getPeaks;

	// 5am here, this better be working...
	this.getRandomTrack = function (success, error) {
		var base = 'https://api.audiotool.com/tracks/relevant/?limit=';
		request (base + 0, error, function (xhr) {
			xhr.onreadystatechange = function () { if (xhr.readyState == 4) {
				var match = xhr.response.match (/<tracks.+?count="(\d+)/);
				if (match) {
					var offset = (Math.random () * match[1]) | 0;

					request (base + '1&offset=' + offset, error, function (xhr) {
						xhr.onreadystatechange = function () { if (xhr.readyState == 4) {
							var response = xhr.response + '', track = { response: response };

							// parse important bits
							track.urls = [
								response.match (/<playbackURL.+?mpeg">([^<]+)/)[1],
								response.match (/<playbackURL.+?ogg">([^<]+)/)[1]
							];

							track.bpm = parseFloat (response.match (/<bpm>([^<]+)/)[1]);
							track.duration = parseFloat (response.match (/<duration>([^<]+)/)[1]) * 1e-3;

							// parse auxiliary bits
							track.cover = response.match (/<coverURL.+?512">([^<]+)/)[1];

							var names = response.match (/<name>([^<]+)/g);
							track.name = names[0].match (/>([^<]+)/)[1];
							track.author = names[1].match (/>([^<]+)/)[1];

							// get them peaks
							getPeaks (track.response.match (/<peaksURL.*?>([^<]+)/)[1], function (peaks) {
								track.peaks = peaks; success (track);
							}, error);
						}};
					});

				} else if (error) {
					error ();
				}
			}};
		});
	};
}