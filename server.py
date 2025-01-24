from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__, static_url_path='', static_folder='.')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Store connected users
connected_users = set()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('update_users', len(connected_users))

@socketio.on('user_join')
def handle_user_join(user_data):
    connected_users.add(user_data['email'])
    emit('update_users', len(connected_users), broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    emit('update_users', len(connected_users), broadcast=True)

@socketio.on('new_message')
def handle_message(message_data):
    # Add timestamp to message
    message_data['timestamp'] = datetime.now().strftime('%H:%M')
    # Broadcast the message to all connected clients
    emit('chat_message', message_data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000) 