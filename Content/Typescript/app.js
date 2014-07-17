///<reference path='facebook-abuser.ts' />
window.onload = function () {
    var fbAbuser = new FacebookAbuser();

    $('#fb-access-token').val("CAACEdEose0cBAODyGMWk7pLIzeRr20QtlvpCRHkRbxodLkU2WR72ZBmunk6mHZAdflDWu7uNyQOZByPjbALTbWuyKILCrWzlWMSdJYG9SDYZCimxgvogTh4YTrBbyr7O4SKnXNTZB9DSbTDGIFTm7ZBZCjMmRS5mKZCng0fOuUYY2pQ2amlU9HRVrRlfjLZAbKcb3nAQBAi0C1xh9xDoc0WlZB");
    $('#fb-target-id').val("konnaire");
    $('#fb-request-limit').val("10");

    $('#fb-content-gathering').click(function () {
        var accessToken = $('#fb-access-token').val();
        var targetId = $('#fb-target-id').val();
        var requestLimit = parseInt($('#fb-request-limit').val());

        // Set Access Token
        fbAbuser.setAccessToken(accessToken);

        // Show Debug Log
        $('#id-log').css('display', 'block');

        // Get Content Ids
        fbAbuser.getContentIds(targetId, requestLimit, $('#debug-id-log-area').get(0), function (ids, error) {
            if (error) {
                $('#debug-id-log-area').get(0).innerHTML = "";
                alert("There was an error loading items: " + error);
                return;
            }

            // Show the next stage
            $('#abuse-controls').css('display', 'block');
            $('#like-count').text(ids.length.toString());

            $('#fb-start-abuse').click(function () {
                if (!confirm("Are you realllllly sure?"))
                    return;

                $('#like-abuse-log').css('display', 'block');

                var gotResponse = false;
                fbAbuser.likeContent(ids, $('#debug-like-abuse-area').get(0), function (error) {
                    if (gotResponse)
                        return;

                    gotResponse = true;
                    if (error == null) {
                        $('#debug-like-abuse-area').get(0).innerHTML = "";
                        alert("Error liking content: " + error);
                        return;
                    } else {
                        alert('see man driving a german whip.');
                    }
                });
            });
        });
    });
};
//# sourceMappingURL=app.js.map
