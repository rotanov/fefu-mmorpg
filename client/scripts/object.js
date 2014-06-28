define(["jquery"],
function($) {

    function Object(id) {
        this.data = {
            "id": id,
            "type": null,
            "x": null,
            "y": null,
            "login": null,
            "health" : null,
            "maxHealth": null,
            "mana": null,
            "maxMana": null,
            "mobType" : null
        }
    }

    Object.prototype.init = function(examineData) {
        for (var key in this.data) {
            if (examineData[key])
                this.data[key] = examineData[key]
        }
    }

    Object.prototype.drawInf = function() {
        $("#inf-about-obj").empty()
        for (var key in this.data) {
            if (this.data[key])
                $("<div/>", {})
                .text(key + ": " + this.data[key])
                .appendTo("#inf-about-obj")
        }
        $("#inf-about-obj").css("background", "rgb(247, 247, 247)")
        $("#inf-about-obj").css("border", "1px solid rgba(147, 184, 189, 0.8)")
    }

    function showInf(data) {
        var obj = new Object(data.id)
        obj.init(data)
        obj.drawInf()
        return obj
    }

    return {
        showInf: showInf
    }

})