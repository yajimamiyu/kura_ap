import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date

app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
# Render provides the DATABASE_URL environment variable.
# For local development, you might need to set this yourself.
# Example for local PostgreSQL: 'postgresql://user:password@localhost/dbname'
database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost/soumen_db')
# Heroku/Render uses postgres:// which is deprecated by SQLAlchemy, replace it
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'admin' or 'hogosha'
    students = db.relationship('Student', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    school = db.Column(db.String(100))
    grade = db.Column(db.String(50))
    attendance_records = db.relationship('AttendanceRecord', backref='student', lazy=True, cascade="all, delete-orphan")
    reservations = db.relationship('Reservation', backref='student', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'last_name': self.last_name,
            'first_name': self.first_name,
            'school': self.school,
            'grade': self.grade
        }

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    record_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # e.g., 'present', 'absent', 'late'
    __table_args__ = (db.UniqueConstraint('student_id', 'record_date', name='_student_date_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'record_date': self.record_date.isoformat(),
            'status': self.status
        }

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    reservation_date = db.Column(db.Date, nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    reservation_time = db.Column(db.String(50))  # e.g., '10:00-11:00'

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'reservation_date': self.reservation_date.isoformat(),
            'subject': self.subject,
            'reservation_time': self.reservation_time,
            'student': self.student.to_dict() if self.student else None
        }

# --- CLI command to create DB ---
@app.cli.command('init-db')
def init_db_command():
    """Creates the database tables."""
    db.create_all()
    print('Initialized the database.')

# --- API Endpoints ---

@app.route('/')
def home():
    # Redirect to a frontend page, assuming it's in a 'frontend' directory
    # This might need adjustment based on your final setup.
    return "Backend is running!"

# 1. Signup API
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not username or not password or not role:
        return jsonify({'message': 'Username, password, and role are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201

# 2. Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role') # Optional: for extra validation

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        # Optional: check role if provided
        if role and user.role != role:
            return jsonify({'message': 'Role mismatch for user'}), 401
        return jsonify({'message': 'Login successful', 'role': user.role, 'user_id': user.id})
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

# 3. Student Management API
@app.route('/students', methods=['GET', 'POST'])
def manage_students():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id or not User.query.get(user_id):
            return jsonify({'message': 'Valid user_id is required'}), 400

        new_student = Student(
            user_id=user_id,
            last_name=data['last_name'],
            first_name=data['first_name'],
            school=data.get('school'),
            grade=data.get('grade')
        )
        db.session.add(new_student)
        db.session.commit()
        return jsonify({'message': 'Student added successfully', 'student': new_student.to_dict()}), 201

    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if user_id:
            students = Student.query.filter_by(user_id=user_id).order_by(Student.last_name, Student.first_name).all()
        else: # Admin case: get all students
            students = Student.query.order_by(Student.last_name, Student.first_name).all()
        return jsonify([s.to_dict() for s in students])


@app.route('/students/<int:student_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_student(student_id):
    student = Student.query.get_or_404(student_id)

    if request.method == 'GET':
        return jsonify(student.to_dict())

    if request.method == 'PUT':
        data = request.get_json()
        student.last_name = data.get('last_name', student.last_name)
        student.first_name = data.get('first_name', student.first_name)
        student.school = data.get('school', student.school)
        student.grade = data.get('grade', student.grade)
        db.session.commit()
        return jsonify({'message': 'Student updated successfully', 'student': student.to_dict()})

    if request.method == 'DELETE':
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'})

# 4. Attendance API
@app.route('/attendance', methods=['GET', 'POST'])
def manage_attendance():
    if request.method == 'POST':
        data = request.get_json()
        student_id = data.get('student_id')
        record_date_str = data.get('record_date')
        status = data.get('status')

        if not all([student_id, record_date_str, status]):
            return jsonify({'message': 'student_id, record_date, and status are required'}), 400

        record_date = date.fromisoformat(record_date_str)

        # Upsert logic
        record = AttendanceRecord.query.filter_by(student_id=student_id, record_date=record_date).first()
        if record:
            record.status = status
        else:
            record = AttendanceRecord(student_id=student_id, record_date=record_date, status=status)
            db.session.add(record)
        
        db.session.commit()
        return jsonify({'message': 'Attendance marked successfully', 'record': record.to_dict()}), 200

    if request.method == 'GET':
        # For admin: get all attendance for a specific date
        record_date_str = request.args.get('date')
        if not record_date_str:
            return jsonify({'message': 'Date parameter is required'}), 400
        
        record_date = date.fromisoformat(record_date_str)
        records = db.session.query(Student, AttendanceRecord).join(AttendanceRecord).filter(AttendanceRecord.record_date == record_date).all()
        
        result = []
        for student, attendance_record in records:
            res = student.to_dict()
            res['status'] = attendance_record.status
            result.append(res)
            
        return jsonify(result)

@app.route('/attendance/all', methods=['GET'])
def get_all_attendance():
    # Join Student, AttendanceRecord, and Reservation
    query = db.session.query(
        AttendanceRecord.record_date,
        Student.last_name,
        Student.first_name,
        Student.school,
        Student.grade,
        AttendanceRecord.status,
        Reservation.subject,
        Reservation.reservation_time
    ).join(Student, AttendanceRecord.student_id == Student.id)
     .outerjoin(Reservation, (Student.id == Reservation.student_id) & (AttendanceRecord.record_date == Reservation.reservation_date))
     .order_by(AttendanceRecord.record_date.desc(), Student.last_name, Student.first_name)
    
    records = query.all()

    result = [
        {
            'record_date': r.record_date.isoformat(),
            'last_name': r.last_name,
            'first_name': r.first_name,
            'school': r.school,
            'grade': r.grade,
            'status': r.status,
            'subject': r.subject,
            'reservation_time': r.reservation_time
        } for r in records
    ]
    return jsonify(result)


# 5. Reservation API
@app.route('/reservations', methods=['GET', 'POST'])
def manage_reservations():
    if request.method == 'POST':
        data = request.get_json()
        student_id = data.get('student_id')
        reservation_date_str = data.get('reservation_date')
        subject = data.get('subject')
        
        if not all([student_id, reservation_date_str, subject]):
            return jsonify({'message': 'student_id, reservation_date, and subject are required'}), 400

        reservation_date = date.fromisoformat(reservation_date_str)
        
        new_reservation = Reservation(
            student_id=student_id,
            reservation_date=reservation_date,
            subject=subject,
            reservation_time=data.get('reservation_time')
        )
        db.session.add(new_reservation)
        db.session.commit()
        return jsonify({'message': 'Reservation created successfully', 'reservation': new_reservation.to_dict()}), 201

    if request.method == 'GET':
        # For admin to see all reservations
        reservations = Reservation.query.order_by(Reservation.reservation_date.asc(), Reservation.reservation_time.asc()).all()
        return jsonify([r.to_dict() for r in reservations])

@app.route('/reservations/by_user/<int:user_id>', methods=['GET'])
def get_reservations_by_user(user_id):
    if not User.query.get(user_id):
        return jsonify({'message': 'User not found'}), 404
        
    reservations = Reservation.query.join(Student).filter(Student.user_id == user_id).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).all()
    return jsonify([r.to_dict() for r in reservations])


if __name__ == '__main__':
    # Use port from environment variable or default to 5001 for local dev
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port)