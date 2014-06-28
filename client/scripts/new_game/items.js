define(function() {
    var items = []
    items["Amulet of Carlammas"] = 831
    items["Amulet of Ingwe"] = 832
    items["Amulet of Elessar"] = 838
    items["Ring of Barahir"] = 1031
    items["Ring of Tulkas"] = 1033
    items["Ring of Narya"] = 1034
    items["Ring of Nenya"] = 1035
    items["Ring of Vilya"] = 1036
    items["Full plate armour of Isildur"] = 861
    items["Mithril plate mail of Celeborn"] = 862
    items["Leather armour of Himring"] = 863
    items["Thalkettoth"] = 864
    items["Shield of Gil-galad"] = 878
    items["Shield of Thorin"] = 879
    items["Shield of Anarion"] = 882
    items["Helm of Celebrimbor"] = 941
    items["Helm of Thranduil"] = 940
    items["Crown of Gondor"] = 1036
    items["Crown of Numenor"] = 1040
    items["Gloves of Eol"] = 874
    items["Gloves of Cambeleg"] = 875
    items["Gloves of Paurnimmen"] = 876
    items["Boots of Dal-i-thalion"] = 917
    items["Boots of Thror"] = 918
    items["Boots of Wormtongue"] = 919
    items["Boots of Radagast"] = 920
    items["Glamdring"] = 1091
    items["Sword of Eowyn"] = 1092
    items["Orcrist"] = 1093
    items["Anduril"] = 1089
    items["Axe of Theoden"] = 49
    items["Great axe of Durin"] = 848
    items["Bow of Belthronding"] = 921
    items["Bow of Bard"] = 921

    function getFrame(name) {
        return items[name]
    }

    return {
        getFrame: getFrame
    }
})