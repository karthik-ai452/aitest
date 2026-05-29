# CmdRunner Web — Frontend Application

Pure frontend application for the CmdRunner QA Engineering platform. Built with Quart (Python async framework) for server-side rendering of Jinja2 templates, with Tailwind CSS for styling.

## Structure

```
cmdrunner_web/
├── __init__.py          # Package init
├── main.py              # Entry point (CLI args, Hypercorn server)
├── launch_instance.py   # App factory (routes, config)
├── converter.py         # Form/data conversion utilities
├── errors.py            # Custom exception classes
├── install.sh           # Installation script
├── static/              # CSS, JS, images, favicon
│   ├── css/style.css
│   ├── js/tailwind-config.js
│   ├── js/lightbox2/
│   └── ...
└── templates/           # Jinja2 HTML templates
    ├── base.html         # Authenticated layout (sidebar + topnav)
    ├── base_guest.html   # Guest layout (centered, no sidebar)
    ├── login.html
    ├── register.html
    └── pages/            # All page templates
```

## Running

```bash
python -m cmdrunner_web --port 5000
```

Or via the entry point:

```bash
python main.py --port 5000
```