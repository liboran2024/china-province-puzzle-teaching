"""Serve the built classroom game locally; no third-party Python packages needed."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser

base = Path(__file__).resolve().parent
root = base / 'dist-web' if (base / 'dist-web' / 'index.html').exists() else base
if not (root / 'index.html').exists():
    print('Game files missing. Extract the complete package, or run npm run build:web.')
    input('Press Enter to close...')
    sys.exit(1)
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(('127.0.0.1', 8765), handler)
except OSError:
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
url = 'http://127.0.0.1:%d/' % server.server_port
print('Open: ' + url, flush=True)
print('Keep this window running. Press Ctrl+C or close the window to stop.', flush=True)
if '--no-browser' not in sys.argv:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
