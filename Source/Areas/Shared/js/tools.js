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

    getDistanceBetweenPoints(aPosition.x,bPosition.x,aPosition.y,bPosition.y);
}

function getDistanceBetweenPoints(x1, x2, y1, y2){
    return Math.hypot(x1 - x2, y1 - y2);
}