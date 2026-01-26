"""Script to promote a user to super admin status."""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# MySQL database connection
DATABASE_URL = "mysql+mysqlconnector://root:@localhost:3306/greenscale_db"

def promote_user_to_super_admin(user_email):
    """Promote a user to super admin by email using SQL."""
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        db = Session()
        
        # Check if user exists
        check_result = db.execute(
            text("SELECT id, email, business_name, is_super_admin FROM users WHERE email = :email"),
            {"email": user_email}
        ).fetchone()
        
        if check_result:
            user_id, email, business_name, current_status = check_result
            print("✅ Found user:")
            print(f"   ID: {user_id}")
            print(f"   Email: {email}")
            print(f"   Business: {business_name}")
            print(f"   Current super admin status: {bool(current_status)}")
            
            # Update user to super admin
            db.execute(
                text("UPDATE users SET is_super_admin = 1 WHERE email = :email"),
                {"email": user_email}
            )
            db.commit()
            
            print("\n✅ SUCCESS! User promoted to super admin!")
            print(f"   Email: {user_email}")
            print("   New status: Super Admin (True)")
            print("\n🔄 Steps to see the change:")
            print("   1. Refresh your browser")
            print("   2. Logout and login again")
            print("   3. Click your profile icon in the top-right")
            print("   4. You should now see '👑 Owner Dashboard' option!")
        else:
            print(f"❌ User not found with email: {user_email}")
            
    except ValueError as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    except RuntimeError as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    email_to_promote = "testatiq@atiq.com"
    print(f"Promoting user to super admin: {email_to_promote}\n")
    print("-" * 60)
    promote_user_to_super_admin(email_to_promote)
    print("-" * 60)


