define(function() {
    var items = []
    items["Amulet of Carlammas"] = 829
    items["Amulet of Ingwe"] = 830
    items["Amulet of Elessar"] = 835
    items["Ring of Barahir"] = 1034
    items["Ring of Tulkas"] = 1039
    items["Ring of Narya"] = 1044
    items["Ring of Nenya"] = 1042
    items["Ring of Vilya"] = 1042
    items["Full plate armour of Isildur"] = 862
    items["Mithril plate mail of Celeborn"] = 884
    items["Leather armour of Himring"] = 885
    items["Thalkettoth"] = 886
    items["Shield of Thorin"] = 879
    items["Shield of Thorin"] = 880
    items["Shield of Anarion"] = 883
    items["Helm of Celebrimbor"] = 902
    items["Helm of Thranduil"] = 984
    items["Crown of Gondor"] = 1041
    items["Crown of Numenor"] = 1045
    items["Gloves of Eol"] = 912
    items["Gloves of Cambeleg"] = 874
    items["Gloves of Paurnimmen"] = 875
    items["Boots of Dal-i-thalion"] = 918
    items["Boots of Thror"] = 919
    items["Boots of Wormtongue"] = 920
    items["Boots of Radagast"] = 921
    items["Glamdring"] = 1092
    items["Sword of Eowyn"] = 1093
    items["Orcrist"] = 1094
    items["Anduril"] = 1066
    items["Axe of Theoden"] = 1090
    items["Great axe of Durin"] = 52
    items["Bow of Belthronding"] = 922
    items["Bow of Bard"] = 22

    function getFrame(name) {
        return items[name]
    }

    return {
        getFrame: getFrame
    }
})