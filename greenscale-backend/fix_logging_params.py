#!/usr/bin/env python3
"""Fix all remaining logging issues."""

def fix_logging_issues():
    """Fix logger calls missing the variable parameter."""
    
    with open('main.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line in lines:
        # If line has logger.error/warning/info with %s but no parameter
        if 'logger.error("' in line or 'logger.warning("' in line:
            if '%s' in line and 'exc_info' in line:
                # Has %s and exc_info, but missing parameter
                if ', exc_info' in line and ', e, exc_info' not in line and ', e ' not in line:
                    # Need to add the error variable before exc_info
                    line = line.replace(', exc_info', ', e, exc_info')
            fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    
    with open('main.py', 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print("✅ Fixed logging parameter issues")

if __name__ == "__main__":
    fix_logging_issues()
