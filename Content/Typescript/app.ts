///<reference path='Definitions/jquery.d.ts' />

class FacebookAbuser {
	contentIds: string[] = [];
	accessToken: string = null;
	targetId: string;
	dataRequestLimit: number;

	constructor() { }

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	getContentIds(targetId: string, dataRequestLimit: number, logElement: HTMLElement,
		callback: (ids: string[], error: string) => void) {

		if (this.accessToken == null) {
			callback(null, "Missing Access Token");
			return;
		}

		this.targetId = targetId;
		this.dataRequestLimit = dataRequestLimit;

		var types = {
			0: "feed", 
			1: "photos", 
			2: "photos/uploaded", 
			3: "videos", 
			4: "videos/uploaded", 
			5: "albums"
		};

		var ajax = [];
		for (var type in types) {
			var url = "https://graph.facebook.com/" + targetId + "/" + types[type] + "/?access_token=" +
				this.accessToken + "&limit=" + this.dataRequestLimit + "&fields=comments.fields(id),id";
			ajax.push($.getJSON(url));
		}

		$.when.apply($, ajax).done(() => {
			var ids = [];
			for (var i = 0, len = ajax.length; i < len; i++) {
				if (arguments[i][1] != "success") continue;
				var response = arguments[i][0];
				if (response.data == null) continue;

				for (var k = 0; k < response.data.length; k++) {
					ids.push(response.data[k].id);
					logElement.innerHTML += "Added: " + response.data[k].id + "\n";
					logElement.scrollTop = logElement.scrollHeight;

					if (response.data[k].comments == null || response.data[k].comments.data == null) continue;
					for (var z = 0; z < response.data[k].comments.data.length; z++) {
						ids.push(response.data[k].comments.data[z].id);
						logElement.innerHTML += "Added: " + response.data[k].comments.data[z].id + "\n";
						logElement.scrollTop = logElement.scrollHeight;
					}
				}
			}
			callback(ids, null);
		}).fail(() => {
			callback(null, arguments[0].responseJSON.error.message);
		});
	}

	likeContent(contentIds: string[], logElement: HTMLElement, callback: (error: string) => void) {

		if (this.accessToken == null) {
			callback("Missing Access Token");
			return;
		}


	}
}

window.onload = () => {
	var fbAbuser = new FacebookAbuser();

	$('#fb-content-gathering').click(() => {
		var accessToken = $('#fb-access-token').attr('value');
		var targetId = $('#fb-target-id').attr('value');
		var requestLimit = parseInt($('#fb-request-limit').attr('value'));

		// Set Access Token
		fbAbuser.setAccessToken(accessToken);

		// Get Content Ids
		fbAbuser.getContentIds(targetId, requestLimit, $('#debug-id-log-area').get(0), (ids, error) => {
			if (error) {
				$('#debug-id-log-area').get(0).innerHTML = "";
				alert("There was an error loading items: " + error);
				return;
			}

			// Show the next stage
			$('#abuse-controls').css('display', 'block');
			$('#like-count').text(ids.length.toString());

			$('#fb-start-abuse').click(() => {
				if (!confirm("Are you realllllly sure?")) return;

				fbAbuser.likeContent(ids, $('#debug-like-abuse-area').get(0), error => {
					if (error == null) {
						$('#debug-like-abuse-area').get(0).innerHTML = "";
						alert("Error liking content: " + error);
						return;
					}

					// liking was all gucci
				});
			});
		});
	});
};