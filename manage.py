#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def main():
    """Run administrative tasks."""
    # Build paths inside the project like this: BASE_DIR / 'subdir'.
    BASE_DIR = Path(__file__).resolve().parent

    # Add the project directory to the Python path
    if str(BASE_DIR) not in sys.path:
        sys.path.append(str(BASE_DIR))

    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'etkinlik_takas.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
