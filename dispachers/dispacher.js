// Handler contains the pair relation "path" -> "action"


function dispach(handler, pathname, request, response) {
  console.log("Dispatch a request to " + pathname);
  handler(pathname, request, response);
}

exports.dispach = dispach;