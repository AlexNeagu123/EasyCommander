from flask import render_template

from easycommander import app


@app.route('/')
@app.route('/<name>')
def index(name=None):
    return render_template('index.html', name=name)
