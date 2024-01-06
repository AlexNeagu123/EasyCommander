import os
import shutil

from send2trash import send2trash

from flask import render_template, request, redirect, url_for
from .services import get_folder_data, get_file_content
from easycommander import app
from urllib.parse import unquote
from .models import Response
from .validators import validate_non_empty, validate_path_is_file, validate_path_exists, validate_path_is_dir


@app.route('/')
def index():
    left_path, right_path, current_tab = (request.args.get(param, '') for param in ['left_path', 'right_path', 'tab'])
    if left_path == '' or right_path == '' or current_tab == '':
        current_directory = os.getcwd()
        return redirect(url_for('index', left_path=current_directory, right_path=current_directory, tab='0'))

    left_panel = get_folder_data(unquote(left_path).replace('/', '\\'))
    right_panel = get_folder_data(unquote(right_path).replace('/', '\\'))
    current_tab = unquote(current_tab)

    return render_template('pages/index.html', left_panel=left_panel,
                           right_panel=right_panel, current_tab=current_tab)


@app.route('/view')
@app.route('/edit')
def view():
    try:
        path = unquote(request.args.get('path', '')).replace('/', '\\')
        validate_non_empty(query=True, path=path)
        validate_path_is_file(path)
        content = get_file_content(path)
        if request.path == '/view':
            return render_template('pages/view-edit.html', file_path=path, type='View', content=content)
        return render_template('pages/view-edit.html', file_path=path, type='Edit', content=content)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/file', methods=['PUT'])
def update_file():
    try:
        path = unquote(request.args.get('path', '')).replace('/', '\\')
        validate_non_empty(query=True, path=path)
        validate_path_is_file(path)
        content = request.get_json().get('content')
        with open(path, 'w') as wp:
            wp.write(content)
        return Response(True, 'File was modified with success').get_response(status_code=200)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/rename', methods=['POST'])
def rename_resource():
    try:
        request_body = request.get_json()
        old_name, new_name = request_body.get('old_name', ''), request_body.get('new_name', '')
        validate_non_empty(query=False, old_name=old_name, new_name=new_name)
        os.rename(old_name, new_name)
        return Response(True, 'Resource successfully renamed').get_response(status_code=201)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/file', methods=['POST'])
def create_file():
    try:
        request_body = request.get_json()
        path = request_body.get('path', '').replace('/', '\\')
        path = request_body.get('path', '').replace('/', '\\')
        validate_non_empty(query=False, path=path)
        with open(path, 'w'):
            pass
        return Response(True, 'File successfully created').get_response(status_code=201)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/folder', methods=['POST'])
def create_folder():
    try:
        request_body = request.get_json()
        path = request_body.get('path', '').replace('/', '\\')
        validate_non_empty(query=False, path=path)
        os.mkdir(path)
        return Response(True, 'Folder successfully created').get_response(status_code=201)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/delete', methods=['DELETE'])
def delete_item():
    try:
        path = request.args.get('path', '').replace('/', '\\')
        validate_path_exists(path)
        validate_non_empty(query=True, path=path)
        send2trash(path)
        return Response(True, 'Resource successfully moved to recycle bin').get_response(status_code=201)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/copy', methods=['POST'])
def copy_items():
    try:
        request_body = request.get_json()
        dest_path = request_body.get('destination').replace('/', '\\')

        validate_non_empty(query=False, destination=dest_path)
        validate_path_is_dir(dest_path)

        items = list(map(lambda x: x.replace('/', '\\'), request_body.get('items', [])))
        for item in items:
            if os.path.isfile(item):
                shutil.copy(item, dest_path)
            elif os.path.isdir(item):
                base_name = os.path.basename(item)
                shutil.copytree(item, os.path.join(dest_path, base_name))

        return Response(True, 'All the items where successfully copied!').get_response(status_code=200)
    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)


@app.route('/api/v1/move', methods=['POST'])
def  move_items():
    try:
        request_body = request.get_json()
        dest_path = request_body.get('destination').replace('/', '\\')

        validate_non_empty(query=False, destination=dest_path)
        validate_path_is_dir(dest_path)

        items = list(map(lambda x: x.replace('/', '\\'), request_body.get('items', [])))
        for item in items:
            shutil.move(item, dest_path)
        return Response(True, 'All the items where successfully copied!').get_response(status_code=200)

    except Exception as e:
        return Response(False, str(e)).get_response(status_code=400)
