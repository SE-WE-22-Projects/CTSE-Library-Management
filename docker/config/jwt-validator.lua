-- JWT Validator Lua Script for Nginx
-- Validates Bearer tokens against user-service JWKS endpoint

local jwt = require "resty.jwt"
local http = require "resty.http"

local function get_jwks()
  local httpc = http.new()
  local res, err = httpc:request_uri("http://user_service:3002/.well-known/jwks.json", {
    method = "GET",
    headers = {
      ["Content-Type"] = "application/json",
    },
    timeout = 5000,
  })

  if not res then
    ngx.log(ngx.ERR, "Failed to fetch JWKS: ", err)
    return nil
  end

  if res.status ~= 200 then
    ngx.log(ngx.ERR, "JWKS endpoint returned status: ", res.status)
    return nil
  end

  return cjson.decode(res.body)
end

local function validate_token()
  local auth_header = ngx.var.http_authorization

  if not auth_header then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ error = "Missing Authorization header" }))
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
  end

  local token = auth_header:match("Bearer%s+(.+)")
  if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ error = "Invalid Authorization header format. Use: Bearer <token>" }))
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
  end

  local jwks = get_jwks()
  if not jwks then
    ngx.status = ngx.HTTP_SERVICE_UNAVAILABLE
    ngx.say(cjson.encode({ error = "Unable to retrieve JWKS for validation" }))
    return ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
  end

  -- Verify JWT with JWKS
  local jwt_obj = jwt:verify(token, jwks)

  if not jwt_obj.valid then
    ngx.log(ngx.WARN, "JWT validation failed: ", jwt_obj.reason)
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say(cjson.encode({ error = "Invalid token: " .. jwt_obj.reason }))
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
  end

  -- Check expiration
  if jwt_obj.verified and jwt_obj.payload.exp then
    if jwt_obj.payload.exp < ngx.time() then
      ngx.status = ngx.HTTP_UNAUTHORIZED
      ngx.say(cjson.encode({ error = "Token expired" }))
      return ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
  end

  -- Set user info in headers for backend
  if jwt_obj.payload then
    ngx.req.set_header("X-User-Id", jwt_obj.payload.user_id or "")
    ngx.req.set_header("X-Username", jwt_obj.payload.username or "")
    ngx.req.set_header("X-Permissions", cjson.encode(jwt_obj.payload.permissions or {}))
  end

  ngx.log(ngx.INFO, "JWT validated for user: ", jwt_obj.payload.username)
end

return validate_token()
