import os
from datetime import datetime
from pathlib import Path
from .models import FileData, FolderData


def get_file_info(file_path, parent_folder=None):
    name = '..' if file_path == '..' else os.path.basename(file_path)

    if file_path == "..":
        file_path = parent_folder

    size = os.path.getsize(file_path) if not os.path.isdir(file_path) else ''
    extension = os.path.splitext(file_path)[1] if not os.path.isdir(file_path) else '<<DIR>>'

    created_timestamp = os.path.getctime(file_path)
    created_date = datetime.fromtimestamp(created_timestamp).strftime('%Y-%m-%d %H:%M:%S')

    return FileData(name=name, size=size, extension=extension,
                    created_date=created_date, full_path=file_path.replace('\\', '/'))


def get_folder_data(dir_path):
    children = list()
    for child in ["..", *os.listdir(dir_path)]:
        child_path = child
        if child != "..":
            child_path = os.path.join(dir_path, child)
        children.append(get_file_info(child_path, parent_folder=str(Path(dir_path).parent.absolute())))

    return FolderData(full_path=dir_path.replace('\\', '/'), name=os.path.basename(dir_path), children=children)


def get_file_content(file_path):
    with open(file_path, 'r') as fp:
        return fp.read()
