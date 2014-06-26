define(["jquery"],
function ($) {

    function Actor(id) {
        this.data = {
            "id": id,
            "type": null,
            "x": null,
            "y": null,
            "login": null,
            "health" : null,
            "maxHealth": null,
            "mobType" : null
        }
    }

    Actor.prototype.init = function(examineData) {
        for (var key in this.data) {
            if (examineData[key])
                this.data[key] = examineData[key]
        }
    }

    Actor.prototype.drawInf = function() {
        $("#actors").empty()
        for (var key in this.data) {
            if (this.data[key])
                $("<div/>", {})
                .text(key + ": " + this.data[key])
                .appendTo("#actors")
        }
        $("#actors").css("background", "rgb(247, 247, 247)")
        $("#actors").css("border", "1px solid rgba(147, 184, 189, 0.8)")
    }

    function newActor(id) {
        return new Actor(id)
    }

    return {
        newActor: newActor
    }

})