define(function() {
    var name_monster = []
    name_monster["Scrawny cat"] = 83
    name_monster["Scruffy little dog"] = 84
    name_monster["Grey mold"] = 95
    name_monster["Grey mushroom patch"] = 105 
    name_monster["Giant yellow centipede"] = 111
    name_monster["Giant white centipede"] = 112
    name_monster["White icky thing"] = 113
    name_monster["Large brown snake"] = 65
    name_monster["Large white snake"] = 98
    name_monster["Small kobold"] = 99
    name_monster["Floating eye"] = 108
    name_monster["Rock lizard"] = 200
    name_monster["Soldier ant"] = 145
    name_monster["Fruit bat"] = 128
    name_monster["Kobold"] = 129
    name_monster["Metallic green centipede"] = 189
    name_monster["Yellow mushroom patch"] = 160
    name_monster["White jelly"] = 161
    name_monster["Giant green frog"] = 170
    name_monster["Giant black ant"] = 155
    name_monster["Salamander"] = 145
    name_monster["Yellow mold"] = 133
    name_monster["Metallic red centipede"] = 123
    name_monster["Cave lizard"] = 124
    name_monster["Blue jelly"] = 67
    name_monster["Large grey snake"] = 190
    name_monster["Raven"] = 127
    name_monster["Blue ooze"] = 128
    name_monster["Green glutton ghost"] = 229
    name_monster["Green jelly"] = 130
    name_monster["Large kobold"] = 211
    name_monster["Skeleton kobold"] = 112
    name_monster["Grey icky thing"] = 173

    function getFrame(name) {
        return (name_monster[name] == undefined) ? 3 : name_monster[name]
   }

    return {
        getFrame: getFrame
    }
})