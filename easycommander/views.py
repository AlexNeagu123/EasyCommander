from flask import render_template
from .services import get_folder_content
from easycommander import app


@app.route('/')
@app.route('/<dir_path>')
def index(dir_path=None):
    folder_content = get_folder_content(dir_path)
    return render_template('index.html', folder_content=folder_content)
