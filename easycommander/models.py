from typing import List

from flask import jsonify


class Response:
    """
    The 'Response' class is used for returning HTTP responses (from a Flask view).

    Attributes
    ----------
    success : bool
        A boolean value that specifies if the request was solved successfully or not.
    message : str
        If the 'success' attribute is False, this attribute specifies the error cause.
        Otherwise, a success message will be returned.

    Methods
    -------
    get_response(status_code):
        Returns the response in a serialized way, with the http status code set to parameter 'status_code'
    """
    def __init__(self, success, message):
        """
        Constructs all the necessary attributes for the Response object.

        Parameters
        ----------
        success : bool
            A boolean value that specifies if the request was solved successfully or not.
        message : str
            A descriptive message if the request was not solved successfully.
            A formal message otherwise.
        """
        self.success = success
        self.message = message

    def get_response(self, status_code):
        """
        Returns the response in a serialized way, with the http status code set to parameter 'status_code'

        Parameters
        ----------
        status_code : int
            A three digit integer that corresponds to a correct HTTP response status

        Returns
        -------
        tuple
            A tuple consisting of the serialized Response object and the status_code
        """
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
