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
				var bytes = new Uint8Array (xhr.response);

				if (bytes[0] != 'P'.charCodeAt (0)) return error && error ();
				if (bytes[1] != 'E'.charCodeAt (0)) return error && error ();
				if (bytes[2] != 'A'.charCodeAt (0)) return error && error ();
				if (bytes[3] != 'K'.charCodeAt (0)) return error && error ();

				var length = bytes.length;
				if (length != bytes[8] * 256 + bytes[9] + 10) return error && error ();

				var peaks = new Array (length - 10);
				for (var i = 10; i < length; i++) peaks[i - 10] = bytes[i];

				success (peaks);
			}};
		});
	};

	// in case anyone needs to call this separately
	this.getPeaks = getPeaks;

	// 5am here, this better be working...
	this.getRandomTrack = function (success, error) {
		request ('https://api.audiotool.com/tracks/relevant/?limit=0', error, function (xhr) {
			xhr.onreadystatechange = function () { if (xhr.readyState == 4) {
				var match = xhr.response.match (/<tracks offset="0" limit="0" count="(\d+)"/);
				if (match) {
					var offset = (Math.random () * match[1]) | 0;

					request ('https://api.audiotool.com/tracks/relevant/?limit=1&offset=' + offset, error, function (xhr) {
						xhr.onreadystatechange = function () { if (xhr.readyState == 4) {
							var track = {
								response: xhr.response.toString ()
							};

							// parse important bits
							track.urls = [
								track.response.match (/<playbackURL mime-type="audio\/mpeg">([^<]+)/)[1],
								track.response.match (/<playbackURL mime-type="application\/ogg">([^<]+)/)[1]
							];

							track.bpm = parseFloat (track.response.match (/<bpm>([^<]+)/)[1]);

							// parse auxiliary bits
							track.cover = track.response.match (/<coverURL width="512" height="512">([^<]+)/)[1];

							var names = track.response.match (/<name>([^<]+)/g);
							track.name = names[0].match (/>([^<]+)/)[1];
							track.author = names[1].match (/>([^<]+)/)[1];

							// get them peaks
							getPeaks (track.response.match (/<peaksURL mime-type="application\/octet-stream">([^<]+)/)[1], function (peaks) {
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