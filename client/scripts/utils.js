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
        switch(result) {
        case "badSid":
            alert("Error: badSid")
            break
        case "badId":
            alert("Error: badId")
            break
        case "badMap":
            alert("Error: badMap")
            break
        case "badAction":
            alert("Error: badAction")
            break
        case "badPassword":
            alert("Error: badPassword")
            break
        case "badLogin":
            alert("Error: badLogin")
            break
        case "loginExists":
            alert("Error: loginExists")
            break
        case "invalidCredentials":
            alert("Error: invalidCredentials")
            break
        case "badSlot":
            alert("Error: badSlot")
            break
        case "badAmmoId":
            alert("Error: badAmmoId")
            break
        case "badPos":
            alert("Error: badPos")
            break
        default:
            alert("Error: WTF")
        }
    }

    return {
        getServerAddress: getServerAddress,
        setServerAddress: setServerAddress,
        postRequest: postRequest,
        serverHandler: serverHandler
    }

})