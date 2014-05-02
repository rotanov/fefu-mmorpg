#pragma once

#include <vector>

#include "2de_Box.h"

class Actor;

class LevelMap
{
public:
    LevelMap(int columnCount, int rowCount);
    virtual ~LevelMap();

    int GetRowCount() const;
    int GetColumnCount() const;

    int GetCell(int column, int row) const;
    int GetCell(float column, float row) const;
    void SetCell(int column, int row, int value);

    const std::vector<Actor*>& GetActors(int column, int row) const;

    void Resize(int columnCount, int rowCount);

    void IndexActor(Actor* actor);
    void RemoveActor(const Actor* actor);

private:
    void InitData_();

    int rowCount_;
    int columnCount_;
    int* data_;
    std::vector<Actor*>* actors_;
    std::vector<Actor*> emptyActors_;
};
