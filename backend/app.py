from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static')
CORS(app)


@app.route('/')
def index():
    return render_template('ka.html')

@app.route('/login_hogosha', methods=['GET', 'POST'])
def login_hogosha():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
        params = {
            'username': username,
            'password': password
        }

        try:
            response_gas = requests.get(gas_url, params=params)
            response_gas.raise_for_status()
            try:
                gas_data = response_gas.json()
            except ValueError:
                # HTMLなどが返ってきた場合
                return jsonify({
                    'result': 'error',
                    'message': 'Invalid response from GAS (not JSON)'
                }), 500

            return jsonify(gas_data)

        except requests.exceptions.RequestException as e:
            print(f"Error contacting GAS: {e}")
            return jsonify({
                'result': 'error',
                'message': 'Could not connect to authentication service.'
            }), 500

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