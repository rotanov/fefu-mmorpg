#include <cstdlib>
#include <fstream>
#include <vector>
#include <map>
#include <cctype>
#include <QFile>
#include "DataBase.hpp"
#include "Monster.hpp"
#include "Object.hpp"

using namespace std;

map<string, int> Flag;
map<string, int> Spell;

string read_string (FILE* m)
{
    string str;
    char current = fgetc(m);
    while (current != '\n')
    {
        str += current;
        current = fgetc(m);
    }
    return str;
}

vector<string> read (FILE* m, char sym, Monster * mon)
{
    char current = sym;
    vector<string> str;
    while (current == sym )
    {
        while (current != '\n')
        {
            string f ;
            current = fgetc(m);
            while (current != '|' && current != '\n' )
            {
                if (current == ' ' && (sym =='S' || sym == 'F'))
                {
                    current = fgetc(m);
                    break;
                }
                f += current;
                current = fgetc(m);
            }
            if (sym == 'F')
            {
                Flag[f] = ++Flag[f];
                mon->F << f.c_str();
            }
            else if (sym == 'S')
            {
                Spell[f] = ++Spell[f];
                mon->S << f.c_str();
            }
            else if (sym == 'D')
            {
                mon->D << f.c_str();
            }
            else if (sym == 'B')
            {
                mon->B << f.c_str();
            }
            str.push_back(f);
            if (current == '|')
            {
                current = fgetc(m);
            }
        }
        current = fgetc(m);
        if (current == sym && fgetc(m) != ':')
        {
            break;
        }
        if (current != sym)
        {
            ungetc(current,m);
        }
    }
    return str;
}

void read_(FILE* m, char sym, Object* mon)
{
    char current = sym;
    vector<string> str;
    while (current == sym )
    {
        while (current != '\n')
        {
            string f ;
            current = fgetc(m);
            while (current != '|' && current != '\n' )
            {
                if (current == ' ' && (sym =='L' || sym == 'F'))
                {
                    current = fgetc(m);
                    break;
                }
                f += current;
                current = fgetc(m);
            }
            if (sym == 'F')
            {
                mon->F << f.c_str();
            }
            else if (sym == 'L')
            {
                mon->L << f.c_str();
            }
            else if (sym == 'D')
            {
                mon->D << f.c_str();
            }
            str.push_back(f);
            if (current == '|')
            {
                current = fgetc(m);
            }
        }
        current = fgetc(m);
        if (current == sym && fgetc(m) != ':')
        {
            break;
        }
        if (current != sym)
        {
            ungetc(current,m);
        }
    }
}

map <string, Object*> Objects;
void Obj_read()
{
    FILE* obj = fopen("object.txt", "r");

    char current = fgetc(obj);
    Object* object;
    string name;
    while (current != EOF)
    {
        bool vis = false;
         if (current == 'N')
         {
            current = fgetc(obj);
            current = fgetc(obj);
            while (current != ':')
            {
                current = fgetc(obj);
            }
            name = read_string(obj);
            current = fgetc(obj);
            object = new Object(name);
            vis = true;
        }

        if (current == 'G')
        {
            current = fgetc(obj);
            object->G = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'I')
        {
            current = fgetc(obj);
            object->I = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'W')
        {
            current = fgetc(obj);
            object->W = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'A')
        {
            current = fgetc(obj);
            object->A = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'M')
        {
            current = fgetc(obj);
            object->M = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'P')
        {
            current = fgetc(obj);
            object->P = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'C')
        {
            current = fgetc(obj);
            object->C = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'E')
        {
            current = fgetc(obj);
            object->E = read_string(obj).c_str();
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'F' && fgetc(obj) == ':' )
        {
            read_(obj,current,object);
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'L' &&  fgetc(obj) == ':' )
        {
            read_(obj,current,object);
            current = fgetc(obj);
            vis = true;
        }

        if (current == 'D' &&  fgetc(obj) == ':' )
        {
            read_(obj,current,object);
            current = fgetc(obj);
            vis = true;
        }

        if(current == '\n')
        {
            Objects[name] = object;
            vis = true;
        }

        while(current == '\n'
              || current == '#'
              || !vis)
        {
            read_(obj,current,object);
            current = fgetc(obj);
            vis = true;
        }
    }
}


int main ()
{
   // QFile monstr_type ("monster_type.txt");
   // monstr_type.open(QIODevice::ReadOnly);
   // monstr_type.readAll();
    FILE*  monstr_type = fopen("monster_type.txt", "r");
    FILE* monstr = fopen("monster.txt", "r");
    freopen("output.txt", "w", stdout);

    char current;
    map  <string, TypeMonster*> type;
    current = fgetc(monstr_type);

    while (current != EOF)
    {
        string name;
        if (current == 'N')
        {
            current = fgetc(monstr_type);
            name = read_string(monstr_type);
            current = fgetc(monstr_type);
        }
        TypeMonster * t = new TypeMonster(name);
        if (current == 'G')
        {
            current = fgetc(monstr_type);
            t->G = read_string(monstr_type).c_str();
            current = fgetc(monstr_type);
        }
        if (current == 'M')
        {
            current = fgetc(monstr_type);
            t->M = read_string(monstr_type);
            current = fgetc(monstr_type);
        }
        if (current == 'F' && fgetc(monstr_type) == ':' )
        {
            while (current == 'F' )
            {
                while (current != '\n')
                {
                    string f ;
                    current = fgetc(monstr_type);
                    while (current != '|' && current != '\n')
                    {
                        if (current == ' ' )
                        {
                            current = fgetc(monstr_type);
                            break;
                        }
                        f += current;
                        current = fgetc(monstr_type);
                    }
                    Flag[f] = ++Flag[f];
                    t->F << f.c_str();
                    if (current == '|')
                    {
                        current = fgetc(monstr_type);
                    }
                }
                current = fgetc(monstr_type);
                if (current == 'F' && fgetc(monstr_type) != ':')
                {
                    break;
                }
            }
        }
        if (current == 'S' &&  fgetc(monstr_type) == ':' )
        {
            while (current == 'S')
            {
                while (current != '\n')
                {
                    string f;
                    current = fgetc(monstr_type);
                    while (current != '|' && current != '\n')
                    {
                        if (current == ' ' )
                        {
                            current = fgetc(monstr_type);
                            break;
                        }
                        f += current;
                        current = fgetc(monstr_type);
                    }
                    Spell[f] = ++Spell[f];
                    t->S.push_back(f);
                    if (current == '|')
                    {
                        current = fgetc(monstr_type);
                    }
                }
                current = fgetc(monstr_type);
                if (current == 'S' && fgetc(monstr_type) != ':')
                {
                    break;
                }
            }
        }
        if (current == 'D')
        {
            current = fgetc(monstr_type);
            read_string(monstr_type);
        }
        type[name] = t;
        current = fgetc(monstr_type);
        current = fgetc(monstr_type);
    }
    map  <string, Monster*> Monsstr;
    current = fgetc(monstr);
    while (current != EOF)
    {
        string name;
        string typ;
        Monster* monster = NULL;
        if (current == 'N')
        {
            current = fgetc(monstr);
            current = fgetc(monstr);
            while (current != ':')
            {
                current = fgetc(monstr);
            }
            name = read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'p' )
        {
            read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'T')
        {
            current = fgetc(monstr);
            typ = read_string(monstr);
            current = fgetc(monstr);
            monster = new Monster(name, type[typ]);
        }

        if (current == 'G')
        {
            current = fgetc(monstr);
            monster->G = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'C')
        {
            current = fgetc(monstr);
            read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'I')
        {
            current = fgetc(monstr);
            monster->I = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'W')
        {
            current = fgetc(monstr);
            monster->W = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'B' && fgetc(monstr) == ':')
        {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'F' && fgetc(monstr) == ':' )
        {
            read(monstr,current,monster);
            monster->F << monster->T->F;
            current = fgetc(monstr);
        }
        if (current == '-')
        {
            while (current == '-')
            {
                current = fgetc(monstr);
                fgetc(monstr);
                read_string(monstr);
                current = fgetc(monstr);
            }
        }
        if (current == 'S')
        {
            current = fgetc(monstr);
            monster->spell_frequency = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'S' &&  fgetc(monstr) == ':' )
        {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'f')
        {
            while (current == 'f')
            {
                string f;
                while (current != ':')
                {
                    f +=current;
                    current = fgetc(monstr);
                }
                monster->friends << (read_string(monstr).c_str());
                current = fgetc(monstr);
            }
        }
        if (current == 'D' && fgetc(monstr) == ':')
        {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'd')
        {
            while (current == 'd')
            {
                string f;
                while (current != ':')
                {
                    f += current;
                    current = fgetc(monstr);
                }
                if (f == "drop")
                {
                    monster->drop << (read_string(monstr).c_str());
                }
                else if (f == "drop-artifact")
                {
                    monster->drop_artifact << (read_string(monstr).c_str());
                }
                current = fgetc(monstr);
            }
        }
        if (current == 'D' && fgetc(monstr) == ':')
        {
            read(monstr, current, monster);
            current = fgetc(monstr);
        }
        if (current == 'm')
        {
            read_string(monstr);
            current = fgetc(monstr);
        }
        if(current == '\n')
        {
            //monster->AddToDataBase();
            monster->G = monster->T->G;
            Monsstr[name] = monster;
        }
        current = fgetc(monstr);
    }
    Obj_read();
    for (map<string, Object*>::iterator i = Objects.begin(); i != Objects.end(); i++)
    {
           //  i->second->AddToDataBase();
    }
    int j = 1;
    for (map<string, Monster*>::iterator i = Monsstr.begin(); i != Monsstr.end(); i++, j++)
    {
        // i->second->AddToDataBase();
    }
    //AddToDataBase();
    AddToDataBaseItem ();
    return 0;
}
