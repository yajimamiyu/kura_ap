from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static')
CORS(app)


@app.route('/')
def index():
    return render_template('home.html')

@app.route('/home.html')
def home():
    return render_template('home.html')

@app.route('/yoyaku')
def yoyaku():
    return render_template('yoyaku.html')

@app.route('/yoyaku_list')
def yoyaku_list():
    return render_template('yoyaku_list.html')

@app.route('/syuseki')
def syuseki():
    return render_template('syuseki.html')

@app.route('/syuseki_kakunin')
def syuseki_kakunin():
    return render_template('syuseki_kakunin.html')

@app.route('/add_attendance_from_yoyaku', methods=['POST'])
def add_attendance_from_yoyaku():
    data = request.get_json()
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    data['action'] = 'add_attendance_from_yoyaku'

    try:
        response_gas = requests.post(gas_url, json=data)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/get_yoyaku_data')
def get_yoyaku_data():
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    params = {'action': 'get_yoyaku_data'}

    try:
        response_gas = requests.get(gas_url, params=params)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/get_confirmed_attendance')
def get_confirmed_attendance():
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    params = {'action': 'get_confirmed_attendance'}

    try:
        response_gas = requests.get(gas_url, params=params)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/update_attendance', methods=['POST'])
def update_attendance():
    data = request.get_json()
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    data['action'] = 'update_attendance'

    try:
        response_gas = requests.post(gas_url, json=data)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the attendance service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/get_attendance')
def get_attendance():
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    params = {'action': 'get_attendance'}

    try:
        response_gas = requests.get(gas_url, params=params)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the attendance service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/api/get_all_yoyaku')
def get_all_yoyaku():
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    params = {'action': 'get_all_yoyaku'}

    try:
        response_gas = requests.get(gas_url, params=params)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/api/update_attendance', methods=['POST'])
def update_syuseki_attendance():
    data = request.get_json()
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    data['action'] = 'update_attendance' # Action for GAS

    try:
        response_gas = requests.post(gas_url, json=data)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500



@app.route('/api/save_filtered_data', methods=['POST'])
def save_filtered_data():
    data = request.get_json()
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    data_to_send = {
        'action': 'save_filtered_data',
        'reservationFilter': data.get('reservationFilter'),
        'attendanceFilter': data.get('attendanceFilter'),
        'filteredData': data.get('filteredData')
    }

    try:
        response_gas = requests.post(gas_url, json=data_to_send)
        response_gas.raise_for_status()
        gas_data = response_gas.json()
        return jsonify(gas_data)

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify({'result': 'error', 'message': 'Could not connect to the service.'}), 500
    except ValueError:
        return jsonify({'result': 'error', 'message': 'Invalid response from GAS (not JSON)'}), 500

@app.route('/api/get_attendance_data')
def get_attendance_data():
    gas_url = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'
    # doGetを呼び出すため、パラメータをURLに追加
    # 'sheet'パラメータで「出席」シートを指定
    params = {'sheet': '出席'}
    
    try:
        response = requests.get(gas_url, params=params)
        response.raise_for_status() # エラーがあれば例外を発生させる
        # GASからの応答がネストされている場合があるので、そのまま返す
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error contacting GAS: {e}")
        return jsonify(result='error', message='Could not connect to the service.'), 500
    except ValueError:
        # JSONデコードに失敗した場合
        return jsonify(result='error', message='Invalid response from GAS (not JSON)'), 500

# ここから他のAPIやルートを追加

if __name__ == '__main__':
    app.run(debug=True)