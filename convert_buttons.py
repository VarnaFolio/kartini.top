#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

# Directories to process
pages_dir = Path("pages")

# Product ID mapping for each file
product_mapping = {
    "abstraktni-kartini.html": [43, 1, 2, 3, 4, 5, 6, 44],
    "minimalisticni-kartini.html": [7, 8, 9, 10, 11, 12],
    "prirodni-motivi.html": [13, 14, 15, 16, 17, 18],
    "silueti-portreti.html": [19, 20, 21, 22, 23, 24],
    "geometricni-boho.html": [25, 26, 27, 28, 29, 30],
    "mnogochastni-kartini.html": [31, 32, 33],
}

def process_file(filepath, product_ids):
    """Process a category HTML file and update all buttons"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all btn-quick-view buttons and replace them
    button_index = 0
    pattern = r'<button class="btn-quick-view"[^>]*?>(.*?)</button>'
    
    def replacer(match):
        nonlocal button_index
        if button_index < len(product_ids):
            product_id = product_ids[button_index]
            button_index += 1
            return f'<button class="btn-quick-view" data-product-id="{product_id}">\n                                    Преглед\n                                </button>'
        return match.group(0)
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Updated {filepath} - {button_index} buttons changed")

# Process each file
for filename, product_ids in product_mapping.items():
    filepath = pages_dir / filename
    if filepath.exists():
        process_file(filepath, product_ids)
    else:
        print(f"✗ File not found: {filepath}")

print("\n✅ All buttons converted successfully!")
