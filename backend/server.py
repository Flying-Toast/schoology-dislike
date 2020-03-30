# Django is overkill with its wisdom,
# Bare SQLite far too complex,
# So let's abuse the filesystem!
from os import path, remove
import json
from flask import Flask, request, jsonify

DATA_DIR = "data"
app = Flask(__name__)

@app.route("/dislikes")
def get_dislikes():
    post_id = request.args.get("post", None)
    if post_id is None:
        return jsonify([])

    try:
        with open(path.join(DATA_DIR, str(int(post_id)) + ".json"), "r") as f:
            j = json.loads(f.read())
            return jsonify(j)
    except:
        return jsonify([])


# Uses GET instead of POST literally only because I'm too lazy to check the flask docs for how to handle POST requests
@app.route("/toggle")
def toggle_dislike():
    post_id = request.args.get("post", None)
    username = request.args.get("name", None)
    user_id = request.args.get("id", None)

    if post_id is None or username is None or user_id is None:
        return "bad req"
    try:
        post_id = str(int(post_id))
        user_id = str(int(user_id))
    except:
        return "bad req"

    filepath = path.join(DATA_DIR, post_id + ".json")
    if not path.isfile(filepath):
        with open(filepath, "w") as f:
            f.write(f'[{{"name":"{username}","userID":{user_id}}}]')
    else:
        contents = None
        with open(filepath, "r") as f:
            contents = json.loads(f.read())
        remove(filepath)
        already_liked = len([i for i in contents if str(i["userID"]) == user_id]) != 0
        if already_liked:
            contents = [i for i in contents if str(i["userID"]) != user_id]
        else:
            contents.append({"name":username, "userID": int(user_id)})

        with open(filepath, "w") as f:
            f.write(json.dumps(contents))

    return "ok"

if __name__ == "__main__":
    app.run()
