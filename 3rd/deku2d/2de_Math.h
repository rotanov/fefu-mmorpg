/**
*	created:	2007/11/06 2:03
*	filename: 	2de_Math.h
*	author:		D. Rotanov
*	purpose:	General mathematical routines and classes
*/

#ifndef _2DE_MATH_UTILS_H_
#define _2DE_MATH_UTILS_H_

#include <cmath>
#include <cassert>
#include <stdexcept>
#include <vector>

namespace Deku2D
{
	#ifndef __INLINE
		#if defined(_MSC_VER)
			#define __INLINE __forceinline
		#elif __GNUC__ >= 4
			#define __INLINE __inline __attribute__ ((always_inline))
		#else
			#define __INLINE inline
		#endif
	#endif

	#if defined(min)
		#undef min
	#endif

	#if defined(max)
		#undef max
	#endif

	namespace Const
	{
		namespace Math
		{
			const float	epsilon = 0.00001f;
			const float PI = 3.1415926f;
			const float PI_D2 = PI / 2.0f;
			const float PI2	= PI * 2.0f;
			const float OOPI = 0.3183098f;
			const int SINE_COSINE_TABLE_DIM	= 8192;
			const float deganglem =	static_cast<float>(SINE_COSINE_TABLE_DIM) / 360.0f;
			const float radanglem =	static_cast<float>(SINE_COSINE_TABLE_DIM) / PI2;
			const float PI_d180 = PI / 180.0f;
			const float d180_PI	= 180.0f / PI;
		}	//	namespace Math
	}	//	namespace Const
	extern unsigned g_seed;

	class Vector2;
	class Matrix2;

	void GenSinTable();
	float fSinr(float angle);
	float fSind(float angle);
	float fSini(int index);
	float fCosr(float angle);
	float fCosd(float angle);
	float fCosi(int index);

	#define Random_Int RandomRange<int>
	#define Random_Float RandomRange<float>

	template <typename T>
	__INLINE T RandomRange(const T &AMin, const T &AMax)
	{
		assert(false);
	}

	template <>
	__INLINE int RandomRange<int>(const int &min, const int &max)
	{
		assert(max - min + 1);
		g_seed = 214013*g_seed + 2531011;
		return min + (g_seed^g_seed>>15) % (max - min + 1);
	}

	template <>
	__INLINE float RandomRange<float>(const float &min, const float &max)
	{
		g_seed = 214013 * g_seed + 2531011;
		//return min + g_seed * (1.0f / 4294967295.0f) * (max - min);
		return min + (g_seed >> 16) * (1.0f / 65535.0f) * (max - min);
	}

	template<typename T>
	__INLINE T Clamp(const T &x , const T &min, const T &max)
	{
		return std::min(std::max(x, min), max);
	}

	__INLINE float DegToRad(float degree)
	{ 
		return static_cast<float>(degree * Const::Math::PI_d180);
	}

	__INLINE float RadToDeg(float radian)
	{
		return static_cast<float>(radian * Const::Math::d180_PI);
	}

	template<typename T>
	__INLINE T Round(const T& x)
	{
		if (x >= 0.0f)
		{
			return floor(x + 0.5f);
		}
		else
		{
			return ceil(x - 0.5f);
		}
	}

    template <typename T>
    __INLINE T RoundBy(const T& x, float by)
	{
        int integralTimes = static_cast<int>(floor(x / by));
		float remainder = x - integralTimes * by;
        T result = integralTimes * by;
		if (remainder > by * 0.5f)
		{
			result += by;
		}
		return result;
	}

	template<typename T>
	__INLINE T Sqr(const T &x)
	{
		return x * x;
	}

	template<typename T>
	__INLINE T Cube(const T &x)
	{
		return x * x * x;
	}

	template<typename T>
	__INLINE T Abs(const T& x)
	{
		return x < 0 ? -x : x;
	}

	template<>
	__INLINE float Abs(const float &x)
	{
		return std::fabs(x);
	}

	template<typename T>
	__INLINE bool Equal(const T &a, const T &b)
	{
		return Abs(a - b) < Const::Math::epsilon;
	}

    template <typename T>
    __INLINE int Sign(T x, std::false_type is_signed)
    {
        return T(0) < x;
    }

    template <typename T>
    __INLINE int Sign(T x, std::true_type is_signed)
    {
        return (T(0) < x) - (x < T(0));
    }

    template <typename T>
    __INLINE int Sign(T x)
    {
        return Sign(x, std::is_signed<T>());
    }

	/**
	*	Interpolate between interval [a,b] with t in [0,1].	
	*/
    template <typename T>
    __INLINE T LinearInterpolate(const T& a, const T& b, float t)
	{
		return a + (b - a) * t;
	}

    template <typename T>
    __INLINE T CosineInterpolate(const T& a, const T& b, float t)
	{
        return a + (b - a) * (1.0f - cos(t * Const::Math::PI)) * 0.5f;
	}

	// Here v1 is the "a" point and v2 is the "b" point. v0 is "the point before a" and v3 is "the point after b".
	__INLINE float CubicInterpolate(float v0, float v1, float v2, float v3, float t)
	{
		float P = (v3 - v2) - (v0 - v1);
		float Q = (v0 - v1) - P;
		float R = v2 - v0;
		float S = v1;
		float x2 = t * t;
		float x3 = x2 * t;
		return P * x3 + Q * x2 + R * t + S;
	}

    template <typename T>
    __INLINE T CatmullRomInterpolate(const T& v0, const T& v1, const T& v2, const T& v3, float t)
	{
        float t2 = t * t;
        float t3 = t2 * t;
        return v1 + (
            (v2 - v0) * t +
            (v0 * 2.0f + v2 * 4.0f - v1 * 5.0f - v3) * t2 +
            (v1 * 3.0f + v3 - v0 - v2 * 3.0f) * t3) * 0.5f;
	}

	// Also i heard about some Hermite interpolation here http://local.wasp.uwa.edu.au/~pbourke/miscellaneous/interpolation/
	// but i think we won't ever need it. And also some keywords: Bezier, Spline, and piecewise Bezier.
	// Also-also look here for perlin noise http://freespace.virgin.net/hugo.elias/models/m_perlin.htm and other stuff

	// Snap floating point number to grid.
	__INLINE float Snap(float p, float grid)
	{
		return grid ? static_cast<float>(floor((p + grid * 0.5f) / grid) * grid) : p;
	}

	/**
	*	SqareEq(...) Решает квдратное уравнение.
	*	Корни - t0 и t1
	*	a b c - соответствующие коэффициенты квадратного уравнения.
	*/
	bool SqareEq(float a, float b, float c, float &t0, float &t1);

	/**
	*	HalfPlaneSign - определяет знак полуплоскости точки x относительно прямой, лежащей на отрезке [u0, u1].
	*	Если точка лежит на прямой, то результат 0.0f
	*/
	float HalfPlaneSign(const Vector2 &u0, const Vector2 &u1, const Vector2 &p);

	/**
	*	DistanceToLine - определяет расстояние со знаком от точки до прямой, лежащей на отрезке.
	*/
	float DistanceToLine(const Vector2 &u0, const Vector2 &u1, const Vector2 &p);

	/**
	*	DistanceToSegment - определяет расстояние со знаком от точки до отрезка.
	*	@todo: Возможно есть более быстрый способ определять знак расстояниея в случаях конца отрезка.
	*	@todo: Возможно стоит возвращать ещё и найденный случай, т.е. первая точка отрезка, вторая или сам отрезок.
	*/
	float DistanceToSegment(const Vector2 &u0, const Vector2 &u1, const Vector2 &p);

	/**
	*	IntersectLines - определяет точку пересечения прямых, лежащих на отрезках, если они пересекаются.
	*/
	bool IntersectLines(const Vector2 &u0, const Vector2 &u1, const Vector2 &v0, const Vector2 &v1, Vector2 &Result);

	/**
	*	IntersectSegments(): returns intersection point if segments intersect.
	*	Notice, that it is segments, not infinite lines.
	*	@todo: check out coincident lines case.
	*/
	bool IntersectSegments(const Vector2 &u0, const Vector2 &u1, const Vector2 &v0, const Vector2 &v1, Vector2 &Result);

	/**
	*	AreSegmentsIntersect(): checks if segments intersect.
	*	Notice, that it is segments, not infinite lines.
	*	@todo: check out coincident lines case.
	*/
	bool AreSegmentsIntersect(const Vector2 &u0, const Vector2 &u1, const Vector2 &v0, const Vector2 &v1);

	/**
	*	CalcConvexHull does exactly how it named.
	*	Taken from http://www.e-maxx.ru/algo/convex_hull_graham and slightly 
	*	modified in order to fit naming conventions and interfaces
	*/
	__INLINE void CalcConvexHull (std::vector<Vector2> &a);

}	//	namespace Deku2D

#endif // _2DE_MATH_UTILS_H_
