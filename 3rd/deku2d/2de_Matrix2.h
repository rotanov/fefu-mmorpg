#ifndef _2DE_MATRIX2_H_
#define	_2DE_MATRIX2_H_

#include "2de_Math.h"
#include "2de_Vector2.h"

namespace Deku2D
{
	class Matrix2
	{
	public:
		float e11;
		float e12;
		float e21;
		float e22;

		Matrix2(float _e11, float _e12, float _e21, float _e22) : e11(_e11), e12(_e12), e21(_e21), e22(_e22)
		{}

		Matrix2()
		{}

		Matrix2(float angle)
		{
			float c = cos(angle);
			float s = sin(angle);

			e11 = c; e12 = s;
			e21 =-s; e22 = c;
		}

		// 	float  operator()(int i, int j) const 
		// 	{
		// 		return e[i][j];
		// 	}
		// 
		// 	float& operator()(int i, int j)       
		// 	{
		// 		return e[i][j];
		// 	}

		// 	const Vector2& operator[](int i) const
		// 	{
		// 		return reinterpret_cast<const Vector2&>(e[i][0]);
		// 	}
		// 
		// 	Vector2& operator[](int i)
		// 	{
		// 		return reinterpret_cast<Vector2&>(e[i][0]);
		// 	}		

		static Matrix2 Identity()
		{
			static const Matrix2 T(1.0f, 0.0f, 0.0f, 1.0f);

			return T;
		}

		static Matrix2 Zero()
		{
			static const Matrix2 T(0.0f, 0.0f, 0.0f, 0.0f);

			return T;
		}

		Matrix2 Tranpose()
		{
			std::swap(e12, e21);
			return *this;
		}

		Matrix2 Tranposed() const
		{
			Matrix2 T;

			T.e11 = e11;
			T.e21 = e12;
			T.e12 = e21;
			T.e22 = e22;

			return T;
		}

		__INLINE Matrix2 operator - () const
		{
			Matrix2 T;
			T.e11 = -e11;
			T.e12 = -e12;
			T.e21 = -e21;
			T.e22 = -e22;
			return T;
		}

		__INLINE Matrix2 Inverted() const
		{
			Matrix2 temp = *this;
			temp = Matrix2(e22, -e12, -e21, e11) * (1.0f / Determinant());
			return temp;
		}

		Matrix2 operator * (const Matrix2& M) const 
		{
			Matrix2 T;

			T.e11 = e11 * M.e11 + e12 * M.e21;
			T.e21 = e21 * M.e11 + e22 * M.e21;
			T.e12 = e11 * M.e12 + e12 * M.e22;
			T.e22 = e21 * M.e12 + e22 * M.e22;

			return T;
		}

		Matrix2 operator ^ (const Matrix2& M) const 
		{
			Matrix2 T;

			T.e11 = e11 * M.e11 + e12 * M.e12;
			T.e21 = e21 * M.e11 + e22 * M.e12;
			T.e12 = e11 * M.e21 + e12 * M.e22;
			T.e22 = e21 * M.e21 + e22 * M.e22;

			return T;
		}

		__INLINE Matrix2 operator * (float s) const
		{
			Matrix2 T;

			T.e11 = e11 * s;
			T.e21 = e21 * s;
			T.e12 = e12 * s;
			T.e22 = e22 * s;

			return T;
		}

		__INLINE Matrix2 operator + (const Matrix2 &M) const
		{
			Matrix2 T;
			T.e11 = e11 + M.e11;
			T.e12 = e12 + M.e12;
			T.e21 = e21 + M.e21;
			T.e22 = e22 + M.e22;
			return T;
		}

		__INLINE Matrix2 operator - (const Matrix2 &M) const
		{
			Matrix2 T;
			T.e11 = e11 - M.e11;
			T.e12 = e12 - M.e12;
			T.e21 = e21 - M.e21;
			T.e22 = e22 - M.e22;
			return T;
		}

		__INLINE float Determinant() const
		{
			return e11 * e22 - e12 * e21;
		}
	};

}	//	namespace Deku2D

#endif	//	_2DE_MATRIX2_H_
