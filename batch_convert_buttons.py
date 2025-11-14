#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

files_to_update = {
    "pages/prirodni-motivi.html": {
        "products": [13, 14, 15, 16, 17, 18],
    },
    "pages/silueti-portreti.html": {
        "products": [19, 20, 21, 22, 23, 24],
    },
    "pages/geometricni-boho.html": {
        "products": [25, 26, 27, 28, 29, 30],
    },
    "pages/mnogochastni-kartini.html": {
        "products": [31, 32, 33, 34, 35, 36],
    },
    "pages/burlogata.html": {
        "products": [37, 38, 39, 40, 41, 42],
    },
}

def convert_file(filepath, product_ids):
    """Convert all quick-view buttons in a file"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all "Бърз преглед" with "Преглед"
    content = content.replace("Бърз преглед", "Преглед")
    
    # Find all btn-quick-view buttons and add data-product-id
    button_index = 0
    original_content = content
    
    # Pattern to match btn-quick-view buttons with data attributes
    pattern = r'<button class="btn-quick-view"[^>]*data-[^>]*>\s*Преглед\s*</button>'
    
    def replacer(match):
        nonlocal button_index
        if button_index < len(product_ids):
            product_id = product_ids[button_index]
            button_index += 1
            return f'<button class="btn-quick-view" data-product-id="{product_id}">Преглед</button>'
        return match.group(0)
    
    content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    # Also handle simple btn-quick-view buttons without attributes
    if content == original_content:  # If no replacements were made, try simpler pattern
        button_index = 0
        pattern = r'<button class="btn-quick-view">\s*Преглед\s*</button>'
        content = re.sub(pattern, replacer, content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filepath} - {button_index} buttons converted with product IDs {product_ids}")

# Process each file
for filepath, config in files_to_update.items():
    full_path = filepath
    if os.path.exists(full_path):
        convert_file(full_path, config["products"])
    else:
        print(f"❌ File not found: {full_path}")

print("\n🎉 All category pages updated successfully!")
