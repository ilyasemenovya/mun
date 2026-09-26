#!/bin/bash
set -euo pipefail
base=/opt/mun-new-year-leads
test -s "$base/bot-token" || { echo 'Missing bot token'; exit 1; }
test -s "$base/chat-id" || { echo 'Missing group ID'; exit 1; }
if ss -ltn 'sport = :8091' | grep -q LISTEN && ! systemctl is-active --quiet mun-new-year-leads; then
  echo 'Port 8091 occupied; installation stopped'; exit 1
fi
id munleads >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin munleads
chmod 600 "$base/bot-token" "$base/chat-id"
chmod 755 "$base"
if test -f "$base/server.py"; then cp -a "$base/server.py" "$base/server.py.backup-$(date +%s)"; fi
cat > "$base/server.py" <<'MUN_PYTHON'
"""MUN booking receiver. Bind only to localhost behind nginx."""
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

ORIGIN = 'https://ng.munlaunge.ru'
DATES = {'', '18', '19', '24', '25', '26', '27'}
HALLS = {'', 'Основной зал', 'Банкетные комнаты', 'Караоке-зал'}

def telegram(text):
    directory = Path(os.environ.get('CREDENTIALS_DIRECTORY', '/opt/mun-new-year-leads'))
    token = (directory / 'bot-token').read_text().strip()
    chat = (directory / 'chat-id').read_text().strip()
    if not re.fullmatch(r'\d+:[\w-]+', token) or chat != '-5263234967':
        raise RuntimeError('Invalid configuration')
    payload = json.dumps({'chat_id': chat, 'text': text, 'link_preview_options': {'is_disabled': True}}, ensure_ascii=False)
    # Both credentials and personal data travel on stdin, never in process arguments.
    config = 'url = ' + json.dumps('https://api.telegram.org/bot' + token + '/sendMessage') + '\n'
    config += 'header = "Content-Type: application/json"\ndata = ' + json.dumps(payload, ensure_ascii=False) + '\n'
    result = subprocess.run(['curl', '-6', '-sS', '--connect-timeout', '5', '--max-time', '15', '--config', '-'],
                            input=config, text=True, capture_output=True, timeout=18)
    if result.returncode or not json.loads(result.stdout).get('ok'):
        raise RuntimeError('Delivery failed')

def validate(data):
    if not isinstance(data, dict):
        raise ValueError('Invalid request')
    if data.get('consent') is not True:
        raise ValueError('Необходимо согласие на обработку данных')
    values = {}
    for key in ['name', 'phone', 'date', 'guests', 'hall', 'menu', 'website']:
        value = data.get(key, '')
        if not isinstance(value, str) or len(value) > 100 or any(ord(c) < 32 for c in value):
            raise ValueError('Проверьте заполненные поля')
        values[key] = value.strip()
    if values['website']:
        raise ValueError('Не удалось отправить заявку')
    if not 2 <= len(values['name']) <= 80:
        raise ValueError('Укажите имя')
    phone = re.sub(r'[\s()+-]', '', values['phone'])
    if not re.fullmatch(r'[78]\d{10}', phone):
        raise ValueError('Укажите телефон из 11 цифр')
    values['phone'] = '+7' + phone[1:]
    if values['date'] not in DATES or values['hall'] not in HALLS or values['menu'] not in {'', '3500', '4000'}:
        raise ValueError('Проверьте дату, зал и меню')
    if values['guests'] and (not values['guests'].isdigit() or not 1 <= int(values['guests']) <= 120):
        raise ValueError('Укажите количество гостей от 1 до 120')
    return values

def message(v):
    price = str(int(v['menu']) + (300 if v['date'] in {'25', '26'} else 0)) + ' ₽' if v['menu'] else 'Не выбрано'
    return '\n'.join(['Новая заявка · МУН · Новый год', 'Имя: ' + v['name'], 'Телефон: ' + v['phone'],
                      'Дата: ' + (v['date'] + ' декабря 2026' if v['date'] else 'Не выбрана'),
                      'Гостей: ' + (v['guests'] or 'Не указано'), 'Зал: ' + (v['hall'] or 'Помогите выбрать'),
                      'Меню: ' + price, 'Источник: ng.munlaunge.ru', 'Согласие на обработку данных: подтверждено'])

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # Never log request bodies or personal details.

    def setup(self):
        super().setup()
        self.connection.settimeout(10)

    def reply(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        if self.headers.get('Origin') == ORIGIN:
            self.send_header('Access-Control-Allow-Origin', ORIGIN)
            self.send_header('Vary', 'Origin')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.reply(200 if self.path == '/health' else 404, {'ok': self.path == '/health'})

    def do_OPTIONS(self):
        if self.path != '/leads' or self.headers.get('Origin') != ORIGIN:
            return self.reply(403, {'ok': False})
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Vary', 'Origin')
        self.end_headers()

    def do_POST(self):
        if self.path != '/leads':
            return self.reply(404, {'ok': False})
        if self.headers.get('Origin') != ORIGIN:
            return self.reply(403, {'ok': False})
        # Only enable after consent documents and the frontend are ready.
        if os.environ.get('MUN_ACCEPT_LEADS') != '1':
            return self.reply(503, {'ok': False, 'error': 'Приём заявок ещё настраивается'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 4096 or self.headers.get_content_type() != 'application/json':
                return self.reply(400, {'ok': False, 'error': 'Некорректный запрос'})
            values = validate(json.loads(self.rfile.read(length)))
        except (ValueError, UnicodeError):
            return self.reply(400, {'ok': False, 'error': 'Проверьте поля и согласие на обработку данных'})
        digest = hashlib.sha256(json.dumps(values, sort_keys=True).encode()).hexdigest()
        now = time.time()
        db_path = Path(os.environ.get('STATE_DIRECTORY', '/var/lib/mun-new-year-leads')) / 'delivery.sqlite'
        with sqlite3.connect(db_path) as db:
            db.execute('CREATE TABLE IF NOT EXISTS delivery (hash TEXT, time REAL, sent INTEGER)')
            db.execute('DELETE FROM delivery WHERE time < ?', (now - 86400,))
            if db.execute('SELECT 1 FROM delivery WHERE hash=? AND sent=1 AND time>?', (digest, now-600)).fetchone():
                return self.reply(200, {'ok': True})
            if db.execute('SELECT count(*) FROM delivery WHERE time>?', (now-3600,)).fetchone()[0] >= 60:
                return self.reply(429, {'ok': False, 'error': 'Попробуйте позже или позвоните нам'})
            db.execute('INSERT INTO delivery VALUES (?,?,0)', (digest, now))
            db.commit()
            try:
                telegram(message(values))
            except Exception:
                return self.reply(502, {'ok': False, 'error': 'Доставка не подтверждена. Пожалуйста, позвоните нам'})
            db.execute('UPDATE delivery SET sent=1 WHERE hash=? AND time=?', (digest, now))
        self.reply(200, {'ok': True})

if __name__ == '__main__':
    if '--test' in sys.argv:
        telegram('✅ Тест обработчика формы МУН. Соединение с Telegram работает. Это не заявка гостя.')
        print('TEST SENT')
    else:
        HTTPServer(('127.0.0.1', 8091), Handler).serve_forever()
MUN_PYTHON
chmod 644 "$base/server.py"
cat > /etc/systemd/system/mun-new-year-leads.service <<'MUN_SERVICE'
[Unit]
Description=MUN new year booking receiver
After=network-online.target
Wants=network-online.target
[Service]
User=munleads
Group=munleads
ExecStart=/usr/bin/python3 /opt/mun-new-year-leads/server.py
Environment=MUN_ACCEPT_LEADS=0
LoadCredential=bot-token:/opt/mun-new-year-leads/bot-token
LoadCredential=chat-id:/opt/mun-new-year-leads/chat-id
StateDirectory=mun-new-year-leads
StateDirectoryMode=0700
Restart=on-failure
RestartSec=5
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
[Install]
WantedBy=multi-user.target
MUN_SERVICE
systemctl daemon-reload
systemctl enable mun-new-year-leads
systemctl restart mun-new-year-leads
sleep 2
curl --fail --silent http://127.0.0.1:8091/health
printf '\n'
/usr/bin/python3 "$base/server.py" --test
printf 'INSTALL OK - public submissions remain disabled\n'
