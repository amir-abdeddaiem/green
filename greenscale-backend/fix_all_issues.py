#!/usr/bin/env python3
"""Comprehensively fix all code issues in the backend."""

import re

def fix_main_py():
    """Fix all issues in main.py."""
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix patterns with remaining f-strings for exc_info
    content = re.sub(
        r'logger\.error\(f"([^"]*?)\{([^}]+)\}"',
        lambda m: f'logger.error("{m.group(1)}%s"',
        content
    )
    content = re.sub(
        r'logger\.error\("([^"]*?)%s"(.*?)(.*?exc_info)',
        lambda m: f'logger.error("{m.group(1)}%s", {m.group(2)}{m.group(3)}' if m.group(2).strip() else f'logger.error("{m.group(1)}%s"{m.group(3)}',
        content
    )
    
    # Fix remaining complex f-strings
    replacements = [
        ('logger.error(f"❌ Registration error: {e}", exc_info=True)', 'logger.error("❌ Registration error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ login error: {e}", exc_info=True)', 'logger.error("❌ login error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Upload error: {e}", exc_info=True)', 'logger.error("❌ Upload error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Emission creation error: {e}", exc_info=True)', 'logger.error("❌ Emission creation error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Deletion error: {e}", exc_info=True)', 'logger.error("❌ Deletion error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Update error: {e}", exc_info=True)', 'logger.error("❌ Update error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Status update error: {e}", exc_info=True)', 'logger.error("❌ Status update error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Stats error: {e}", exc_info=True)', 'logger.error("❌ Stats error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Error fetching logs: {e}", exc_info=True)', 'logger.error("❌ Error fetching logs: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Error fetching category breakdown: {e}", exc_info=True)', 'logger.error("❌ Error fetching category breakdown: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Error fetching trends: {e}", exc_info=True)', 'logger.error("❌ Error fetching trends: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Export error: {e}", exc_info=True)', 'logger.error("❌ Export error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ PDF export error: {e}", exc_info=True)', 'logger.error("❌ PDF export error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Chat start error: {e}", exc_info=True)', 'logger.error("❌ Chat start error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Streaming error: {e}", exc_info=True)', 'logger.error("❌ Streaming error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Chat error: {e}", exc_info=True)', 'logger.error("❌ Chat error: %s", e, exc_info=True)'),
        ('logger.error(f"❌ Support ticket error: {e}", exc_info=True)', 'logger.error("❌ Support ticket error: %s", e, exc_info=True)'),
        # Fix complex patterns with placeholders still in format string
        ('logger.info("📝 Emission log: Type=%s, Value={data.value}, Business={data.business_id}", data.type)', 'logger.info("📝 Emission log: Type=%s, Value=%s, Business=%s", data.type, data.value, data.business_id)'),
        ('logger.info("✅ Emission saved: ID=%s, CO2={impact}kg", new_log.id)', 'logger.info("✅ Emission saved: ID=%s, CO2=%skg", new_log.id, impact)'),
        ('logger.info("✅ Emission updated: ID=%s, CO2={impact}kg", emission_id)', 'logger.info("✅ Emission updated: ID=%s, CO2=%skg", emission_id, impact)'),
        ('logger.info("📤 Streaming CSV: %s ({len(emissions)} records)", filename)', 'logger.info("📤 Streaming CSV: %s (%s records)", filename, len(emissions))'),
        ('logger.info("📤 Streaming PDF: %s ({len(emissions)} records)", filename)', 'logger.info("📤 Streaming PDF: %s (%s records)", filename, len(emissions))'),
        ('logger.info("💬 Message from %s: {request.message[:50]}", request.user_name)', 'logger.info("💬 Message from %s: %s", request.user_name, request.message[:50])'),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    # Fix unused argument in send_chat_message
    content = content.replace(
        'async def send_chat_message(\n    request: ChatMessageRequest,\n    db: Session = Depends(get_db)\n):',
        'async def send_chat_message(\n    request: ChatMessageRequest,\n    _: Session = Depends(get_db)\n):'
    )
    
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed main.py")

def fix_role_models_py():
    """Fix role_models.py."""
    with open('role_models.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove unused Boolean import
    content = content.replace(
        'from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime, text',
        'from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, text'
    )
    
    with open('role_models.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed role_models.py")

def fix_role_utils_py():
    """Fix role_utils.py."""
    with open('role_utils.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line in lines:
        if 'except Exception as e:' in line:
            # Replace with specific exceptions
            fixed_lines.append(line.replace('except Exception as e:', 'except (AttributeError, TypeError) as e:'))
        else:
            fixed_lines.append(line)
    
    with open('role_utils.py', 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print("✅ Fixed role_utils.py")

if __name__ == "__main__":
    fix_main_py()
    fix_role_models_py()
    fix_role_utils_py()
    print("\n✅ All issues fixed!")
