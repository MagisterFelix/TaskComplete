import config
import requests


class Authorization:
    __token = None

    def log_in(self):
        response = requests.post(
            config.signIn,
            data={'email': 'user@gmail.com', 'password': 'user'}
        ).json()
        self.__token = response['token']

    @property
    def token(self):
        return self.__token
