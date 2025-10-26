#!/usr/bin/env python3
"""Fix line endings in requirements.txt for Unix compatibility"""

with open('requirements.txt', 'r', encoding='utf-8') as f:
    content = f.read()

with open('requirements.txt', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Converted requirements.txt to Unix line endings")

