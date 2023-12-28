import os
from send2trash import send2trash

from flask import render_template, request, redirect, url_for
from .services import get_folder_data
from easycommander import app
from urllib.parse import unquote
from .response import Response


@app.route('/')
def index():
    left_path, right_path, current_tab = (request.args.get(param, '') for param in ['left_path', 'right_path', 'tab'])

    if left_path == '' or right_path == '' or current_tab == '':
        current_directory = os.getcwd()
        return redirect(url_for('index', left_path=current_directory, right_path=current_directory, tab='0'))

    left_panel = get_folder_data(unquote(left_path))
    right_panel = get_folder_data(unquote(right_path))
    current_tab = unquote(current_tab)

    return render_template('pages/index.html', left_panel=left_panel,
                           right_panel=right_panel, current_tab=current_tab)


@app.route('/view')
@app.route('/edit')
def view():
    file_path = unquote(request.args.get('path', '')).replace('/', '\\')
    if file_path == '':
        return Response(False, "File path is required").to_json(), 400
    if not os.path.isfile(file_path):
        return Response(False, "File do not exist").to_json(), 400
    if request.path == '/view':
        return render_template('pages/view-edit.html', file_path=file_path, type="View")
    return render_template('pages/view-edit.html', file_path=file_path, type="Edit")


@app.route("/api/v1/file", methods=["GET"])
def get_content():
    try:
        file_path = unquote(request.args.get('path', '')).replace('/', '\\')
        if file_path == '':
            return Response(False, "File path is required").to_json(), 400
        if not os.path.isfile(file_path):
            return Response(False, "The path does not exist").to_json(), 400
        with open(file_path, 'r') as fp:
            return Response(True, fp.read()).to_json(), 200
    except Exception as e:
        return Response(False, str(e)).to_json(), 400


@app.route("/api/v1/file", methods=["PUT"])
def update_file():
    try:
        file_path = unquote(request.args.get('path', '')).replace('/', '\\')
        if file_path == '':
            return Response(False, "File path is required").to_json(), 400
        if not os.path.isfile(file_path):
            return Response(False, "The path does not exist").to_json(), 400
        content = request.get_json().get("content")
        with open(file_path, 'w') as wp:
            wp.write(content)
        return Response(True, "File was modified with success").to_json(), 200
    except Exception as e:
        return Response(False, str(e)).to_json(), 400


@app.route("/api/v1/rename", methods=["POST"])
def rename_resource():
    try:
        data = request.get_json()
        old_name, new_name = data.get("old_name", ""), data.get("new_name", "")
        if old_name == '' or new_name == '':
            return Response(False, "All the fields are required").to_json(), 400
        os.rename(old_name, new_name)
        return Response(True, "Resource successfully renamed").to_json(), 201
    except Exception as e:
        return Response(False, str(e)).to_json(), 400


@app.route("/api/v1/file", methods=["POST"])
def create_file():
    try:
        data = request.get_json()
        file_path = data.get("file_path", '').replace('/', '\\')
        if file_path == '':
            return Response(False, "File path is required").to_json(), 400
        with open(file_path, 'w'):
            pass
        return Response(True, "File successfully created").to_json(), 201
    except Exception as e:
        return Response(False, str(e)).to_json(), 400


@app.route("/api/v1/folder", methods=["POST"])
def create_folder():
    try:
        data = request.get_json()
        folder_path = data.get("folder_path", '').replace('/', '\\')
        if folder_path == '':
            return Response(False, "Folder path is required")
        os.mkdir(folder_path)
        return Response(True, 'Folder successfully created').to_json(), 201
    except Exception as e:
        return Response(False, str(e)).to_json(), 400


@app.route("/api/v1/delete", methods=["DELETE"])
def delete_resource():
    try:
        resource_path = request.args.get('path', '').replace('/', '\\')
        if resource_path == '':
            return Response(False, "Query parameter 'path' should not be empty").to_json(), 400
        if not os.path.isfile(resource_path) and not os.path.isdir(resource_path):
            return Response(False, "The path does not exist").to_json(), 400
        send2trash(resource_path)
        return Response(True, "Resource successfully moved to recycle bin").to_json(), 203
    except Exception as e:
        return Response(False, str(e)).to_json(), 400
