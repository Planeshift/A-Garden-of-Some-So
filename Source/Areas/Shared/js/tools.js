function getPositionAtCenter(element) {
    const {top, left, width, height} = element.getBoundingClientRect();
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  }
 
function getDistanceBetweenElements(a, b) {
    const aPosition = getPositionAtCenter(a);
    const bPosition = getPositionAtCenter(b);

    console.log("Argh");
    console.log(aPosition);
    console.log(bPosition);

    return getDistanceBetweenPoints(aPosition.x,bPosition.x,aPosition.y,bPosition.y);
}

function getDistanceBetweenPoints(x1, x2, y1, y2){
    return Math.hypot(x1 - x2, y1 - y2);
}

// Straight from stackOverflow: https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function

// Answer by Dan Fox:

/*
Explanation: (vectors, a matrix and a cheeky determinant)

Lines can be described by some initial vector, v, and a direction vector, d:

r = v + lambda*d 

We use one point (a,b) as the initial vector and the difference between them (c-a,d-b) as the direction vector. Likewise for our second line.

If our two lines intersect, then there must be a point, X, that is reachable by travelling some distance, lambda, along our first line and also reachable by travelling gamma units along our second line. This gives us two simultaneous equations for the coordinates of X:

X = v1 + lambda*d1 
X = v2 + gamma *d2

These equations can be represented in matrix form. We check that the determinant is non-zero to see if the intersection X even exists.

If there is an intersection, then we must check that the intersection actually lies between both sets of points. If lambda is greater than 1, the intersection is beyond the second point. If lambda is less than 0, the intersection is before the first point.

Hence, 0<lambda<1 && 0<gamma<1 indicates that the two lines intersect!
*/

/**
 * Tests if two lines L1 and L2 defined by the points (a,b) / (c,d) for L1 and (p,q) / (r,s) for L2 intersects. Careful with edge cases when they are parallel or the "same" line.
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} c 
 * @param {Number} d 
 * @param {Number} p 
 * @param {Number} q 
 * @param {Number} r 
 * @param {Number} s 
 * @returns {Boolean} True if lines intersects, false otherwise.
 */

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };

  // Delaunator helper functions

  
function edgesOfTriangle(t) { return [3 * t, 3 * t + 1, 3 * t + 2]; }
function triangleOfEdge(e)  { return Math.floor(e / 3); }

function nextHalfedge(e) { return (e % 3 === 2) ? e - 2 : e + 1; }
function prevHalfedge(e) { return (e % 3 === 0) ? e + 2 : e - 1; }

