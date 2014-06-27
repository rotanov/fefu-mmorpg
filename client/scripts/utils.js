define(["jquery"],
function ($) {

    var serverAddress_ = "http://localhost:6543";

    function getServerAddress() {
        return serverAddress_
    }

    function setServerAddress(serverAddress, onload) {
        serverAddress_ = serverAddress
    }

    function postRequest(object, onLoad, sync) {
        sync = sync || false;
        var xml = new XMLHttpRequest()

        xml.open("POST", serverAddress_, !sync)

        if (!sync) {
            xml.responseType = "json"

            xml.onreadystatechange = function () {
                if (xml.readyState === 4) {
                    if (xml.status === 200) {
                        onLoad(xml.response)

                    } else {
                        console.log("postRequest: failure")
                    }
                }
            }
        }

        xml.send(JSON.stringify(object));

        if (sync) {
            if(xml.status === 200) {
                if (onLoad) {
                    onLoad($.parseJSON(xml.responseText))
                }

            } else {
                console.log("postRequest: failure")
            }
        }
    }

    function serverHandler(object) {
        var responseResult

        postRequest(object, function (response) {
            responseResult = response
        }, true)

        return responseResult
    }

    function cryBabyCry(result) {
        alert("Error: " + result)
    }

    return {
        getServerAddress: getServerAddress,
        setServerAddress: setServerAddress,
        postRequest: postRequest,
        serverHandler: serverHandler,
        cryBabyCry: cryBabyCry
    }

})