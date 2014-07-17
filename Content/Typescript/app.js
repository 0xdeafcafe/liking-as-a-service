///<reference path='Definitions/jquery.d.ts' />
var FacebookAbuser = (function () {
    function FacebookAbuser() {
        this.contentIds = [];
        this.accessToken = null;
    }
    FacebookAbuser.prototype.setAccessToken = function (accessToken) {
        this.accessToken = accessToken;
    };

    FacebookAbuser.prototype.getContentIds = function (targetId, dataRequestLimit, logElement, callback) {
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
            var url = "https://graph.facebook.com/" + targetId + "/" + types[type] + "/?access_token=" + this.accessToken + "&limit=" + this.dataRequestLimit + "&fields=comments.fields(id),id";
            ajax.push($.getJSON(url));
        }

        $.when.apply($, ajax).done(function () {
            var ids = [];
            for (var i = 0, len = ajax.length; i < len; i++) {
                if (arguments[i][1] != "success")
                    continue;
                var response = arguments[i][0];
                if (response.data == null)
                    continue;

                for (var k = 0; k < response.data.length; k++) {
                    ids.push(response.data[k].id);
                    logElement.innerHTML += "Added: " + response.data[k].id + "\n";
                    logElement.scrollTop = logElement.scrollHeight;

                    if (response.data[k].comments == null || response.data[k].comments.data == null)
                        continue;
                    for (var z = 0; z < response.data[k].comments.data.length; z++) {
                        ids.push(response.data[k].comments.data[z].id);
                        logElement.innerHTML += "Added: " + response.data[k].comments.data[z].id + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                    }
                }
            }
            callback(ids, null);
        }).fail(function () {
            callback(null, arguments[0].responseJSON.error.message);
        });
    };

    FacebookAbuser.prototype.likeContent = function (contentIds, logElement, callback) {
        if (this.accessToken == null) {
            callback("Missing Access Token");
            return;
        }
    };
    return FacebookAbuser;
})();

window.onload = function () {
    var fbAbuser = new FacebookAbuser();

    $('#fb-content-gathering').click(function () {
        var accessToken = $('#fb-access-token').attr('value');
        var targetId = $('#fb-target-id').attr('value');
        var requestLimit = parseInt($('#fb-request-limit').attr('value'));

        // Set Access Token
        fbAbuser.setAccessToken(accessToken);

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

                fbAbuser.likeContent(ids, $('#debug-like-abuse-area').get(0), function (error) {
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
//# sourceMappingURL=app.js.map
