from django.core.management import call_command


def backup():
    try:
        call_command('dbbackup')
    except Exception as error:
        return error


def restore(file_name=None):
    try:
        if file_name:
            call_command('dbrestore', '-i', file_name, '--noinput')
        else:
            call_command('dbrestore', '--noinput')
    except FileNotFoundError as error:
        return error
