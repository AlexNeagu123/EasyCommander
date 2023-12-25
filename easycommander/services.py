import os
from datetime import datetime
from pathlib import Path


def get_file_info(file_path, parent_folder=None):
    name = '..' if file_path == '..' else os.path.basename(file_path)

    if file_path == "..":
        file_path = parent_folder

    size = os.path.getsize(file_path) if not os.path.isdir(file_path) else ''
    extension = os.path.splitext(file_path)[1] if not os.path.isdir(file_path) else '<<DIR>>'

    created_timestamp = os.path.getctime(file_path)
    created_date = datetime.fromtimestamp(created_timestamp).strftime('%Y-%m-%d %H:%M:%S')

    file_info = {
        'name': name,
        'size': size,
        'extension': extension,
        'created_date': created_date
    }

    return file_info


def get_folder_content(dir_path):
    if dir_path is None:
        dir_path = os.getcwd()

    folder_content = dict()
    folder_content['parent'] = Path(dir_path).parent.absolute()
    folder_content['children'] = [get_file_info(child, parent_folder=folder_content['parent'])
                                  for child in ["..", *os.listdir(dir_path)]]

    return folder_content
