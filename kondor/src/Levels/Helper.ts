export function inXSeconds(seconds) {
  let d = new Date();
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}

export function inXMilliseconds(milliSeconds) {
  let d = new Date();
  d.setMilliseconds(d.getMilliseconds() + milliSeconds);
  return d;
}
