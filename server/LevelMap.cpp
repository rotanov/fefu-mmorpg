#include "LevelMap.hpp"

LevelMap::LevelMap(int columnCount, int rowCount)
    : columnCount_(columnCount)
    , rowCount_(rowCount)
{
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

int& LevelMap::GetCell(int column, int row)
{
    return data_[row * columnCount_ + column];
}

const int&LevelMap::GetCell(int column, int row) const
{
    return data_[row * columnCount_ + column];
}

void LevelMap::SetCell(int column, int row, int value)
{
    data_[row * columnCount_ + column] = value;
}
