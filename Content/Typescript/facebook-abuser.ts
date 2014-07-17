///<reference path='Definitions/jquery.d.ts' />
///<reference path='security.ts' />

// ReSharper disable once DuplicatingLocalDeclaration
class FacebookAbuser {
	contentIds: string[] = [];
	accessToken: string = null;
	targetId: string;
	dataRequestLimit: number;
	security: Security;

	constructor() { this.security = new Security(); }

	public setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	public getContentIds(targetId: string, dataRequestLimit: number, logElement: HTMLElement,
		callback: (ids: string[], error: string) => void) {

		this.clearLogElement(logElement);
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

		var secureIdChannels = this.security.secureIdChannels;
		var ajax = [];
		for (var type in types) {
			var url = "https://graph.facebook.com/" + targetId + "/" + types[type] +
				"/?access_token=" + this.accessToken +
				"&limit=" + this.dataRequestLimit +
				"&fields=id,from.fields(id),comments.fields(id, from.fields(id))"; // TODO: taged id fields
			ajax.push($.getJSON(url));
		}

		$.when.apply($, ajax).done(() => {
			var ids = [];
			for (var i = 0, len = ajax.length; i < len; i++) {
				if (arguments[i][1] != "success") continue;
				var response = arguments[i][0];
				if (response.data == null) continue;

				for (var k = 0; k < response.data.length; k++) {
					if ($.inArray(response.data[k].from.id, secureIdChannels) == -1) {
						ids.push(response.data[k].id);
						logElement.innerHTML += "Added: " + response.data[k].id + "\n";
						logElement.scrollTop = logElement.scrollHeight;
					}

					if (response.data[k].comments == null || response.data[k].comments.data == null) continue;
					for (var z = 0; z < response.data[k].comments.data.length; z++) {
						if ($.inArray(response.data[k].comments.data[z].from.id, secureIdChannels) == -1) {
							ids.push(response.data[k].comments.data[z].id);
							logElement.innerHTML += "Added: " + response.data[k].comments.data[z].id + "\n";
							logElement.scrollTop = logElement.scrollHeight;
						}
					}
				}
			}
			callback(ids, null);
		}).fail(() => {
			callback(null, arguments[0].responseJSON.error.message);
		});
	}

	public likeContent(contentIds: string[], logElement: HTMLElement, callback: (error: string) => void) {

		this.clearLogElement(logElement);
		if (this.accessToken == null) {
			callback("Missing Access Token");
			return;
		}

		var index = 0;
		contentIds.forEach(id => {
			$.post("https://graph.facebook.com/" + id + "/likes?access_token=" + this.accessToken, () => {
				// do nothing
			}).done(() => {
				logElement.innerHTML += "[" + index + "] Liked Content: [" + index + ":" + id + "]\n";
				logElement.scrollTop = logElement.scrollHeight;

				index++;
			}).fail(() => {
				var errorMessage = arguments[0].responseJSON.error.message;
				var errorCode = arguments[0].responseJSON.error.code;
				var errorMessageFriendly;
				var oldIndex = index;
				index++;

				switch (errorCode) {
					case 100: // Id Error - Do nothing
						errorMessageFriendly = "*** Warning: [" + errorCode + "] Id error - content skipped";
						logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
						logElement.scrollTop = logElement.scrollHeight;
						return;

					case 190: // Auth Token has expired
						errorMessageFriendly = "*** Error: [" + errorCode + "] Auth Token Expired";
						logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
						logElement.scrollTop = logElement.scrollHeight;
						callback(errorMessageFriendly);
						return;

					case 368: // Blocked from liking
						errorMessageFriendly = "*** Error: [" + errorCode + "] Profile suspended from liking";
						logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
						logElement.scrollTop = logElement.scrollHeight;
						callback(errorMessageFriendly);
						return;

					default: // Unknown, break anyway
						errorMessageFriendly = "*** Error: [" + errorCode + "] " + errorMessage;
						logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
						logElement.scrollTop = logElement.scrollHeight;
						callback(errorMessageFriendly);
						return;
				}
			});
		});
	}

	private clearLogElement(logElement: HTMLElement) {
		logElement.innerHTML = "";
	}
}
 