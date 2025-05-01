# This file is intentionally empty to make the directory a Python package

import os
import sys
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Add the project directory to the Python path
sys.path.insert(0, str(BASE_DIR))
