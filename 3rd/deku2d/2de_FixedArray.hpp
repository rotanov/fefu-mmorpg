#pragma once

namespace Deku2D
{

#define D2D_ASSERT

template<typename Type, unsigned count>
class FixedArray
{
public:
    explicit FixedArray(const Type& defaultValue)
    {
        for (unsigned i = 0; i < count; i++)
        {
            elements_[i] = defaultValue;
        }
    }

    FixedArray()
    {
        for (unsigned i = 0; i < count; i++)
        {
            elements_[i] = Type();
        }
    }

    Type& operator [](unsigned index)
    {
        D2D_ASSERT(index >= 0 && index < count);
        return elements_[index];
    }

    const Type& operator [](unsigned index) const
    {
        D2D_ASSERT(index >= 0 && index < count);
        return elements_[index];
    }

private:
    Type elements_[count];
};

} // namespace Deku2D
