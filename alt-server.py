from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
import mimetypes # Import mimetypes to guess content types

PORT = 7000
INDEX_FILE = "index.html" # Assuming index.html is in the same directory as the server script

# Add common MIME types for files you expect to serve, especially CSS
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json", ".json")

class SimpleHandler(BaseHTTPRequestHandler):
    print("Using SimpleHandler class")

    def do_GET(self):
        # Determine the full path to the requested file
        requested_path = self.path.lstrip('/')
        if not requested_path: # If path is just '/', serve index.html
            requested_path = INDEX_FILE

        file_path = os.path.join(os.getcwd(), requested_path) # Construct full path

        # Try to serve the file if it exists
        if os.path.exists(file_path) and os.path.isfile(file_path):
            try:
                # Guess the MIME type based on the file extension
                content_type, _ = mimetypes.guess_type(file_path)
                if content_type is None:
                    content_type = "application/octet-stream" # Default for unknown types

                self.send_response(200)
                self.send_header("Content-type", content_type)
                self.end_headers()

                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return # File served, stop here
            except IOError:
                # Fall through to 404 if there's an issue reading the file
                pass

        # Specific handling for the root path if index.html is not found directly above
        # This block is somewhat redundant if the general file serving works,
        # but kept for explicit handling if that's desired
        if self.path == "/" and os.path.exists(INDEX_FILE):
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            with open(INDEX_FILE, "rb") as f:
                self.wfile.write(f.read())
            return

        # Handle POST requests (your existing logic)
        elif self.path == "/order" and self.command == 'POST':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b""

            response_data = {"message": "Order processed successfully", "received_data_length": len(post_data)}
            response_json = json.dumps(response_data).encode('utf-8')

            self.send_response(200)
            self.send_header("Content-type", "application/json") # Changed to application/json
            self.end_headers()
            self.wfile.write(response_json)
            return

        # If none of the above matched, return 404
        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"File or resource not found")
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
    print(f"Serving on port {PORT} from directory: {os.getcwd()}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()