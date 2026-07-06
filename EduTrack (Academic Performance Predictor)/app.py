from flask import Flask, render_template, request, redirect, url_for, session
import pickle
import numpy as np
import os
import json

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=template_dir)
app.jinja_env.globals.update(enumerate=enumerate)
app.secret_key = 'academic_performance_secret_key_2024'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = pickle.load(open(os.path.join(BASE_DIR, 'model.pkl'), 'rb'))
scaler = pickle.load(open(os.path.join(BASE_DIR, 'scaler.pkl'), 'rb'))

USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'users.json')


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


def compute_performance_score(study_hours, sleep_hours, screen_time,
                              stress_level, avg_marks, avg_attendance):

    MIN_ATTENDANCE = 75.0
    MIN_STUDY_HOURS = 2.0
    MIN_SLEEP = 7.0
    MAX_SCREEN = 2.0
    MAX_STRESS = 3
    MIN_MARKS = 45.0

    study_weekly = study_hours * 7
    absences = max(0, round((100 - avg_attendance) / 100 * 30))
    gpa_4 = (avg_marks / 100) * 4.0
    tutoring = 1 if stress_level >= 4 else 0
    parental_support = 2

    features = [17, 1, 0, 2, study_weekly, absences, tutoring,
                parental_support, 0, 0, 0, 0, gpa_4]

    features_scaled = scaler.transform([features])
    proba = model.predict_proba(features_scaled)[0]

    prob_high = proba[0]
    prob_low = proba[1]
    prob_medium = proba[2]

    base_score = (prob_high * 100) + (prob_medium * 50) + (prob_low * 10)

    penalty = 0
    if avg_attendance < MIN_ATTENDANCE:
        penalty += (MIN_ATTENDANCE - avg_attendance) * 0.5
    if study_hours < MIN_STUDY_HOURS:
        penalty += (MIN_STUDY_HOURS - study_hours) * 8
    if sleep_hours < MIN_SLEEP:
        penalty += (MIN_SLEEP - sleep_hours) * 4
    if screen_time > MAX_SCREEN:
        penalty += (screen_time - MAX_SCREEN) * 3
    if stress_level > MAX_STRESS:
        penalty += (stress_level - MAX_STRESS) * 6
    if avg_marks < MIN_MARKS:
        penalty += (MIN_MARKS - avg_marks) * 0.6

    return round(max(0, min(100, base_score - penalty)), 1)


def score_to_label(score):
    if score >= 80:
        return {
            'label': 'Excellent',
            'color': '#16a34a',
            'bg': '#dcfce7',
            'emoji': '🌟',
            'advice': 'Outstanding! You are excelling in all areas. Consider mentoring peers.'
        }
    elif score >= 65:
        return {
            'label': 'Good',
            'color': '#2563eb',
            'bg': '#dbeafe',
            'emoji': '✅',
            'advice': 'Good performance! More consistency in study and attendance will push you to Excellent.'
        }
    elif score >= 50:
        return {
            'label': 'Average',
            'color': '#d97706',
            'bg': '#fef9c3',
            'emoji': '📊',
            'advice': 'Average performance. Focus on improving attendance and reducing screen time.'
        }
    elif score >= 35:
        return {
            'label': 'Poor',
            'color': '#ea580c',
            'bg': '#ffedd5',
            'emoji': '⚠️',
            'advice': 'Below average. Increase study hours to 2+/day, attend more classes, manage stress.'
        }
    else:
        return {
            'label': 'Critical',
            'color': '#dc2626',
            'bg': '#fee2e2',
            'emoji': '🚨',
            'advice': 'Critical level. Seek tutoring immediately, improve attendance above 75%, study 2+ hrs daily.'
        }


# ─── Routes ───────────────────────────────────────────────

@app.route('/')
def home():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None

    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()
        users = load_users()

        if username in users and users[username]['password'] == password:
            session['username'] = username
            return redirect(url_for('dashboard'))

        error = 'Invalid username or password.'

    return render_template('login.html', error=error)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    error = None

    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password'].strip()
        confirm = request.form['confirm'].strip()
        name = request.form['name'].strip()
        users = load_users()

        if username in users:
            error = 'Username already exists.'
        elif password != confirm:
            error = 'Passwords do not match.'
        elif len(password) < 4:
            error = 'Password must be at least 4 characters.'
        else:
            users[username] = {
                'password': password,
                'name': name,
                'sessions': {}
            }
            save_users(users)
            session['username'] = username
            return redirect(url_for('dashboard'))

    return render_template('signup.html', error=error)


@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('current_session', None)
    return redirect(url_for('login'))


# ─── Dashboard ────────────────────────────────────────────

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('login'))

    users = load_users()
    user = users[session['username']]
    sessions = user.get('sessions', {})

    return render_template('dashboard.html', user=user, sessions=sessions)


# ─── New session ──────────────────────────────────────────

@app.route('/new-session', methods=['GET', 'POST'])
def new_session():
    if 'username' not in session:
        return redirect(url_for('login'))

    error = None

    if request.method == 'POST':
        sess_name = request.form.get('session_name', '').strip()
        num_subj = request.form.get('subject_count', '0')

        users = load_users()
        user = users[session['username']]
        sessions = user.get('sessions', {})

        if not sess_name:
            error = 'Please enter a session name.'

        elif sess_name in sessions:
            error = f'A session named "{sess_name}" already exists.'

        else:
            subjects = []

            for i in range(1, int(num_subj) + 1):
                name = request.form.get(f'subject_{i}', '').strip()
                if name:
                    subjects.append({
                        'name': name,
                        'assignments': [],
                        'attendance': '',
                        'previous_marks': ''
                    })

            sessions[sess_name] = {
                'name': sess_name,
                'subjects': subjects,
                'study_hours': '',
                'sleep_hours': '',
                'screen_time': '',
                'stress_level': '2',
                'result': None
            }

            user['sessions'] = sessions
            save_users(users)

            session['current_session'] = sess_name
            return redirect(url_for('predict_page'))

    return render_template('new_session.html', error=error)


# ─── Open session ─────────────────────────────────────────

@app.route('/open-session/<sess_name>')
def open_session(sess_name):
    if 'username' not in session:
        return redirect(url_for('login'))

    session['current_session'] = sess_name
    return redirect(url_for('predict_page'))


# ─── Delete session ───────────────────────────────────────

@app.route('/delete-session/<sess_name>')
def delete_session(sess_name):
    if 'username' not in session:
        return redirect(url_for('login'))

    users = load_users()
    user = users[session['username']]
    sessions = user.get('sessions', {})

    if sess_name in sessions:
        del sessions[sess_name]
        user['sessions'] = sessions
        save_users(users)

    return redirect(url_for('dashboard'))


# ─── Predict page ─────────────────────────────────────────

@app.route('/predict', methods=['GET', 'POST'])
def predict_page():
    if 'username' not in session:
        return redirect(url_for('login'))

    if 'current_session' not in session:
        return redirect(url_for('dashboard'))

    users = load_users()
    user = users[session['username']]
    sess_name = session['current_session']
    sessions = user.get('sessions', {})

    if sess_name not in sessions:
        return redirect(url_for('dashboard'))

    current = sessions[sess_name]
    result = None

    if request.method == 'POST':

        study_hours = float(request.form.get('study_hours', 2))
        sleep_hours = float(request.form.get('sleep_hours', 7))
        screen_time = float(request.form.get('screen_time', 2))
        stress_level = int(request.form.get('stress_level', 2))

        current['study_hours'] = str(study_hours)
        current['sleep_hours'] = str(sleep_hours)
        current['screen_time'] = str(screen_time)
        current['stress_level'] = str(stress_level)

        subjects = current.get('subjects', [])
        marks_list = []
        attendance_list = []

        for i, subj in enumerate(subjects):

            marks = request.form.get(f'marks_{i}', '0')
            attendance = request.form.get(f'attendance_{i}', '0')

            subj['previous_marks'] = marks
            subj['attendance'] = attendance

            try:
                marks_list.append(float(marks))
            except:
                marks_list.append(0.0)

            try:
                attendance_list.append(float(attendance))
            except:
                attendance_list.append(0.0)

            num_assignments = int(request.form.get(f'num_assignments_{i}', 0))
            completed = []

            for j in range(num_assignments):
                completed.append(
                    request.form.get(f'assignment_{i}_{j}', 'off') == 'on'
                )

            subj['assignments'] = completed

        current['subjects'] = subjects

        avg_marks = np.mean(marks_list) if marks_list else 45.0
        avg_attendance = np.mean(attendance_list) if attendance_list else 75.0

        score = compute_performance_score(
            study_hours, sleep_hours, screen_time,
            stress_level, avg_marks, avg_attendance
        )

        result = score_to_label(score)
        result['score'] = score

        current['result'] = result
        current['chart_data'] = {
            'study_hours': study_hours,
            'sleep_hours': sleep_hours,
            'screen_time': screen_time,
            'stress_level': stress_level,
            'avg_marks': round(avg_marks, 1),
            'avg_attendance': round(avg_attendance, 1),
            'score': score,
            'subject_names': [s['name'] for s in subjects],
            'subject_marks': [float(s['previous_marks'] or 0) for s in subjects],
            'subject_attend': [float(s['attendance'] or 0) for s in subjects],
        }

        sessions[sess_name] = current
        user['sessions'] = sessions
        save_users(users)

    all_sessions = user.get('sessions', {})
    trend_labels = []
    trend_scores = []

    for sname, sdata in all_sessions.items():
        if sdata.get('result') and sdata['result'].get('score') is not None:
            trend_labels.append(sname)
            trend_scores.append(sdata['result']['score'])

    chart_data = current.get('chart_data', None)
    old_result = current.get('result', None)

    if result is None and old_result:
        result = old_result

    return render_template(
        'index.html',
        user=user,
        current=current,
        sess_name=sess_name,
        result=result,
        chart_data=json.dumps(chart_data) if chart_data else 'null',
        trend_labels=json.dumps(trend_labels),
        trend_scores=json.dumps(trend_scores)
    )


if __name__ == '__main__':
    app.run(debug=True)