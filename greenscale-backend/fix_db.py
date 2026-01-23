"""
Direct MySQL script to reset database schema
"""
import mysql.connector
from mysql.connector import Error

try:
    # Connect to MySQL
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='greenscale_db'
    )
    
    cursor = connection.cursor()
    
    print("[INFO] Dropping old tables...")
    cursor.execute("DROP TABLE IF EXISTS emissions")
    cursor.execute("DROP TABLE IF EXISTS users")
    
    print("[INFO] Creating users table...")
    cursor.execute("""
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            business_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    """)
    
    print("[INFO] Creating emissions table...")
    cursor.execute("""
        CREATE TABLE emissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            business_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            value FLOAT NOT NULL,
            unit VARCHAR(20) NOT NULL,
            co2_impact FLOAT NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    connection.commit()
    print("\n✅ Database reset successful!")
    print("   - users table created")
    print("   - emissions table created")
    
except Error as e:
    print(f"❌ Error: {e}")
    
finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
