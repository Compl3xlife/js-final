from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UPSTREAM = "https://unhuman.autos"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/cars" or path.startswith("/api/cars/") or path.startswith("/api/vin/"):
            self.proxy_car_api()
            return
        super().do_GET()

    def proxy_car_api(self):
        request = Request(
            UPSTREAM + self.path,
            headers={"User-Agent": "js-final", "Accept": "application/json"},
        )
        try:
            with urlopen(request, timeout=30) as response:
                body = response.read()
                status = response.status
                content_type = response.headers.get("Content-Type", "application/json")
        except HTTPError as error:
            body = error.read()
            status = error.code
            content_type = "application/json"
        except URLError as error:
            body = str(error.reason).encode()
            status = 502
            content_type = "text/plain"
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
    print("serving http://127.0.0.1:8765")
    server.serve_forever()
