from flask import Flask, Response
import json

app = Flask(__name__)

@app.route('/')
def index():
    data = {'message': 'こんにちは、APIへようこそ'}
    return Response(json.dumps(data), content_type='application/json; charset=utf-8')

if __name__ == '__main__':
    app.run(debug=True)

