import os


class ValidationError(Exception):
    pass


def validate_non_empty(query=False, **kwargs):
    """
    This function checks if all the specified query parameters or body fields have a non-empty value.
    If any are found to be empty, a :class:`ValidationError` is raised.

    Parameters
    ----------
    query : bool, optional
        If True, indicates that the validation is for query parameters.
        Otherwise, the validation is for body fields.
    **kwargs : dict
        A variable number of keyword arguments representing query parameters or body fields.

    Raises
    ------
    ValidationError
        If any of the specified query parameters or body fields are empty.
    """
    empty_args = [arg_name for arg_name, arg_value in kwargs.items() if arg_value == '']
    error_type = "query parameters" if query else "body fields"
    if len(empty_args) > 0:
        raise ValidationError(f"The following {error_type} must be non-empty: {', '.join(empty_args)}")


def validate_path_is_file(path):
    """
    This function checks whether the provided path corresponds to an existing file. If not, a ValidationError is raised.

    Parameters
    ----------
    path : str
       The path to be validated.

    Raises
    ------
    ValidationError
       If the specified path does not correspond to an existing file.
    """
    if not os.path.isfile(path):
        raise ValidationError("A file with this path does not exist on the system")


def validate_path_is_dir(path):
    """
    This function checks whether the provided path corresponds to an existing folder. If not, a ValidationError is raised.

    Parameters
    ----------
    path : str
       The path to be validated.

    Raises
    ------
    ValidationError
       If the specified path does not correspond to an existing folder.
    """
    if not os.path.isdir(path):
        raise ValidationError("A folder with this path does not exist on the system")


def validate_path_exists(path):
    """
    This function checks whether the provided path exists on the system. If not, a ValidationError is raised.

    Parameters
    ----------
    path : str
       The path to be validated.

    Raises
    ------
    ValidationError
       If the specified path does not exist on the system.
    """
    if not os.path.exists(path):
        raise ValidationError("The path does not exist on the system")