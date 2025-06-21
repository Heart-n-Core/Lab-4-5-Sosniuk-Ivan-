from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json

PORT = 7000
INDEX_FILE = "index.html"

class SimpleHandler(BaseHTTPRequestHandler):
    print("Using SimpleHandler class")

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            if os.path.exists(INDEX_FILE):
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                with open(INDEX_FILE, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"index.html not found")

        elif self.path.endswith(".js"):
            js_file = self.path.lstrip("/")  # removes leading '/'
            if os.path.exists(js_file):
                self.send_response(200)
                self.send_header("Content-type", "application/javascript")
                self.end_headers()
                with open(js_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"JS file not found")
        elif self.path.endswith(".json"):
            json_file = self.path.lstrip("/")
            if os.path.exists(json_file):
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                with open(json_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"JSON file not found")
        elif "/images" in self.path:
            if self.path.startswith("/"):
                media_file = self.path[1:]  # remove only the first slash
            else:
                media_file = self.path
            if os.path.exists(media_file):
                self.send_response(200)
                
                ext = os.path.splitext(media_file)[1].lower()  # Get file extension in lowercase
                if ext == ".jpg" or ext == ".jpeg":
                    content_type = "image/jpeg"
                elif ext == ".png":
                    content_type = "image/png"
                elif ext == ".gif":
                    content_type = "image/gif"
                elif ext == ".svg":
                    content_type = "image/svg+xml"
                else:
                    content_type = "application/octet-stream"  # fallback for unknown types
                    
                self.send_header("Content-type", content_type)
                self.end_headers()
                with open(media_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"mediafile not found")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")
    def do_POST(self):
        print("POST received")
        if self.path == "/order":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b""
            
            # For demo, just echo back the length of data received
            response = f"Received POST data of length: {len(post_data)}".encode()
            # response = f"Order processed successfully".encode()
            response_data= {"message":"Order processed successfully"}
            response_json = json.dumps(response_data).encode('utf-8')

            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(response_json)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SimpleHandler)
    print(f"Serving on port {PORT}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()