///<reference path='Definitions/jquery.d.ts' />
///<reference path='security.ts' />
// ReSharper disable once DuplicatingLocalDeclaration
var FacebookAbuser = (function () {
    function FacebookAbuser() {
        this.contentIds = [];
        this.accessToken = null;
        this.security = new Security();
    }
    FacebookAbuser.prototype.setAccessToken = function (accessToken) {
        this.accessToken = accessToken;
    };

    FacebookAbuser.prototype.getContentIds = function (targetId, dataRequestLimit, logElement, callback) {
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
            var url = "https://graph.facebook.com/" + targetId + "/" + types[type] + "/?access_token=" + this.accessToken + "&limit=" + this.dataRequestLimit + "&fields=id,from.fields(id),comments.fields(id, from.fields(id))";
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
                    if ($.inArray(response.data[k].from.id, secureIdChannels) == -1) {
                        ids.push(response.data[k].id);
                        logElement.innerHTML += "Added: " + response.data[k].id + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                    }

                    if (response.data[k].comments == null || response.data[k].comments.data == null)
                        continue;
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
        }).fail(function () {
            callback(null, arguments[0].responseJSON.error.message);
        });
    };

    FacebookAbuser.prototype.likeContent = function (contentIds, logElement, callback) {
        var _this = this;
        this.clearLogElement(logElement);
        if (this.accessToken == null) {
            callback("Missing Access Token");
            return;
        }

        var index = 0;
        contentIds.forEach(function (id) {
            $.post("https://graph.facebook.com/" + id + "/likes?access_token=" + _this.accessToken, function () {
                // do nothing
            }).done(function () {
                logElement.innerHTML += "[" + index + "] Liked Content: [" + index + ":" + id + "]\n";
                logElement.scrollTop = logElement.scrollHeight;

                index++;
            }).fail(function () {
                var errorMessage = arguments[0].responseJSON.error.message;
                var errorCode = arguments[0].responseJSON.error.code;
                var errorMessageFriendly;
                var oldIndex = index;
                index++;

                switch (errorCode) {
                    case 100:
                        errorMessageFriendly = "*** Warning: [" + errorCode + "] Id error - content skipped";
                        logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                        return;

                    case 190:
                        errorMessageFriendly = "*** Error: [" + errorCode + "] Auth Token Expired";
                        logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                        callback(errorMessageFriendly);
                        return;

                    case 368:
                        errorMessageFriendly = "*** Error: [" + errorCode + "] Profile suspended from liking";
                        logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                        callback(errorMessageFriendly);
                        return;

                    default:
                        errorMessageFriendly = "*** Error: [" + errorCode + "] " + errorMessage;
                        logElement.innerHTML += "[" + oldIndex + "] " + errorMessageFriendly + "\n";
                        logElement.scrollTop = logElement.scrollHeight;
                        callback(errorMessageFriendly);
                        return;
                }
            });
        });
    };

    FacebookAbuser.prototype.clearLogElement = function (logElement) {
        logElement.innerHTML = "";
    };
    return FacebookAbuser;
})();
//# sourceMappingURL=facebook-abuser.js.map
