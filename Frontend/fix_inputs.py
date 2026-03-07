import os
import re

css_dir = "src/styles"

def fix_css_in_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find blocks of CSS
    
    # We will use regex to find { ... } blocks
    blocks = []
    
    dirty = False
    lines = content.split('\n')
    
    in_block = False
    current_block = []
    block_start = 0
    selector = ""
    
    for i, line in enumerate(lines):
        if not in_block:
            if '{' in line:
                in_block = True
                selector = line.split('{')[0].strip()
                current_block.append(line)
        else:
            current_block.append(line)
            if '}' in line:
                in_block = False
                
                # Check if this block applies to input or textarea
                text_content = '\n'.join(current_block)
                if ('input' in selector.lower() or 'textarea' in selector.lower() or '.form-input' in selector.lower() or '.input' in selector.lower() or '.search-user-input' in selector.lower() or '.modal-textarea' in selector.lower() or 'select' in selector.lower() or '.form-field' in selector.lower()):
                    if re.search(r'background(?:-color)?\s*:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\));', text_content, re.IGNORECASE):
                        if not re.search(r'\s+color\s*:', text_content):
                            # needs fix! Add color: #000;
                            insert_idx = -1
                            for j, b_line in enumerate(current_block):
                                if '}' in b_line:
                                    insert_idx = j
                                    break
                            current_block.insert(insert_idx, "    color: #000 !important;")
                            dirty = True
                            print(f"Fixed matching block in {filepath}")
                
            
