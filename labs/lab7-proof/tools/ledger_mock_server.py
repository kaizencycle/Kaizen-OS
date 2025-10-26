# tools/ledger_mock_server.py
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    def _send(self, code, payload):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(payload, indent=2).encode())

    def do_POST(self):
        if self.path != "/attest":
            return self._send(404, {"ok": False, "error": "Not Found"})
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(body.decode())
        except Exception:
            return self._send(400, {"ok": False, "error": "Invalid JSON"})
        # Echo back a mock receipt with a fake tx id
        receipt = {"ok": True, "tx": "mock_tx_" + str(abs(hash(body)) % 10**8), "received": data}
        return self._send(200, receipt)

if __name__ == "__main__":
    host, port = "127.0.0.1", 8787
    print(f"Mock ledger listening on http://{host}:{port}/attest")
    HTTPServer((host, port), Handler).serve_forever()
