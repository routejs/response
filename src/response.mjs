import parseNodeResponse from "./response/node.cjs";
const supportedServers = ["node"];

export default function response({ res, req }, options = {}) {
  // Set default value
  options.server = options.server || "node";
  // Create http response object
  if (
    options.server &&
    (typeof options.server === "string" || options.server instanceof String)
  ) {
    if (!supportedServers.includes(options.server.toLowerCase())) {
      throw new TypeError(options.server + " is not supported");
    }

    if (options.server.toLowerCase() === "node") {
      res = parseNodeResponse({ req, res }, options);
    }
  } else {
    // Create default http response object
    res = parseNodeResponse({ req, res }, options);
  }

  res.locals = {};
  return res;
}
