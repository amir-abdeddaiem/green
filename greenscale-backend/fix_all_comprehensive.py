#!/usr/bin/env python3
"""Fix all remaining code quality issues across the entire project."""

import re

def fix_all_files():
    """Fix all issues in all Python files."""
    
    files_to_fix = [
        'main.py',
        'database.py',
        'init_db.py',
        'migrate_db.py',
        'migrate_super_admin.py',
        'super_admin_routes.py',
        'setup_super_admin.py',
        'role_models.py',
        'role_utils.py',
        'role_routes.py',
        'fix_all_issues.py',
        'fix_logging_params.py',
    ]
    
    for filename in files_to_fix:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix logger calls with f-strings
            content = re.sub(
                r'logger\.info\(f"([^"]*)\{([^}]+)\}([^"]*)"\)',
                r'logger.info("\1%s\3", \2)',
                content
            )
            content = re.sub(
                r'logger\.error\(f"([^"]*)\{([^}]+)\}([^"]*)"\)',
                r'logger.error("\1%s\3", \2)',
                content
            )
            content = re.sub(
                r'logger\.warning\(f"([^"]*)\{([^}]+)\}([^"]*)"\)',
                r'logger.warning("\1%s\3", \2)',
                content
            )
            
            # Fix print f-strings with no interpolation
            content = re.sub(
                r'print\(f"([^{}"]*)"',
                r'print("\1"',
                content
            )
            
            # Remove unused imports
            if filename == 'role_models.py':
                content = content.replace(
                    'from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, text',
                    'from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, text'
                )
            
            if filename == 'role_utils.py':
                if 'from typing import List, Optional' in content:
                    content = content.replace(
                        'from typing import List, Optional',
                        'from typing import List'
                    )
            
            if filename == 'role_routes.py':
                # Remove unused imports
                content = re.sub(
                    r',\s*RoleWithUsers\s*,',
                    ', ',
                    content
                )
                content = re.sub(
                    r',\s*assign_permission_to_role\s*,',
                    ',',
                    content
                )
                content = re.sub(
                    r',\s*remove_permission_from_role\s*,',
                    ',',
                    content
                )
            
            if filename == 'database.py':
                content = content.replace(
                    'from sqlalchemy import create_engine, event',
                    'from sqlalchemy import create_engine'
                )
            
            if filename == 'super_admin_routes.py':
                if 'from pydantic import BaseModel, EmailStr' in content:
                    content = content.replace(
                        'from pydantic import BaseModel, EmailStr',
                        'from pydantic import BaseModel'
                    )
                # Fix logging statements
                content = re.sub(
                    r'logger\.info\(f"First super admin initialized: \{email\}"\)',
                    r'logger.info("First super admin initialized: %s", email)',
                    content
                )
                content = re.sub(
                    r'logger\.info\(f"User \{user_id\} promoted to super admin by \{requester_id\}"\)',
                    r'logger.info("User %s promoted to super admin by %s", user_id, requester_id)',
                    content
                )
                content = re.sub(
                    r'logger\.info\(f"User \{user_id\} demoted from super admin by \{requester_id\}"\)',
                    r'logger.info("User %s demoted from super admin by %s", user_id, requester_id)',
                    content
                )
                content = re.sub(
                    r'logger\.info\(f"User \{user_id\} deleted by super admin \{requester_id\}"\)',
                    r'logger.info("User %s deleted by super admin %s", user_id, requester_id)',
                    content
                )
                content = re.sub(
                    r'logger\.error\(f"Error deleting user: \{e\}"\)',
                    r'logger.error("Error deleting user: %s", e)',
                    content
                )
            
            if filename == 'setup_super_admin.py':
                # Fix broad exception
                content = content.replace(
                    'except Exception as e:',
                    'except (ConnectionError, ValueError) as e:'
                )
            
            # Fix unused loop variables
            content = re.sub(
                r'for i, line in enumerate\(lines\):',
                r'for _, line in enumerate(lines):',
                content
            )
            
            if content != original_content:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed {filename}")
            else:
                print(f"⏭️  No changes needed in {filename}")
        
        except FileNotFoundError:
            print(f"⚠️  File not found: {filename}")
        except (IOError, ValueError) as e:
            print(f"❌ Error fixing {filename}: {e}")

if __name__ == "__main__":
    fix_all_files()
    print("\n✅ All files processed!")
