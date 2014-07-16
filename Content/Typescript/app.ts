///<reference path='Definitions/jquery.d.ts' />

class FacebookAbuser {
	contentIds: string[] = [];
	accessToken: string = null;
	targetId: string;
	dataRequestLimit: number = 200;

	constructor() { }

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	getContentIds(targetId: string, dataRequestLimit: number, logElement: HTMLElement, callback: (ids: any) => void) {
		if (this.accessToken == null) {
			console.log("No AccessToken set - terminating");
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
			var url = "https://graph.facebook.com/" + targetId + "/" + types[type] + "/?access_token=" + this.accessToken + "&limit=" + this.dataRequestLimit + "&fields=comments.fields(id),id";
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
					if (response.data[k].comments == null || response.data[k].comments.data == null) continue;
					for (var z = 0; z < response.data[k].comments.data.length; z++)
						ids.push(response.data[k].comments.data[z].id);
				}
			}

			callback(ids);
		});
	}
}

window.onload = () => {
	var facebookAbuser = new FacebookAbuser();
	facebookAbuser.setAccessToken("CAACEdEose0cBAB4CiUkIzxGItOOPgCdQ0NlXyWUaYzTe89mrLM2zvB04jiaPKDZBysECS3zZAL37LTO4cObT1mWbbCvKlxQkgBfs8k5hZBZB3bTGhN1esHOyVxp1f2nRH5zlcgNQmdyX1IBl6ofltyRDv4xZAFyWh0LB0cagEDLq7NMeLFEyLHnttpNZBI89mNDTZAEX4LVJOfS1XZA3c6ETe1638GpotvoZD");
	facebookAbuser.getContentIds("xbdm.xex", 10, null, ids => {
		console.log(ids);
	});
};