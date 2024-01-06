from typing import List

from flask import jsonify


class Response:
    def __init__(self, success, message):
        self.success = success
        self.message = message

    def get_response(self, status_code):
        return jsonify(self.__dict__), status_code


class FileData:
    def __init__(self, name, size, extension, created_date, full_path):
        self.name = name
        self.size = size
        self.extension = extension
        self.created_date = created_date
        self.full_path = full_path

    def __repr__(self):
        return f"FileData(name={self.name}, size={self.size}, extension={self.extension}, " \
               f"created_date={self.created_date}, full_path={self.full_path})"


class FolderData:
    def __init__(self, full_path, name, children: List[FileData]):
        self.full_path = full_path
        self.name = name
        self.children = children

    def __repr__(self):
        return f"FolderData(full_path={self.full_path}, name={self.name}, children={self.children})"
