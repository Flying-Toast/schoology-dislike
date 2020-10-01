# Django is overkill with its wisdom,
# Bare SQLite far too complex,
# So let's abuse the filesystem!
from os import path, remove
import json
from flask import Flask, request, jsonify, make_response

DATA_DIR = "data"
app = Flask(__name__, static_url_path="")

@app.route("/dislikes")
def get_dislikes():
    post_id = request.args.get("post", None)
    if post_id is None:
        resp = jsonify([])
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp

    try:
        with open(path.join(DATA_DIR, str(int(post_id)) + ".json"), "r") as f:
            j = json.loads(f.read())
            resp = jsonify(j)
            resp.headers.add("Access-Control-Allow-Origin", "*")
            return resp
    except:
        resp = jsonify([])
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp


# Uses GET instead of POST literally only because I'm too lazy to check the flask docs for how to handle POST requests
@app.route("/toggle")
def toggle_dislike():
    post_id = request.args.get("post", None)
    username = request.args.get("name", None)
    user_id = request.args.get("id", None)
    h = request.args.get("h")

    resp = make_response("")
    resp.headers.add("Access-Control-Allow-Origin", "*")

    if post_id is None or username is None or user_id is None or h is None:
        return resp

    try:
        post_id = str(int(post_id))
        user_id = str(int(user_id))
        h = int(h)
    except:
        return resp

    # NOTE
    #
    # In the interest of security, the server does not validate users' dislikes. This is because doing
    # so would involve hijacking their session cookie and sending it to the server, which is pretty bad
    # from a security standpoint. So, it instead uses a simple checksum of the username and user id to slightly
    # deter people from sending 'fake' dislikes from nonexistant users or impersonating other people.
    #
    # If you are reading this right now, you are probably trying to manually send dislike requests to the server, and, well,
    # you've pretty much done it. The code below validates the checksums. So just read how it works and you'll be able
    # to create checksums.
    #
    # BUT PLEASE DON'T! This whole thing is made for fun, and creating invalid dislikes ruins the fun for everyone.
    # There's really nothing else stopping you from doing it, but PLEASE - don't be a douchebag.

    a = list(map(ord, user_id + username))
    b = []
    pop = False
    while len(a) > 0:
        if pop:
            b.append(a.pop())
        else:
            b.append(a.pop(0))
        pop = not pop
    c = list("".join([str(i) for i in b]))
    d = 0
    while len(c) > 0:
        chunk = []
        for i in range(0, 5):
            if len(c) > 0:
                chunk.append(c.pop())
        d += int("".join(chunk))
    ch = int(user_id) + int(post_id) + d

    if ch != h:
        return resp

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

        if len(contents) != 0:
            with open(filepath, "w") as f:
                f.write(json.dumps(contents))

    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8008)
