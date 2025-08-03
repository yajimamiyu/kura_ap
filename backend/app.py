from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static')
CORS(app)

# 環境変数からDB情報を取得
DB_NAME = os.getenv("soumen_db")
DB_USER = os.getenv("soumen_db_user")
DB_PASS = os.getenv("Z2wgsMzMmAzSJPZL40vLmTZ6Rntto4qh")
DB_HOST = os.getenv("dpg-d27mlgvdiees73cqk800-a")
DB_PORT = os.getenv("5432")

def get_db_connection():
    return psycopg2.connect(
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

@app.route('/')
def index():
    return render_template('ka.html')

# ここから他のAPIやルートを追加

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/login_hogosha')
def login_hogosha():
    return render_template('login_hogosha.html')

@app.route('/login_index')
def login_index():
    return render_template('login_index.html')

@app.route('/login_admin')
def login_admin():
    return render_template('login_admin.html')


# 1. 新規登録 API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    role = data['role']

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
                    (username, hashed_password, role))
        conn.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except psycopg2.IntegrityError:
        return jsonify({'message': 'Username already exists'}), 409
    finally:
        cur.close()
        conn.close()

# 2. ログイン API
from flask import request, jsonify, render_template  # render_template 追加

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return jsonify({'message': 'Please log in via POST method'}), 405

    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = data['password']
        role = data['role']  # フロントエンドからどのページのログインかを受け取る

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s AND role = %s", (username, role))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            return jsonify({'message': 'Login successful', 'role': user['role'], 'user_id': user['id']})
        else:
            return jsonify({'message': 'Invalid username, password, or role'}), 401

    # ここはGETの処理（ブラウザから直接アクセスされたときなど）
    return jsonify({'message': 'Please log in via POST method'})

# 3. 生徒管理 API
@app.route('/students', methods=['GET', 'POST'])
def manage_students():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'message': 'User ID is required'}), 400
        cur.execute("SELECT * FROM students WHERE user_id = %s ORDER BY last_name, first_name", (user_id,))
        students = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(students)

    if request.method == 'POST':
        data = request.get_json()
        user_id = data['user_id']
        last_name = data['last_name']
        first_name = data['first_name']
        school = data.get('school')
        grade = data.get('grade')

        cur.execute("INSERT INTO students (user_id, last_name, first_name, school, grade) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (user_id, last_name, first_name, school, grade))
        new_student_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Student added successfully', 'id': new_student_id}), 201

@app.route('/students/<int:student_id>', methods=['GET', 'PUT'])
def update_student(student_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if request.method == 'GET':
        cur.execute("SELECT * FROM students WHERE id = %s", (student_id,))
        student = cur.fetchone()
        cur.close()
        conn.close()
        if student:
            return jsonify(student)
        else:
            return jsonify({'message': 'Student not found'}), 404

    if request.method == 'PUT':
        data = request.get_json()
        last_name = data['last_name']
        first_name = data['first_name']
        school = data.get('school')
        grade = data.get('grade')

        cur = conn.cursor()
        cur.execute("UPDATE students SET last_name = %s, first_name = %s, school = %s, grade = %s WHERE id = %s",
                    (last_name, first_name, school, grade, student_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Student updated successfully'})

@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE id = %s", (student_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Student deleted successfully'})

# 4. 出席記録 API
@app.route('/attendance', methods=['GET', 'POST'])
def manage_attendance():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if request.method == 'GET':
        student_id_str = request.args.get('student_id')
        date = request.args.get('date')

        if student_id_str and date:
            try:
                student_id = int(student_id_str)
            except ValueError:
                return jsonify({'message': 'Invalid student ID'}), 400

            cur.execute("SELECT status FROM attendance_records WHERE student_id = %s AND record_date = %s", (student_id, date))
            attendance = cur.fetchone()
            cur.close()
            conn.close()
            if attendance:
                return jsonify(attendance)
            else:
                return jsonify({})
        elif date:
            cur.execute("""
                SELECT s.last_name, s.first_name, ar.status
                FROM attendance_records ar
                JOIN students s ON ar.student_id = s.id
                WHERE ar.record_date = %s
            """, (date,))
            records = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify(records)
        else:
            return jsonify({'message': 'Date or Student ID and Date are required'}), 400

    if request.method == 'POST':
        data = request.get_json()
        date = data['date']
        records = data['records'] # { "生徒名": "present", ... }

        # 既存の記録を一旦削除
        cur.execute("DELETE FROM attendance_records WHERE record_date = %s", (date,))

        # 新しい記録を挿入
        for student_full_name, status in records.items():
            # 生徒名からIDを取得 (苗字と名前で検索)
            last_name, first_name = student_full_name.split(' ', 1)
            cur.execute("SELECT id FROM students WHERE last_name = %s AND first_name = %s", (last_name, first_name))
            student = cur.fetchone()
            if student:
                cur.execute(
                    "INSERT INTO attendance_records (record_date, student_id, status) VALUES (%s, %s, %s)",
                    (date, student['id'], status)
                )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Attendance saved successfully'}), 201

@app.route('/attendance/all', methods=['GET'])
def get_all_attendance():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT ar.record_date, s.last_name, s.first_name, s.school, s.grade, ar.status, r.subject, r.reservation_time
        FROM attendance_records ar
        JOIN students s ON ar.student_id = s.id
        LEFT JOIN reservations r ON ar.student_id = r.student_id AND ar.record_date = r.reservation_date
        ORDER BY ar.record_date DESC, s.last_name, s.first_name
    """)
    records = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(records)


@app.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    student_id = data['student_id']
    reservation_date = data['reservation_date']
    subject = data['subject']
    reservation_time = data['reservation_time']

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO reservations (student_id, reservation_date, subject, reservation_time) VALUES (%s, %s, %s, %s)",
            (student_id, reservation_date, subject, reservation_time)
        )
        conn.commit()
        return jsonify({'message': 'Reservation created successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error creating reservation: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/reservations/by_user', methods=['GET'])
def get_reservations_by_user():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT
            r.id AS reservation_id,
            r.reservation_date,
            r.subject,
            r.reservation_time,
            s.last_name,
            s.first_name,
            s.school,
            s.grade
        FROM reservations r
        JOIN students s ON r.student_id = s.id
        WHERE s.user_id = %s
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
    """, (user_id,))
    reservations = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(reservations)


@app.route('/reservations/for_attendance_manager', methods=['GET'])
def get_reservations_for_attendance_manager():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT
            r.id AS reservation_id,
            r.reservation_date,
            r.subject,
            r.reservation_time,
            s.last_name,
            s.first_name,
            s.school,
            s.grade
        FROM reservations r
        JOIN students s ON r.student_id = s.id
        WHERE s.user_id = %s
        AND r.reservation_date >= CURRENT_DATE -- 今日以降の予約のみ
        ORDER BY r.reservation_date ASC, r.reservation_time ASC
    """, (user_id,))
    reservations = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(reservations)


@app.route('/reservations/all', methods=['GET'])
def get_all_reservations():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT
            r.id AS reservation_id,
            r.student_id, -- student_id を追加
            r.reservation_date,
            r.subject,
            r.reservation_time,
            s.last_name,
            s.first_name,
            s.school,
            s.grade
        FROM reservations r
        JOIN students s ON r.student_id = s.id
        ORDER BY r.reservation_date ASC, r.reservation_time ASC
    """)
    reservations = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(reservations)


if __name__ == '__main__':
    app.run(debug=True, port=5001)

@app.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    student_id = data['student_id']
    record_date = data['record_date']
    status = data['status']

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 既存の出欠を更新または新規挿入
        cur.execute("""
            INSERT INTO attendance_records (student_id, record_date, status)
            VALUES (%s, %s, %s)
            ON CONFLICT (student_id, record_date) DO UPDATE SET status = EXCLUDED.status
        """, (student_id, record_date, status))
        conn.commit()
        return jsonify({'message': 'Attendance marked successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error marking attendance: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()
