import NodeResponse from "./response/node.cjs";

export default function response({ res, req }, options = {}) {
  // Create http response object
  if (
    options.server &&
    (typeof options.server === "string" || options.server instanceof String)
  ) {
    if (!supportedServers.includes(options.server.toLowerCase())) {
      throw new TypeError(`Error: ${options.server} is not supported`);
    }

    if (options.server.toLowerCase() === "node") {
      res = Object.assign(res, NodeResponse);
    }
  } else {
    // Create default http response object
    res = Object.assign(res, NodeResponse);
  }

  res.locals = {};
  return res;
}
