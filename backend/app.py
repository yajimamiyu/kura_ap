from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static')
CORS(app)


@app.route('/')
def index():
    return render_template('ka.html')

@app.route('/login_hogosha')
def login_hogosha():
    return render_template('login_hogosha.html')

@app.route('/login_index')
def login_index():
    return render_template('login_index.html')

@app.route('/login_admin')
def login_admin_page():
    return render_template('login_admin.html')

@app.route('/admin')
def admin_page():
    return render_template('index.html')
   
@app.route('/signup_admin')
def signup_admin():
    return render_template('signup_admin.html')

@app.route('/signup_hogosha', methods=['GET', 'POST'])
def signup_hogosha():
    if request.method == 'POST':
        data = request.get_json()
        # ここにデータベースへの保存処理などを追加する
        print(f"Received data: {data}") # サーバーのコンソールでデータを確認
        return jsonify({'message': 'User created successfully'}), 201
    else:
        # GETリクエストの場合は、登録ページを表示
        return render_template('signup_hogosha.html')

@app.route('/signup_user')
def signup_user():
    return render_template('signup_user.html')

@app.route('/hogosha')
def hogosha():
    return render_template('hogosha.html')

@app.route('/manage_student')
def manage_student():
    return render_template('manage_student.html')

@app.route('/select_student_to_edit')
def select_student_to_edit():
    return render_template('select_student_to_edit.html')

@app.route('/reservation')
def reservation():
    return render_template('reservation.html')

# ここから他のAPIやルートを追加

if __name__ == '__main__':
    app.run(debug=True)