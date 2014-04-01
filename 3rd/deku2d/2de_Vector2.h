#ifndef _2DE_VECTOR2_H_
#define _2DE_VECTOR2_H_

#include <limits>

#include "2de_Math.h"


namespace Deku2D
{
	// If enabled then optimized version of 
	// Vector2.Length() used. It costs 5% accuracy.
	// #define OPTIMIZE_V2L
	class Vector2
	{
	public:
		float x, y;

		__INLINE Vector2() : x(0.0f), y(0.0f) {}

		__INLINE explicit Vector2(float Ax, float Ay) : x(Ax), y(Ay) {}

		__INLINE explicit Vector2(float value) : x(value), y(value) {}

		__INLINE Vector2(const std::vector<float> &values)
		{
			if (values.size() >= 2)
			{
				x = values[0];
				y = values[1];
			}
		}

		__INLINE float GetX() const { return x; }
		__INLINE float GetY() const { return y; }
		__INLINE void SetX(const float value) { x = value; }
		__INLINE void SetY(const float value) { y = value; }

		__INLINE float operator[](int i)
		{
			assert(i >= 0 && i <= 1);
			return *(&x + i);
		}

		__INLINE  Vector2 operator +(const Vector2 &V) const
		{ 
			return Vector2(x + V.x, y + V.y);
		}

		__INLINE Vector2 operator -(const Vector2 &V) const
		{ 
			return Vector2(x - V.x, y - V.y);
		}

		__INLINE Vector2 operator *(float a) const
		{ 
			return Vector2(x * a, y * a);
		}

		__INLINE Vector2 operator /(float a) const
		{
			assert(a != 0.0f);
			float t = 1.0f / a;
			return Vector2(x * t, y * t);
		}

        friend __INLINE Vector2 operator *(float k, const Vector2 &V)
		{
			return Vector2(V.x * k, V.y * k);
		}

		__INLINE Vector2& operator +=(const Vector2 &V)
		{
			x += V.x;
			y += V.y;
			return *this;
		}

		__INLINE Vector2& operator -=(const Vector2 &V)
		{
			x -= V.x;
			y -= V.y;
			return *this;
		}

		__INLINE Vector2& operator *=(float a)
		{
			x *= a;
			y *= a;
			return *this;
		}

		__INLINE Vector2& operator /=(float a)
		{
			return *this = *this / a;
		}

		__INLINE Vector2 operator -() const
		{
			return Vector2(-x, -y);
		}

		__INLINE float operator *(const Vector2 &V) const
		{
			return x * V.x + y * V.y;
		}

		__INLINE bool operator ==(const Vector2 &V) const
		{
			return Equal(x, V.x) && Equal(y, V.y);
		}

		__INLINE bool operator !=(const Vector2 &V) const
		{
			return !(*this == V);
		}

		Vector2 operator *(const Matrix2 &M) const;
		Vector2 operator ^(const Matrix2 &M) const;
		Vector2& operator *=(const Matrix2 &M);
		Vector2& operator ^=(const Matrix2 &M);

		__INLINE float Length() const
		{ 
		#ifdef OPTIMIZE_V2L
			float dx, dy;
			dx = Abs(x);
			dy = Abs(y);
			if (dx < dy)  
				return 0.961f * dy + 0.398f * dx;  
			else    
				return 0.961f * dx + 0.398f * dy;
		#else
			return static_cast<float>(sqrt(static_cast<double>(x * x + y * y)));
		#endif
		}

		__INLINE Vector2 GetPerpendicular() const
		{
			return Vector2(-y, x);
		}

		__INLINE Vector2 Normalized() const
		{
			return *this / Length();
		}

		__INLINE float Normalize()
		{
			float l = Length();
			assert(l != 0.0f);
			*this /= l;
			return l;
		}

		__INLINE Vector2 ComponentwiseMultiply(const Vector2& rhs)
		{
			Vector2 r = *this;
			r.x *= rhs.x;
			r.y *= rhs.y;
			return r;
		}
	};

	namespace Const
	{
		namespace Math
		{
			const Vector2 V2_NAN = Vector2(static_cast<float>(std::numeric_limits<float>::quiet_NaN()));
			const Vector2 V2_ZERO = Vector2(0.0f, 0.0f);
            const Vector2 V2_IDENTITY = Vector2(1.0f, 1.0f);
			const Vector2 V2_LEFT = Vector2(-1.0f, 0.0f);
			const Vector2 V2_RIGHT	= (-V2_LEFT);
			const Vector2 V2_UP = Vector2(0.0f, 1.0f);
			const Vector2 V2_DOWN = (-V2_UP);
			const Vector2 V2_MIDDLE = Vector2(0.5f, 0.5f);
			const Vector2 V2_BOTTOM_LEFT = Vector2(-1.0f, -1.0f);
			const Vector2 V2_BOTTOM_RIGHT = Vector2(1.0f, -1.0f);
			const Vector2 V2_TOP_LEFT = Vector2(1.0f, -1.0f);
			const Vector2 V2_TOP_RIGHT = Vector2(1.0f, 1.0f);
			const Vector2 V2_DIRECTIONS[4] = {V2_LEFT, V2_DOWN, V2_RIGHT, V2_UP,};
			const Vector2 V2_DIRECTIONS_DIAG[4] = {V2_BOTTOM_LEFT, V2_BOTTOM_RIGHT, V2_TOP_RIGHT, V2_TOP_LEFT,};
		}	//	namespace Math

	}	//	namespace Const


	template<>
	__INLINE Vector2 RandomRange<Vector2>(const Vector2 &AMin, const Vector2 &AMax)
	{
		return Vector2
			(
				Random_Float(AMin.x, AMax.x),
				Random_Float(AMin.y, AMax.y)
			);
	}

	template<>
	__INLINE Vector2 Clamp(const Vector2 &x, const Vector2 &min, const Vector2 &max)
	{
		Vector2 result;
		result.x = Clamp(x.x, min.x, max.x);
		result.y = Clamp(x.y, min.y, max.y);
		return result;
	}

    template <>
    __INLINE Vector2 RoundBy(const Vector2& x, float by)
    {
        Vector2 r;
        r.x = RoundBy(x.x, by);
        r.y = RoundBy(x.y, by);
        return r;
    }

    template<>
    __INLINE Vector2 Abs(const Vector2 &x)
    {
        return Vector2(std::fabs(x.x), std::fabs(x.y));
    }

}	//	namespace Deku2D

#endif	//	_2DE_VECTOR2_H_
