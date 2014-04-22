#pragma once

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

    void Resize(int columnCount, int rowCount);

private:
    void InitData_();

    int rowCount_;
    int columnCount_;
    int* data_;
};
