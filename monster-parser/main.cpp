#include <stdlib.h>
#include <fstream>
#include <vector>
#include <map>
#include <cctype>
#include "Monster.hpp"

using namespace std;

map <string, int> Flag;
map <string, int> Spell;

string read_string (FILE* m) {
    string str;
    char current = fgetc(m);
    while (current != '\n') {
        str += current;
        current = fgetc(m);
    }
    return str;
}

vector<string> read (FILE* m, char sym, Monstr * mon) {
    char current = sym;
    vector<string> str;
    while (current == sym ) {
        while (current != '\n')  {
            string f ;
            current = fgetc(m);
            while (current != '|' && current != '\n' ) {
                if (current == ' ' && (sym =='S' || sym == 'F')){
                    current = fgetc(m);
                    break;
                }
                if (current != '\'')
                    f += current;
                current = fgetc(m);
            }
            if (sym == 'F') {
                Flag[f] = ++Flag[f];
                mon->F << f.c_str();
            } else if (sym == 'S') {
                Spell[f] = ++Spell[f];
                mon->S << f.c_str();
            } else if (sym == 'D') {
                mon->D << f.c_str();
            } else if (sym == 'B') {
                mon->B << f.c_str();
            }
            str.push_back(f);
            if (current == '|') {
                current = fgetc(m);
            }
        }
        current = fgetc(m);
        if (current == sym && fgetc(m) != ':'){
            break;
        }
        if (current != sym) {
            ungetc(current,m);
        }
    }
    return str;
}

int main () {
    FILE* monstr_type = fopen("monster_type.txt", "r");
    FILE* monstr = fopen("monster.txt", "r");
    freopen("output.txt", "w", stdout);

    char current;
    map  <string, TypeMonstr*> type;
    current = fgetc(monstr_type);

    while (current != EOF) {
        string name;
        if (current == 'N') {
            current = fgetc(monstr_type);
            name = read_string(monstr_type);
            current = fgetc(monstr_type);
        }
        TypeMonstr * t = new TypeMonstr(name);
        if (current == 'G') {
            current = fgetc(monstr_type);
            read_string(monstr_type);
            current = fgetc(monstr_type);
        }
        if (current == 'M') {
            current = fgetc(monstr_type);
            t->M = read_string(monstr_type);
            current = fgetc(monstr_type);
        }
        if (current == 'F' && fgetc(monstr_type) == ':' ) {
            while (current == 'F' ) {
                while (current != '\n')  {
                    string f ;
                    current = fgetc(monstr_type);
                    while (current != '|' && current != '\n') {
                        if (current == ' ' ){
                            current = fgetc(monstr_type);
                            break;
                        }
                        f += current;
                        current = fgetc(monstr_type);
                    }
                    Flag[f] = ++Flag[f];
                    t->F.push_back(f);
                    if (current == '|') {
                        current = fgetc(monstr_type);
                    }
                }
                current = fgetc(monstr_type);
                if (current == 'F' && fgetc(monstr_type) != ':'){
                    break;
                }
            }
        }
        if (current == 'S' &&  fgetc(monstr_type) == ':' ) {
            while (current == 'S') {
                while (current != '\n')  {
                    string f ;
                    current = fgetc(monstr_type);
                    while (current != '|' && current != '\n') {
                        if (current == ' ' ){
                            current = fgetc(monstr_type);
                            break;
                        }
                        f += current;
                        current = fgetc(monstr_type);
                    }
                    Spell[f] = ++Spell[f];
                    t->S.push_back(f);
                    if (current == '|') {
                        current = fgetc(monstr_type);
                    }
                }
                current = fgetc(monstr_type);
                if (current == 'S' && fgetc(monstr_type) != ':'){
                    break;
                }
            }
        }
        if (current == 'D') {
            current = fgetc(monstr_type);
            read_string(monstr_type);
        }
        type[name] = t;
        current = fgetc(monstr_type);
        current = fgetc(monstr_type);
    }
    map  <string, Monstr*> Monsstr;
    current = fgetc(monstr);
    while (current != EOF) {
        string name, typ;
        Monstr* monster;
        if (current == 'N') {
            current = fgetc(monstr);
            current = fgetc(monstr);
            while (current != ':') {
                current = fgetc(monstr);
            }
            name = read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'p' ) {
            read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'T') {
            current = fgetc(monstr);
            typ = read_string(monstr);
            current = fgetc(monstr);
            monster = new Monstr(name, type[typ]);
        }

        if (current == 'G') {
            current = fgetc(monstr);
            read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'C') {
            current = fgetc(monstr);
            read_string(monstr);
            current = fgetc(monstr);
        }
        if (current == 'I') {
            current = fgetc(monstr);
            monster->I = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'W') {
            current = fgetc(monstr);
            monster->W = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'B' && fgetc(monstr) == ':') {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'F' && fgetc(monstr) == ':' ) {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == '-') {
            while (current == '-') {
                current = fgetc(monstr);
                fgetc(monstr);
                read_string(monstr);
                current = fgetc(monstr);
            }
                    }
        if (current == 'S') {
            current = fgetc(monstr);
            monster->spell_frequency = read_string(monstr).c_str();
            current = fgetc(monstr);
        }
        if (current == 'S' &&  fgetc(monstr) == ':' ) {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'f'){
            while (current == 'f'){
                string f;
                while (current != ':'){
                    f +=current;
                    current = fgetc(monstr);
            }
                monster->friends << (read_string(monstr).c_str());
                current = fgetc(monstr);
            }
        }
        if (current == 'D' && fgetc(monstr) == ':') {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'd') {
            while (current == 'd'){
                string f;
                while (current != ':'){
                    f += current;
                    current = fgetc(monstr);
                }
                if (f == "drop") {
                    monster->drop << (read_string(monstr).c_str());
                } else if (f == "drop-artifact") {
                    monster->drop_artifact << (read_string(monstr).c_str());
                }
                current = fgetc(monstr);
            }
        }
        if (current == 'D' && fgetc(monstr) == ':') {
            read(monstr,current,monster);
            current = fgetc(monstr);
        }
        if (current == 'm') {
            read_string(monstr);
            current = fgetc(monstr);
        }
        if(current == '\n') {
            //monster->AddToDataBase();
            Monsstr[name] = monster;
        }
        current = fgetc(monstr);
    }
    int j = 1;
    for (map<string, Monstr*>::iterator i = Monsstr.begin(); i != Monsstr.end(); i++, j++) {
         i->second->AddToDataBase();
    }
    for (map<string, Monstr*>::iterator i = Monsstr.begin(); i != Monsstr.end(); i++, j++) {
        cout << j << ' ' << i->first << '\n';
    }
    cout << '\n'<< '\n';
    j = 1;
    for (map<string, int>::iterator i = Flag.begin(); i != Flag.end(); i++, j++) {
        cout << i->first <<",\n";
    }
    cout << '\n'<< '\n';
    j = 1;
    for (map<string, int>::iterator i = Spell.begin(); i != Spell.end(); i++, j++) {
        cout  << i->first <<",\n";
    }
    return 0;
}
