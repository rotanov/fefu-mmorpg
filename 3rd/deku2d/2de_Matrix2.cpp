#include "2de_Matrix2.h"

namespace Deku2D
{
	Vector2 Vector2::operator *(const Matrix2& M) const
	{
		Vector2 T;
		T.x = x * M.e11 + y * M.e12;
		T.y = x * M.e21 + y * M.e22;
		return T;
	}

	Vector2 Vector2::operator ^(const Matrix2& M) const
	{
		Vector2 T;
		T.x = x * M.e11 + y * M.e21;
		T.y = x * M.e12 + y * M.e22;
		return T;
	}

	Vector2& Vector2::operator *=(const Matrix2& M)
	{
		Vector2 T = *this;
		x = T.x * M.e11 + T.y * M.e12;
		y = T.x * M.e21 + T.y * M.e22;
		return *this;
	}

	Vector2& Vector2::operator ^=(const Matrix2& M)
	{
		Vector2 T = *this;
		x = T.x * M.e11 + T.y * M.e21;
		y = T.x * M.e12 + T.y * M.e22;
		return *this;
	}

}	//	namespace Deku2D