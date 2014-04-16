#include "LevelMap.hpp"

#include <cassert>
#include <cmath>

LevelMap::LevelMap(int columnCount, int rowCount)
    : columnCount_(columnCount)
    , rowCount_(rowCount)
{
    assert(columnCount > 2);
    assert(rowCount > 2);

    data_ = new int [columnCount_ * rowCount_];

    for (int i = 0; i < columnCount_ * rowCount_; i++)
    {
        data_[i] = '.';
    }

    for (int i = 0; i < columnCount_; i++)
    {
        SetCell(i, 0, '#');
        SetCell(i, rowCount_ - 1, '#');
    }

    for (int i = 0; i < rowCount_; i++)
    {
        SetCell(0, i, '#');
        SetCell(columnCount_ - 1, i, '#');
    }
}

LevelMap::~LevelMap()
{
    delete [] data_;
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
    if (column < 0.0f)
    {
        column -= 1.0f - 0.00001f;
    }
    if (row < 0.0f)
    {
        row -= 1.0f - 0.00001f;
    }
    return GetCell(static_cast<int>(column), static_cast<int>(row));
}

void LevelMap::SetCell(int column, int row, int value)
{
    data_[row * columnCount_ + column] = value;
}
