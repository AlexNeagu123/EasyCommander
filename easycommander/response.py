from flask import jsonify


class Response:
    def __init__(self, success, message):
        self.success = success
        self.message = message

    def to_json(self):
        return jsonify(self.__dict__)