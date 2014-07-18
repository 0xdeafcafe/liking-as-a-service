///<reference path='facebook-abuser.ts' />

window.onload = () => {
	var fbAbuser = new FacebookAbuser();

	$('#fb-access-token').val("");
	$('#fb-target-id').val("konnaire");
	$('#fb-request-limit').val("100");

	$('#fb-content-gathering').click(() => {
		var accessToken = $('#fb-access-token').val();
		var targetId = $('#fb-target-id').val();
		var requestLimit = parseInt($('#fb-request-limit').val());

		// Set Access Token
		fbAbuser.setAccessToken(accessToken);

		// Show Debug Log
		$('#id-log').css('display', 'block');

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

				$('#like-abuse-log').css('display', 'block');

				var gotResponse = false;
				fbAbuser.likeContent(ids, $('#debug-like-abuse-area').get(0), errorResponse => {
					if (gotResponse) return;

					gotResponse = true;
					if (errorResponse == null) {
						$('#debug-like-abuse-area').get(0).innerHTML = "";
						alert("Error liking content: " + errorResponse);
						return;
					} else {
						alert('see man driving a german whip.');
					}
				});
			});
		});
	});
};