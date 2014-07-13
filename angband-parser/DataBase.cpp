#include "DataBase.hpp"

#include <QSqlQuery>
#include <QSql>
#include <QSqlDriver>
#include <QSqlError>
#include <QDebug>
#include <QSqlRecord>

DataBase::DataBase()
{

}

bool DataBase::Connect()
{
    db_ = QSqlDatabase::addDatabase("QPSQL");
    if (!db_.isValid())
    {
        qDebug() << db_.lastError();
        return false;
    }

    db_.setHostName("localhost");
    db_.setPort(5432);
    db_.setUserName("server");
    db_.setPassword("123");
    db_.setDatabaseName("fefu-mmorpg");

    if (!db_.open())
    {
        qDebug() << "database wasn't opened";
        qDebug() << db_.lastError();
        return false;
    }

    return true;
}

void DataBase::Disconnect()
{
    db_.close();
}

void DataBase::CreateTable()
{
    ExecQuery_(R"=(
        create table if not exists monsters
        (
            id serial NOT NULL PRIMARY KEY,
            name varchar(32) NOT NULL,
            base_hp varchar(32),
            hp_inc varchar(32),
            blow_method varchar(32),
            color varchar(32),
            description text,
            flags text,
            symbol varchar(32),
            info varchar(32),
            spells varchar(32),
            level_info varchar(32)
        )
    )=");
}

bool DataBase::ExecQuery_(QSqlQuery& query)
{
    bool ret = query.exec();
    if (!ret)
    {
        qDebug() << query.lastError();
    }
    return ret;
}

bool DataBase::ExecQuery_(QString query)
{
    QSqlQuery q;
    bool ret = q.exec(query);
    if (!ret)
    {
        qDebug() << q.lastError();
    }
    return ret;
}

void AddToDataBase()
{
    DataBase storage_;
    storage_.Connect();
    storage_.CreateTable();
    QSqlQuery q;
    q.prepare(R"=(
              INSERT INTO monsters(name, base_hp, hp_inc, blow_method, color, description, flags, symbol, info, spells, level_info)
              VALUES
              ('Scrawny cat', '100', '25d2', 'CLAW|HURT|1d1', 'U', 'A skinny little furball with sharp claws and a menacing look.', 'RAND_25|TROLL|HATE_PLAYERS', 'f', '110|2|30|1|10', ' ' , '0|3|0'),
              ('Scruffy little dog', '100', '25d2', 'BITE|HURT|1d1', 'U', 'A thin flea-ridden mutt, growling as you get close.', 'RAND_25|ORC|HATE_TROLLS', 'C', '110|2|20|1|5', ' ' , '0|3|0'),
              ('Grey mold', '200', '25d3', 'SPORE|HURT|1d4@SPORE|HURT|1d4', 's', 'A small strange grey growth.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_ORCS', 'm', '110|2|2|1|0', ' ' , '1|1|3'),
              ('Grey mushroom patch', '200', '25d3', 'SPORE|CONFUSE|1d4', 's', 'Yum! It looks quite tasty.', 'IM_POIS|NEVER_MOVE|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_TROLLS', ',', '110|2|2|1|0', ' ' , '1|1|1'),
              ('Giant yellow centipede', '200', '25d3', 'BITE|HURT|1d3@STING|HURT|1d3', 'y', 'It is about four feet long and carnivorous.', 'ANIMAL', 'c', '110|7|8|14|30', ' ' , '1|1|2'),
              ('Giant white centipede', '200', '25d3', 'BITE|HURT|1d2@STING|HURT|1d2', 'w', 'It is about four feet long and carnivorous.', 'RAND_50|ANIMAL', 'c', '110|9|7|12|40', ' ' , '1|1|2'),
              ('White icky thing', '200', '25d3', 'TOUCH|HURT|1d2', 'w', 'It is a smallish, slimy, icky creature.', 'RAND_25|RAND_50', 'i', '110|6|12|8|10', ' ' , '1|1|1'),
              ('Large brown snake', '200', '25d3', 'BITE|HURT|1d3@CRUSH|HURT|1d4', 'u', 'It is about eight feet long.', 'RAND_25|ANIMAL|HURT_COLD', 'J', '100|14|4|42|99', ' ' , '1|1|3'),
              ('Large white snake', '200', '25d3', 'BITE|HURT|1d1@CRUSH|HURT|1d1', 'w', 'It is about eight feet long.', 'RAND_50|ANIMAL|HURT_COLD', 'J', '100|11|4|36|99', ' ' , '1|1|2'),
              ('Small kobold', '200', '25d3', 'HIT|HURT|1d5', 'y', 'It is a squat and ugly humanoid figure with a canine face.', 'DROP_60|EVIL|IM_POIS', 'k', '110|8|20|24|70', ' ' , '1|1|5'),
              ('Floating eye', '200', '25d3', 'GAZE|PARALYZE', 'o', 'A disembodied eye, floating a few feet above the ground.', 'NEVER_MOVE|HURT_LIGHT|NO_FEAR', 'e', '110|11|2|7|10', ' ' , '1|1|1'),
              ('Rock lizard', '200', '25d3', 'BITE|HURT|1d1', 'U', 'It is a small lizard with a hardened hide.', 'ANIMAL|HURT_COLD', 'R', '110|8|20|4|15', ' ' , '1|1|2'),
              ('Soldier ant', '200', '25d3', 'BITE|HURT|1d2', 'W', 'A large ant with powerful mandibles.', 'ANIMAL', 'a', '110|6|10|4|40', ' ' , '1|1|3'),
              ('Fruit bat', '200', '25d3', 'BITE|HURT|1d1', 'o', 'A fast-moving pest.', 'ANIMAL', 'b', '120|4|20|3|10', ' ' , '1|1|1'),
              ('Kobold', '400', '50d3', 'HIT|HURT|1d8', 'G', 'It is a small, dog-headed humanoid.', 'DROP_60|EVIL|IM_POIS|HATE_PLAYERS', 'k', '110|12|20|24|70', ' ' , '2|1|5'),
              ('Metallic green centipede', '400', '50d3', 'CRAWL|HURT|1d1', 'g', 'It is about four feet long and carnivorous.', 'RAND_50|ANIMAL', 'c', '120|10|5|4|10', ' ' , '2|1|3'),
              ('Yellow mushroom patch', '400', '50d3', 'SPORE|TERRIFY|1d6', 'y', 'Yum! It looks quite tasty.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP', ',', '110|1|2|1|0', ' ' , '2|1|2'),
              ('White jelly', '400', '50d3', 'TOUCH|POISON|1d2', 'w', 'Its a large pile of white flesh.', 'NEVER_MOVE|HURT_LIGHT|IM_POIS|HURT_COLD|NO_CONF|NO_SLEEP|NO_FEAR', 'j', '120|36|2|1|99', ' ' , '2|1|10'),
              ('Giant green frog', '400', '50d3', 'BITE|HURT|1d3', 'g', 'It is as big as a wolf.', 'RAND_25|ANIMAL|HURT_COLD', 'R', '110|9|12|9|30', ' ' , '2|1|6'),
              ('Giant black ant', '400', '50d3', 'BITE|HURT|1d4', 'D', 'It is about three feet long.', 'RAND_25|ANIMAL', 'a', '110|11|8|24|80', ' ' , '2|1|8'),
              ('Salamander', '400', '50d3', 'BITE|FIRE|1d3', 'o', 'A small black and orange lizard.', 'RAND_25|IM_FIRE|ANIMAL|HURT_COLD|HATE_PLAYERS', 'R', '110|14|8|24|80', ' ' , '2|1|10'),
              ('Yellow mold', '500', '42d4', 'SPORE|HURT|1d4', 'y', 'It is a strange yellow growth on the dungeon floor.', 'NEVER_MOVE|IM_POIS|HURT_FIRE|NO_FEAR|NO_CONF|NO_SLEEP|HATE_PLAYERS', 'm', '110|36|2|12|99', ' ' , '3|1|9'),
              ('Metallic red centipede', '500', '42d4', 'CRAWL|HURT|1d2', 'r', 'It is about four feet long and carnivorous.', 'RAND_25|ANIMAL|HATE_PLAYERS', 'c', '120|18|8|10|20', ' ' , '3|1|12'),
              ('Cave lizard', '600', '50d4', 'BITE|HURT|1d5', 'u', 'It is an armoured lizard with a powerful bite.', 'ANIMAL|HURT_COLD', 'R', '110|11|8|19|80', ' ' , '4|1|8'),
              ('Blue jelly', '600', '50d4', 'TOUCH|COLD|1d6', 'b', 'Its a large pile of pulsing blue flesh.', 'COLD_BLOOD|NEVER_MOVE|HURT_LIGHT|IM_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '110|54|2|1|99',' ' , '4|1|14'),
              ('Large grey snake', '600', '50d4', 'BITE|HURT|1d5@CRUSH|HURT|1d8', 's', 'It is about ten feet long.', 'RAND_25|ANIMAL|HURT_COLD|HATE_PLAYERS', 'J', '100|27|6|61|100', ' ' , '4|1|14'),
              ('Raven', '600', '50d4', 'BITE|HURT|1d4@BITE|HURT|1d4', 'D', 'Larger than a crow, and pitch black.', 'ANIMAL', 'B', '120|12|40|14|0', ' ' , '4|2|10'),
              ('Blue ooze', '800', '50d5', 'CRAWL|COLD|1d4', 'b', 'Its blue and its oozing.', 'DROP_40|RAND_25|RAND_50|IM_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '110|8|8|19|80', ' ' , '5|1|7'),
              ('Green glutton ghost', '800', '50d5', 'TOUCH|EAT_FOOD|1d1', 'g', 'It is a very ugly green ghost with a voracious appetite.', 'DROP_40|DROP_60|RAND_25|RAND_50|UNDEAD|EVIL|INVISIBLE|COLD_BLOOD|PASS_WALL|IM_POIS|NO_CONF|NO_SLEEP|NO_STUN|HATE_PLAYERS', 'G', '130|8|10|24|10', ' ' , '5|1|15'),
              ('Green jelly', '800', '50d5', 'TOUCH|ACID|1d2', 'g', 'It is a large pile of pulsing green flesh.', 'NEVER_MOVE|HURT_LIGHT|IM_ACID|HURT_COLD|NO_CONF|NO_SLEEP|NO_FEAR|HATE_PLAYERS', 'j', '120|99|2|1|99', ' ' , '5|1|18'),
              ('Large kobold', '800', '50d5', 'HIT|HURT|1d10', 'b', 'It is a man-sized figure with the all too recognizable face of a kobold.', 'DROP_60|EVIL|IM_POIS|HATE_PLAYERS', 'k', '110|65|20|48|70', ' ' , '5|1|25'),
              ('Skeleton kobold', '800', '50d5', 'HIT|HURT|1d6', 'w', 'It is a small animated kobold skeleton.', 'UNDEAD|EVIL|COLD_BLOOD|IM_COLD|IM_POIS|NO_FEAR|NO_CONF|NO_SLEEP|NO_STUN|HATE_PLAYERS', 's', '110|23|20|39|80', ' ' , '5|1|12'),
              ('Grey icky thing', '800', '50d5', 'TOUCH|HURT|1d5', 's', 'It is a smallish, slimy, icky, nasty creature.', 'RAND_50|HATE_PLAYERS', 'i', '110|18|14|14|15', ' ' , '5|1|10')
             )=");
    storage_.ExecQuery_(q);
    storage_.Disconnect();
}

void DataBase::CreateTableItem()
{
    ExecQuery_(R"=(
        create table if not exists items
        (
            id serial NOT NULL PRIMARY KEY,
            name varchar(32) NOT NULL,
            atype varchar(32),
            weight varchar(32),
            allocation_info varchar(32),
            power_info varchar(32),
            flags text,
            effects text,
            bonus varchar(32),
            message text,
            description text
        )
    )=");
}

void AddToDataBaseItem()
{
  DataBase storage_;
  storage_.Connect();
  storage_.CreateTableItem();
  QSqlQuery q;
  q.prepare(R"=(
INSERT INTO items(name, atype, weight, allocation_info, power_info, flags, effects, bonus, message, description) VALUES
   ('Amulet of Carlammas', '0:0:-1', 3, '10:1:100', ' ', 'RES_FIRE', ' ', '3:DEF@1:STR', ' ', 'A fiery circle of bronze, with mighty spells:ward off and banish evil'),
 ('Amulet of Ingwe', '0:0:-1', 3, '30:1:127', ' ', 'RES_ACID|RES_COLD|RES_ELEC|RES_DEFF',' ', '3:INT|MP', ' ', 'The ancient heirloom of Ingwë, high lord of the Vanyar, against whom nothing of evil could stand.'),
   ('Amulet of Elessar', '0:0:-1', 3, '52:2:3', '0:0d0:0:0:10', 'RES_FEAR|RES_FIRE|RES_POIS|INSTA_ART', ' ', '2:STR|MP|SPEED', 'You feel a warm tingling inside...', 'A green stone, imbued with the power of Elvendom and the light of the Sun. Those who gaze through it see the aged and infirm as young again, and its wearer brings healing after victory in battle.'),
   ('Ring of Barahir', '0:1:-1', 2, '44:2:100', ' ', 'RES_POIS', ' ', '1:STR|INT|MP|DEX|DEF|MH', ' ', 'Twinned serpents with eyes of emerald meet beneath a crown of flowers to form this ring, an ancient treasure of Isildurs house.'),
('Ring of Tulkas', '0:1:-1', 2, '32:1:127',  ' ', 'RES_FEAR', ' ', '4:STR|DEX|DEF', ' ', 'The treasure of Tulkas, most fleet and wrathful of the Valar.'),
('Ring of Narya', '0:1:-1', 2, '82:2:127', '0:0d0:2:2:0', 'REGEN|TELEPATHY|SUST_STR|SUST_DEFIM_FIRE|RES_FIRE|RES_FEAR', ' ', '1:STR|INT|MP|DEX|DEF@5:SPEED', ' ', 'The Ring of Fire, made of gold and set with a ruby that glows like flame. Narya is one of the three Rings of Power created by Celebrimbor and hidden by the Elves from Sauron.'),
('Ring of Nenya', '0:1:-1', 2, '22:3:127', '0:0d0:3:3:0', 'HOLD_LIFE|REGEN|IM_COLD|RES_COLD|RES_BLIND', ' ', '2:STR|INT|MP|DEX|DEF@5:SPEED', ' ', 'The Ring of Adamant, made of mithril with a pure white stone as centerpiece. Nenya is one of the three Rings of Power created by Celebrimbor and hidden by the Elves from Sauron.'),
('Ring of Vilya', '0:1:-1', 2, '51:2:127', '0:0d0:5:5:0', 'HOLD_LIFE|REGEN|IM_ELEC|RES_ELEC|RES_POIS|RES_DARK', ' ','3:STR|INT|MP|DEX|DEF@5:SPEED', ' ', 'The Ring of Sapphire, made of gold with a brilliant blue gem that shines like stars. It glitters untouchable despite all that Morgoth ever wrought. Vilya is one of the three Rings of Power created by Celebrimbor and hidden by the Elves from Sauron.'),
('Full plate armour of Isildur', '0:2:-1', 300, '39:4:127', '75:2d4:0:0:25', 'RES_ACID|RES_ELEC|RES_FIRE|RES_COLD|RES_DEFFU|RES_NEXUS', ' ', '1:DEF', ' ', 'A gleaming steel suit covering the wearer from neck:foot, with runes of warding and stability deeply engraved into its surface.'),
('Mithril plate mail of Celeborn', '0:2:-1', 250, '60:4:127', '65:2d4:-3:0:25', 'RES_ACID|RES_ELEC|RES_FIRE|RES_COLD|RES_DARK|RES_DISEN', ' ', '3:STR', ' ', 'A shimmering suit of true-silver, forged long ago by dwarven smiths of legend. It gleams with purest white as you gaze upon it, and mighty are its powers:protect and banish.'),
('Leather armour of Himring', '0:2:-1', 100, '20:2:90', '20:0d0:0:0:15', 'RES_CHAOS|RES_POIS', ' ', ' ', ' ', 'In this studded cuirass of pliable leather lives the memory of unvanquished Himring, defiant fortress surrounded by the legions of Morgoth.'),
('Thalkettoth', '0:2:-1', 60, '20:3:100', '20:1d1:-1:0:25', 'RES_ACID', ' ', '3:DEX|SPEED', ' ', 'An amazingly light tunic and skirt sewn with thick, overlapping scales of hardened leather. Those who wear it move with agility and assurance.'),
('Shield of Gil-galad', '0:3:-1', 80, '25:2:127', '20:1d3:0:0:20', 'RES_ELEC|RES_ACID', ' ', '5:MP@1:HP', 'Your shield with the light of a thousand stars...', 'The legendary shield of Ereinion Gil-galad, who fought his way:the gates of the Dark Tower, and with whom came light even:Gorgoroth.'),
('Shield of Thorin', '0:3:-1', 65, '14:1:127', '5:1d2:0:0:25', 'RES_FEAR|IM_ACID|RES_CHAOS', ' ', '4:DEF@3:STR@-1:MH', ' ', 'Invoking the strength and endurance of Thorin, King under the Mountain, this little metal shield is proof against the Element of Earth.'),
('Shield of Anárion', '0:3:-1', 120, '11:3:100', '12:1d3:0:0:20', 'RES_ACID|RES_ELEC|RES_FIRE|RES_COLD', ' ', ' ', ' ', 'The great metal-bound shield of Elendils younger son Anárion, whom even Sauron could not corrupt.'),
   ('Helm of Celebrimbor', '0:4:-1', 20, '8:1:100', '3:1d1:0:0:18', 'RES_FIRE|RES_ACID', ' ', '3:CAP@2:INT|DEX', ' ', 'A metal cap forged by the greatest Noldorin smith of the Second Age, this helm serves equally well in battle or at the forge, and its enchantment will never be diminished.'),
   ('Helm of Thranduil', '0:4:-1', 15, '14:1:100', '2:0d0:0:0:10', 'RES_BLIND', ' ', '2:INT|MP', ' ', 'The hunting cap of King Thranduil,:whose ears come all the secrets of his forest domain.'),
   ('Crown of Gondor', '0:4:-1', 30, '5:3:127', '0:1d1:0:0:15','RES_COLD|RES_FIRE|RES_HP|RES_BLIND|RES_DEFFU|REGEN', ' ', '3:STR|DEF@2:MP@1:HP', 'You feel a warm tingling inside...', 'From dying Númenor, Elendil brought this shining winged circlet, emblem of Gondor through an age of the world.'),
   ('Crown of Númenor', '0:4:-1', 40, '5:3:127', '0:1d1:0:0:18', 'RES_STUN|RES_COLD|ES_HP|RES_DARK|RES_BLIND', ' ', '3:INT|CAP@2:DEX@1:HP', ' ', 'A massive golden crown, set with wondrous jewels of thought and warding, once worn by the kings of ancient Númenor.'),
   ('Gloves of Eol', '0:5:-1', 25, '3:1:127', '3:1d1:0:0:14', 'RES_ELEC|RES_DARK|RES_POIS|IM_FIRE', ' ', '3:INT', ' ', 'The iron-shod gauntlets of the Dark Elven smith Eöl, who imbued them with magics he could channel in battle.'),
   ('Gloves of Cambeleg', '0:5:-1', 5, '3:2:100', '1:0d0:8:8:15', ' ', ' ', '2:STR|DEF', ' ', 'A heros handgear that lends great prowess in battle.'),
('Gloves of Paurnimmen', '0:5:-1', 25, '5:3:127', '3:1d1:0:0:14', 'RES_COLD', ' ', ' ', 'Your gloves covered in frost...', 'A set of handgear, freezing with unnatural cold.'),
('Boots of Dal-i-thalion', '0:6:-1', 20, '4:2:100', '2:1d1:0:0:15', 'RES_DEFFU', ' ', '5:DEX|SPEED', ' ', 'A pair of high-laced shoes, bestowing of extraordinary agility and proof against the powers of corruption and withering.'),
('Boots of Thror', '0:6:-1', 60, '5:1:100', '7:1d1:0:0:20', 'RES_FEAR', ' ', '3:STR|DEF|SPEED@-1:MH', ' ', 'Sturdy footwear of leather and steel as enduring as the long-suffering Dwarven king-in-exile who wore them.'),
('Boots of Wormtongue', '0:6:-1', 20, '8:2:80', '2:1d1:-1:-1:0', ' ', ' ', '3:SPEED@2:INT|DEX|MH', 'Your boots twist space around you.', 'A pair of running shoes once used by the treacherous Gríma son of Galmod, the Wormtongue of Edoras. They are aptly suited for a messenger, a servant, a spy... or a coward.'),
('Boots of Radagast', '0:6:-1', 20, '8:1:70', '2:1d1:0:0:12', 'RES_COLD', ' ', '5:INFRA@3:MH@1:MP', ' ', 'Made of brown leather, covered with scuff marks and dust, still these boots possess the magic of Radagast, friend of birds and nature.'),
('Glamdring', '0:7:0', 150, '5:3:80', '0:2d5:10:15:0', 'SLAY_EVIL|BRAND_FIRE|SLAY_ORC|SLAY_DEMON|RES_FIRE|RES_HP|SLOW_DIGEST', ' ', '1:CAP|HP', ' ', 'This fiery, shining blade, mate:Orcrist, earned its sobriquet "Beater" from dying orcs who dared:behold hidden Gondolin.'),
('Sword of Eowyn', '0:7:0', 140, '3:4:127', '0:4d4:12:16:0', 'SLAY_EVIL|KILL_UNDEAD|SLAY_GIANT|SLAY_ANIMAL|RES_FEAR|RES_DARK|RES_COLD', ' ', '4:STR@2:MH', ' ', 'The blade of the legendary Shieldmaiden of Rohan, who slew the foul steed of the Morgul-lord before striking down the mighty Witch-king himself, whom no mortal man could hinder.'),
('Orcrist', '0:7:0', 150, '5:2:80', '0:2d5:10:15:0', 'BLESSED|SLAY_EVIL|BRAND_COLD|SLAY_ORC|SLAY_DRAGON|RES_COLD|RES_DARK|SLOW_DIGEST', ' ', '3:CAP@1:HP', ' ', 'This coldly gleaming blade, mate:Glamdring, is called simply "Biter" by orcs who came:know its power all too well.'),
('Anduril', '0:7:0', 130, '3:2:127', '0:3d5:10:15:10', 'RES_FEAR|SLAY_EVIL|SLAY_TROLL|SLAY_ORC|SLAY_UNDEAD|RES_FIRE|RES_DISEN', ' ', '4:STR|DEX', 'Anduril rages in fire...', 'The famed "Flame of the West", the Sword that was Broken and is forged again. It glows with the essence of fire, its wearer is mighty in combat, and no creature of Sauron can withstand it.'),
('Axe of Theoden', '0:7:1', 180, '7:2:100', '0:2d6:8:10:0', 'REGEN', ' ', '3:MP|DEF', ' ', 'The narrow axe head of this weapon would pierce the armour of a very Dragon, and the designs of your enemies stand naked and revealed.'),
('Great axe of Durin', '0:7:1', 230, '1:4:127', '0:4d4:10:20:15', 'SLAY_DEMON|SLAY_TROLL|SLAY_ORC|RES_FEAR|RES_ACID|RES_FIRE|RES_HP|RES_DARK|RES_CHAOS|', ' ', '5:MR@3:STR|DEF@-1:MH', ' ', 'The twin massive axe heads of this ancient demons dread gleam with mithril inlay telling sagas of endurance. The powers of Khazad-dûm protect its wielder and slay all evils found underground.'),
   ('Bow of Belthronding', '0:7:2', 40, '5:6:127', '0:0d0:20:22:0', ' ', ' ', '3:DEX@1:SPEED|MH', ' ', 'The great bow of Beleg Cúthalion, the most famous archer of the Elves. Its backbone of black yew holds strings of bear sinew, and of old, onlyBeleg himself could draw them.'),
   ('Bow of Bard', '0:7:2', 40, '5:6:127', '0:0d0:17:19:0', ' ', ' ', '2:MR@1:DEX|SPEED', ' ', 'The great yew bow of grim-faced Bard, who shot the mightiest arrow that songs record.');


   )=");
    storage_.ExecQuery_(q);
    storage_.Disconnect();
}
