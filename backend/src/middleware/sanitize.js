// NoSQL injection roka jaata hai ({"email": {"$gt": ""}} jaisi attacks).
// express-mongo-sanitize Express 5 ke saath kaam nahi karta (req.query read-only hai),
// isliye apna chhota sanitizer.
function clean(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else {
      clean(obj[key]);
    }
  }
}

export function sanitize(req, _res, next) {
  clean(req.body);
  clean(req.params);
  clean(req.query);
  next();
}
