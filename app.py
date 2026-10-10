

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("marketplace.html")


@app.route("/marketplace")
def marketplace():
    return render_template("marketplace.html")


@app.route("/creator-profile")
def creator_profile():
    return render_template("creator-profile.html")


@app.route("/briefs")
def briefs():
    return render_template("briefs.html")


if __name__ == "__main__":
    app.run(debug=True)
