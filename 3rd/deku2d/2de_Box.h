#ifndef _2DE_BOX_H_
#define _2DE_BOX_H_

#include "2de_Vector2.h"
#include "2de_FixedArray.hpp"

namespace Deku2D
{
	/**
	*	CBox - rectangle representation for common needs.	
	*	It is always Axis Aligned.
	*	If you need more general rectangle - use CRentangle geometry representation
	*/
	class Box
	{
	public:
        Vector2 min;
        Vector2 max;

		Box();
		Box(const Vector2 &AMin, const Vector2 &AMax);
		Box(float xmin, float ymin, float xmax, float ymax);
		Box(int x, int y, unsigned width, unsigned height);
        Box(const Vector2 &center, float width, float height);
        Box(const Vector2 &center, float radius);
        Box(const FixedArray<Vector2, 4> &vertices);
		explicit Box(const Vector2& value);

        Vector2 GetMin() const { return min; }
        Vector2 GetMax() const { return max; }

        void SetMin(const Vector2& min_)
        {
            min = min_;
            Normalize();
        }

        void SetMax(const Vector2& max_)
        {
            max = max_;
            Normalize();
        }

        Box& operator /=(const float rhs);
        Box& operator *=(const float rhs);

		
		void Add(const Vector2 &Point);
		Vector2 Center();
		float Height() const;
		void Inflate(float x, float y);
		Box Inflated(float x, float y) const;
        bool Inside(const Vector2 &point) const;
		bool Inside(const Vector2 &Point, float &MTD) const;
		bool Inside(const Vector2 &Point, float &MTD, Vector2 &n) const;
		bool Intersect(const Box &box) const;
		void Offset(float dx, float dy);
		void Offset(const Vector2 &Delta);
		Box Offsetted(float dx, float dy) const;
		Box Offsetted(const Vector2 &Delta) const;
		bool Outside(const Vector2 &Point, float &MTD, Vector2 &n) const;
		void Union(const Box &other);
		float Width() const;
        void Normalize();
        Vector2 Size() const;

		/**
        *	Returns box vertices in order: Lower-left, Lower-right, Upper-Right, Upper-Left;
		*/
		FixedArray<Vector2, 4> GetVertices() const;
	};

}	//	namespace Deku2D

#endif	//	_2DE_BOX_H_
