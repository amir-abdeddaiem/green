#!/usr/bin/env python3
"""Fix all logging f-string statements to use lazy % formatting."""

import re

def fix_logging():
    """Fix logging statements in main.py."""
    with open('main.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line in lines:
        # Fix logger.info f-strings
        line = re.sub(
            r'logger\.info\(f"([^"]*?)\{([^}]+)\}([^"]*)"\)',
            r'logger.info("\1%s\3", \2)',
            line
        )
        # Fix logger.warning f-strings
        line = re.sub(
            r'logger\.warning\(f"([^"]*?)\{([^}]+)\}([^"]*)"\)',
            r'logger.warning("\1%s\3", \2)',
            line
        )
        # Fix logger.error f-strings
        line = re.sub(
            r'logger\.error\(f"([^"]*?)\{([^}]+)\}([^"]*)"\)',
            r'logger.error("\1%s\3", \2)',
            line
        )
        fixed_lines.append(line)
    
    with open('main.py', 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print("✅ Fixed all logging f-string statements")

if __name__ == "__main__":
    fix_logging()
