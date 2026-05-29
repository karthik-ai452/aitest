"""CmdRunner Web — Main Entry Point

Usage:
    python -m cmdrunner_web [options]
    or
    python main.py [options]
"""
import argparse
import os
import sys
import asyncio

# Ensure workspace is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cmdrunner_web.launch_instance import create_app


def main():
    parser = argparse.ArgumentParser(description='CmdRunner Web Application')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', 5000)),
                        help='Port to run the server on (default: 5000)')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                        help='Host to bind to (default: 0.0.0.0)')
    args = parser.parse_args()

    app = create_app()

    from hypercorn.config import Config
    from hypercorn.asyncio import serve

    config = Config()
    config.bind = [f"{args.host}:{args.port}"]
    config.accesslog = '-'
    config.errorlog = '-'
    config.workers = 1

    asyncio.run(serve(app, config))


if __name__ == '__main__':
    main()