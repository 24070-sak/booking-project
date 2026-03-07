import os
import re

css_dir = "src/styles"

for root, _, files in os.walk(css_dir):
    for filename in files:
        if filename.endswith(".css"):
            filepath = os.path.join(root, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = ""
            changed = False
            
            blocks = []
            current_block = []
            in_block = False
            selector = ""
            
            for line in content.splitlines():
                if not in_block:
                    if "{" in line:
                        in_block = True
                        selector = line.split("{")[0]
                        current_block = [line]
                    else:
                        new_content += line + "\n"
                else:
                    current_block.append(line)
                    if "}" in line:
                        in_block = False
                        
                        block_text = "\n".join(current_block)
                        
                        # does block define white-ish background?
                        has_white_bg = re.search(r'background(?:-color)?\s*:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))(?:\s*!important)?\s*;', block_text, re.IGNORECASE)
                        
                        # does selector target inputs?
                        targets_input = re.search(r'input|textarea|select|\.form-input|\.form-control|\.search|\.modal-textarea', selector, re.IGNORECASE)
                        
                        if has_white_bg and targets_input:
                            # does it NOT define color explicitly?
                            if not re.search(r'\s+color\s*:', block_text):
                                # insert color: #1a1a1a; right before the closing brace
                                closing_brace_idx = -1
                                for i, bline in enumerate(current_block):
                                    if "}" in bline:
                                        closing_brace_idx = i
                                        break
                                current_block.insert(closing_brace_idx, "    color: #1a1a1a;")
                                block_text = "\n".join(current_block)
                                changed = True
                                print(f"Fixed {selector.strip()} in {filepath}")
                        
                        new_content += block_text + "\n"

            if changed:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)

print("Done scanning CSS.")
