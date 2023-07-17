import pytest
import requests
import json


@pytest.fixture(scope="module")
def jwt_token():
    payload = {"email": "admin123@admin.com", "password": "admin123"}
    response = requests.post("http://localhost:5000/api/user/auth", json=payload)
    resp_json = response.json()
    print("getting jwt token...")
    return resp_json["token"]


def test_get_all_users(jwt_token):
    url_get_all_users = "http://localhost:5000/api/user/all"
    headers = {"Authorization": "Bearer " + jwt_token}

    response = requests.get(url_get_all_users, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200


def test_get_current_user(jwt_token):
    url_get_current_user = "http://localhost:5000/api/user/current"
    headers = {"Authorization": "Bearer " + jwt_token}
    response = requests.get(url_get_current_user, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200


def test_user_phone_update(jwt_token, user_id, new_phone_number):
    url_user_phone_update = f"http://localhost:5000/api/user/{user_id}/phone"
    headers = {"Authorization": "Bearer " + jwt_token}

    payload = {"phoneNumber": new_phone_number}
    response = requests.put(url_user_phone_update, json=payload, headers=headers)
    resp_body = response.json()

    print(json.dumps(resp_body, indent=4))
    assert response.status_code == 200
    assert resp_body["message"] == "User phone number updated successfully"
