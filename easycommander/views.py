import os

from flask import render_template, request, redirect, url_for
from .services import get_folder_children
from easycommander import app
from urllib.parse import unquote


@app.route('/')
def index():
    left_path, right_path, current_tab = (request.args.get(param, '') for param in ['left_path', 'right_path', 'tab'])

    if left_path == '' or right_path == '' or current_tab == '':
        current_directory = os.getcwd()
        return redirect(url_for('index', left_path=current_directory, right_path=current_directory, tab='0'))

    left_children = get_folder_children(unquote(left_path))
    right_children = get_folder_children(unquote(right_path))
    current_tab = unquote(current_tab)

    return render_template('index.html', left_children=left_children,
                           right_children=right_children, current_tab=current_tab)
