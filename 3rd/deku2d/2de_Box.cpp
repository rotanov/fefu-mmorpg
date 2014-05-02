#include "2de_Box.h"

namespace Deku2D
{
	//////////////////////////////////////////////////////////////////////////
	// CBox
	Box::Box()
        : min(Const::Math::V2_ZERO)
        , max(Const::Math::V2_ZERO)
	{}

    Box::Box(const Vector2 &AMin, const Vector2 &AMax) : min(AMin), max(AMax)
	{
		//assert(Min.x <= Max.x && Min.y <= Max.y);
	}

    Box::Box(float xmin, float ymin, float xmax, float ymax) : min(xmin, ymin), max(xmax, ymax)
	{
		//assert(xmin <= xmax && ymin <= ymax);
	}

	Box::Box(int x, int y, unsigned width, unsigned height)
        : min(static_cast<float>(x), static_cast<float>(y))
        , max(static_cast<float>(x + width), static_cast<float>(y + height))
	{}

    Box::Box(const Vector2 &center, float width, float height)
        : min(center)
        , max(center)
	{
        assert(width >= 0.0f && height >= 0.0f);
        Vector2 tempWHd2 = Vector2(width, height) * 0.5f;
        min -= tempWHd2;
        max += tempWHd2;
	}

    Box::Box(const Vector2 &center, float radius)
        : min(center)
        , max(center)
	{
        assert(radius >= 0.0f);
        Vector2 tempRRd2 = Vector2(radius, radius) * 0.5f;
        min -= tempRRd2, max += tempRRd2;
	}

    Box::Box(const FixedArray<Vector2, 4>& vertices)
        : min(vertices[0])
        , max(vertices[2])
	{
        assert(min.x <= max.x && min.y <= max.y);
	}

	Box::Box(const Vector2& value)
        : min(value)
        , max(value)
	{

    }

    Box& Box::operator /=(const float rhs)
    {
        min /= rhs;
        max /= rhs;
        return *this;
    }

    Box &Box::operator *=(const float rhs)
    {
        min *= rhs;
        max *= rhs;
        return *this;
    }

	void Box::Add(const Vector2 &Point)
	{
		// weird comparison like !(a <= b) instead of (a > b) is for handling NaNs
        if (!(Point.x <= max.x))
            max.x = Point.x;

        if (!(Point.x >= min.x))
            min.x = Point.x;

        if (!(Point.y <= max.y))
            max.y = Point.y;

        if (!(Point.y >= min.y))
            min.y = Point.y;
	}

	void Box::Offset(float dx, float dy)
	{
		Offset(Vector2(dx, dy));	
	}

	void Box::Offset(const Vector2 &Delta)
	{
        min += Delta, max += Delta;
	}

	Box Box::Offsetted(float dx, float dy) const
	{
		return Offsetted(Vector2(dx, dy));
	}

	Box Box::Offsetted(const Vector2 &Delta) const
	{
        return Box(min + Delta, max + Delta);
	}

	void Box::Inflate(float dx, float dy)
	{
		Vector2 Delta(dx, dy);
        min -= Delta, max += Delta;
	}

	Box Box::Inflated(float dx, float dy) const
	{
		Vector2 Delta(dx, dy);
        return Box(min - Delta, max + Delta);
	}

    bool Box::Inside(const Vector2& point) const
	{
        // Could just write "return !expression", but had to set breakpoints
        if (point.x >= max.x || point.x <= min.x || point.y >= max.y || point.y <= min.y)
		{
			return false;
		}
		else
		{
			return true;
		}
	}

	bool Box::Inside(const Vector2 &Point, float &MTD) const
	{
        if (Point.x >= max.x || Point.x <= min.x || Point.y >= max.y || Point.y <= min.y)
        {
			return false;
        }

		float d1, d2, d3, d4;
        d1 =  max.x - Point.x;
        d2 =  max.y - Point.y;
        d3 = -min.x + Point.x;
        d4 = -min.y + Point.y;
		MTD = std::min(std::min(d1, d2), std::min(d3, d4));
		return true;
	}

	bool Box::Inside(const Vector2 &Point, float &MTD, Vector2 &n) const
	{
        if (Point.x >= max.x || Point.x <= min.x || Point.y >= max.y || Point.y <= min.y)
        {
			return false;
        }

		//DistanceToLine
		float d1, d2, d3, d4;
        d1 =  max.x - Point.x;
        d2 =  max.y - Point.y;
        d3 = -min.x + Point.x;
        d4 = -min.y + Point.y;
		MTD = std::min(std::min(d1, d2), std::min(d3, d4));

		if (MTD == d1)
        {
			n = Vector2(1.0f, 0.0f);
        }
        else if (MTD == d2)
        {
			n = Vector2(0.0f, 1.0f);
        }
        else if (MTD == d3)
        {
			n = Vector2(-1.0f, 0.0f);
        }
        else if (MTD == d4)
        {
			n = Vector2(0.0f, -1.0f);
        }
        else
        {
            assert(false);
        }

		return true;
	}

	bool Box::Outside(const Vector2 &Point, float &MTD, Vector2 &n) const
	{
		if (Inside(Point))
			return false;

		//DistanceToLine
		float d1, d2, d3, d4;
        d1 = -max.x + Point.x;
        d2 = -max.y + Point.y;
        d3 =  min.x - Point.x;
        d4 =  min.y - Point.y;
		MTD = std::min(std::min(d1, d2), std::min(d3, d4));

		if (MTD == d1)
			n = Vector2(1.0f, 0.0f);
		if (MTD == d2)
			n = Vector2(0.0f, 1.0f);
		if (MTD == d3)
			n = Vector2(-1.0f, 0.0f);
		if (MTD == d4)
			n = Vector2(0.0f, -1.0f);

		return true;
	}

	bool Box::Intersect(const Box &box) const
	{
        if (box.min.x >= max.x)
			return false;
        if (box.min.y >= max.y)
			return false;
        if (box.max.x <= min.x)
			return false;
        if (box.max.y <= min.y)
			return false;

		return true;
	}

	void Box::Union(const Box &other)
	{
        Add(other.max);
        Add(other.min);
	}

	float Box::Width() const
	{
        return max.x - min.x;
    }

    void Box::Normalize()
    {
        if (min.x == min.x && max.x == max.x && min.x > max.x)
        {
            std::swap(min.x, max.x);
        }

        if (min.y == min.y && max.y == max.y && min.y > max.y)
        {
            std::swap(min.y, max.y);
        }
    }

    Vector2 Box::Size() const
    {
        return Vector2(Abs(max - min));
    }

	float Box::Height() const
	{
        return max.y - min.y;
	}

	FixedArray<Vector2, 4> Box::GetVertices() const
	{
		FixedArray<Vector2, 4> Result;
        Result[0] = min;
        Result[1] = Vector2(max.x, min.y);
        Result[2] = max;
        Result[3] = Vector2(min.x, max.y);;
		return Result;
	}

	Vector2 Box::Center()
	{
        return (min + max) * 0.5f;
	}

}	//	namespace Deku2D
