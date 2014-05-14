#include "LevelMap.hpp"

#include <cassert>
#include <cmath>

#include "Actor.hpp"
#include "utils.hpp"

LevelMap::LevelMap(int columnCount, int rowCount)
    : columnCount_(columnCount)
    , rowCount_(rowCount)
    , data_(NULL)
{
    InitData_();
}

LevelMap::~LevelMap()
{
    delete [] data_;
    data_ = NULL;
    delete [] actors_;
    actors_ = NULL;
}

int LevelMap::GetRowCount() const
{
    return rowCount_;
}

int LevelMap::GetColumnCount() const
{
    return columnCount_;
}

int LevelMap::GetCell(int column, int row) const
{
    if (column < 0
        || row < 0
        || column >= columnCount_
        || row >= rowCount_)
    {
        return '#';
    }
    else
    {
        return data_[row * columnCount_ + column];
    }
}

int LevelMap::GetCell(float column, float row) const
{
    return GetCell(GridRound(column), GridRound(row));
}

void LevelMap::SetCell(int column, int row, int value)
{
    data_[row * columnCount_ + column] = value;
}

const std::vector<Actor*>& LevelMap::GetActors(int column, int row) const
{
    if (column < 0
        || row < 0
        || column >= columnCount_
        || row >= rowCount_)
    {
        return emptyActors_;
    }
    else
    {
        return actors_[row * columnCount_ + column];
    }
}

void LevelMap::Resize(int columnCount, int rowCount)
{
    columnCount_ = columnCount;
    rowCount_ = rowCount;

    InitData_();
}

void LevelMap::IndexActor(Actor* actor)
{
    auto cells = actor->GetOccupiedCells();
    for (auto p : cells)
    {
        int column = p.first;
        int row = p.second;
        if (column >= 0
            && row >= 0
            && column < columnCount_
            && row < rowCount_)
        {
            actors_[row * columnCount_ + column].push_back(actor);
        }
    }
}

void LevelMap::RemoveActor(const Actor* actor)
{
    auto cells = actor->GetOccupiedCells();
    for (auto p : cells)
    {
        int column = p.first;
        int row = p.second;
        if (column >= 0
            && row >= 0
            && column < columnCount_
            && row < rowCount_)
        {
            auto& a = actors_[row * columnCount_ + column];
            a.erase(std::remove(a.begin(), a.end(), actor), a.end());
        }
    }
}

void LevelMap::InitData_()
{
    if (data_ != NULL)
    {
        delete [] data_;
        data_ = NULL;
    }

    data_ = new int [columnCount_ * rowCount_];
    actors_ = new std::vector<Actor*> [columnCount_ * rowCount_];

    for (int i = 0; i < columnCount_ * rowCount_; i++)
    {
        data_[i] = '.';
    }
}
