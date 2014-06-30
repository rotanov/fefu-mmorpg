define(["jquery"],
function($) {

    function Object(id) {
        this.data = {
            "id": id,
            "type": null,
            "name": null,
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
        $("#inf-about-obj").show()
        $("#inf-about-obj").empty()
        for (var key in this.data) {
            if (this.data[key])
                $("<div/>", {})
                .text(key + ": " + this.data[key])
                .appendTo("#inf-about-obj")
        }
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