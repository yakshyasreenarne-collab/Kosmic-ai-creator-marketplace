import sqlite3
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from database import init_db, get_connection

app = Flask(__name__)
app.config["PROJECT_NAME"] = "Kosmic – AI-Powered Creator Marketplace"
CORS(app)

init_db()


# ---------------- PAGE ROUTES ----------------

@app.route("/", methods=["GET"])
def home():
    return render_template("marketplace.html")


@app.route("/creator-profile", methods=["GET"])
def creator_profile_page():
    return render_template("creator-profile.html")


@app.route("/briefs-page", methods=["GET"])
def briefs_page():
    return render_template("briefs.html")


@app.route("/brand-dashboard", methods=["GET"])
def brand_dashboard_page():
    return render_template("brand-dashboard.html")


# ---------------- HEALTH API ----------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


# ---------------- CREATOR API ----------------

@app.route("/api/creators", methods=["GET"])
# ---------------- CREATOR SEARCH API ----------------

@app.route("/api/creators/search", methods=["GET"])
def search_creators():
    niche = request.args.get("niche", "").strip()
    skill = request.args.get("skill", "").strip()
    ai_tool = request.args.get("ai_tool", "").strip()
    content_type = request.args.get("content_type", "").strip()

    query = "SELECT * FROM creators WHERE 1=1"
    params = []

    if niche:
        query += " AND niche LIKE ?"
        params.append(f"%{niche}%")

    if skill:
        query += " AND skills LIKE ?"
        params.append(f"%{skill}%")

    if ai_tool:
        query += " AND ai_tools LIKE ?"
        params.append(f"%{ai_tool}%")

    if content_type:
        query += " AND content_types LIKE ?"
        params.append(f"%{content_type}%")

    query += " ORDER BY id DESC"

    conn = get_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        conn.close()
def get_creators():
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM creators ORDER BY id DESC"
        ).fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        conn.close()


@app.route("/api/creators", methods=["POST"])
def add_creator():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    niche = str(data.get("niche", "")).strip()
    portfolio_url = str(data.get("portfolio_url", "")).strip()

    if not name or not email:
        return jsonify({
            "error": "Name and email are required"
        }), 400

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO creators (name, email, niche, portfolio_url)
            VALUES (?, ?, ?, ?)
            """,
            (name, email, niche, portfolio_url)
        )
        conn.commit()

        return jsonify({
            "message": "Creator registered successfully",
            "id": cursor.lastrowid
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "error": "Email already registered"
        }), 409

    finally:
        conn.close()

# ---------------- PORTFOLIO API ----------------

@app.route("/api/portfolio", methods=["GET"])
def get_portfolio_projects():
    creator_id = request.args.get("creator_id")

    query = """
        SELECT portfolio_projects.*, creators.name AS creator_name
        FROM portfolio_projects
        JOIN creators
            ON portfolio_projects.creator_id = creators.id
        WHERE 1=1
    """

    params = []

    if creator_id:
        try:
            creator_id = int(creator_id)
        except ValueError:
            return jsonify({"error": "Invalid creator_id"}), 400

        query += " AND portfolio_projects.creator_id = ?"
        params.append(creator_id)

    query += " ORDER BY portfolio_projects.id DESC"

    conn = get_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        conn.close()


@app.route("/api/portfolio", methods=["POST"])
def add_portfolio_project():
    data = request.get_json(silent=True) or {}

    try:
        creator_id = int(data.get("creator_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid creator_id is required"}), 400

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    content_type = str(data.get("content_type", "")).strip()
    tools_used = data.get("tools_used", [])
    workflow = str(data.get("workflow", "")).strip()
    aspect_ratio = str(data.get("aspect_ratio", "")).strip()
    media_url = str(data.get("media_url", "")).strip()
    commercial_use = data.get("commercial_use", False)

    if not title:
        return jsonify({"error": "Project title is required"}), 400

    if not isinstance(tools_used, list):
        return jsonify({"error": "tools_used must be a list"}), 400

    if not all(isinstance(tool, str) for tool in tools_used):
        return jsonify({"error": "Every tool must be a string"}), 400

    if not isinstance(commercial_use, bool):
        return jsonify({"error": "commercial_use must be true or false"}), 400

    import json

    conn = get_connection()
    try:
        creator = conn.execute(
            "SELECT id FROM creators WHERE id = ?",
            (creator_id,)
        ).fetchone()

        if creator is None:
            return jsonify({"error": "Creator not found"}), 404

        cursor = conn.execute(
            """
            INSERT INTO portfolio_projects (
                creator_id,
                title,
                description,
                content_type,
                tools_used,
                workflow,
                aspect_ratio,
                media_url,
                commercial_use
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                creator_id,
                title,
                description,
                content_type,
                json.dumps(tools_used),
                workflow,
                aspect_ratio,
                media_url,
                int(commercial_use)
            )
        )

        conn.commit()

        return jsonify({
            "message": "Portfolio project created successfully",
            "id": cursor.lastrowid
        }), 201

    finally:
        conn.close()


# ---------------- CAMPAIGN API ----------------

# ---------------- CAMPAIGN / BRAND BRIEF API ----------------

import json


@app.route("/api/briefs", methods=["GET"])
def get_briefs():
    conn = get_connection()

    try:
        rows = conn.execute(
            "SELECT * FROM briefs ORDER BY id DESC"
        ).fetchall()

        return jsonify([dict(row) for row in rows])

    finally:
        conn.close()


@app.route("/api/briefs", methods=["POST"])
def add_brief():
    data = request.get_json(silent=True) or {}

    brand_name = str(data.get("brand_name", "")).strip()
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()

    content_type = str(data.get("content_type", "")).strip()
    creative_style = str(data.get("creative_style", "")).strip()
    aspect_ratio = str(data.get("aspect_ratio", "")).strip()
    deadline = str(data.get("deadline", "")).strip()

    required_skills = data.get("required_skills", [])
    preferred_tools = data.get("preferred_tools", [])
    deliverables = data.get("deliverables", [])

    commercial_use_required = data.get(
        "commercial_use_required", False
    )

    budget = data.get("budget")
    budget_min = data.get("budget_min")
    budget_max = data.get("budget_max")

    # Required field validation
    if not brand_name or not title:
        return jsonify({
            "error": "Brand name and title are required"
        }), 400

    # Validate list fields
    list_fields = {
        "required_skills": required_skills,
        "preferred_tools": preferred_tools,
        "deliverables": deliverables
    }

    for field_name, value in list_fields.items():
        if not isinstance(value, list):
            return jsonify({
                "error": f"{field_name} must be a list"
            }), 400

        if not all(isinstance(item, str) for item in value):
            return jsonify({
                "error": f"All items in {field_name} must be strings"
            }), 400

    # Validate commercial-use flag
    if not isinstance(commercial_use_required, bool):
        return jsonify({
            "error": "commercial_use_required must be true or false"
        }), 400

    # Validate budget values
    try:
        budget = None if budget in (None, "") else float(budget)
        budget_min = (
            None if budget_min in (None, "") else float(budget_min)
        )
        budget_max = (
            None if budget_max in (None, "") else float(budget_max)
        )

        for amount in (budget, budget_min, budget_max):
            if amount is not None and amount < 0:
                raise ValueError

        if (
            budget_min is not None
            and budget_max is not None
            and budget_min > budget_max
        ):
            raise ValueError

    except (TypeError, ValueError):
        return jsonify({
            "error": "Budget values must be non-negative, and minimum budget cannot exceed maximum budget"
        }), 400

    conn = get_connection()

    try:
        cursor = conn.execute(
            """
            INSERT INTO briefs (
                brand_name,
                title,
                description,
                budget,
                content_type,
                creative_style,
                aspect_ratio,
                required_skills,
                preferred_tools,
                budget_min,
                budget_max,
                deadline,
                commercial_use_required,
                deliverables
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                brand_name,
                title,
                description,
                budget,
                content_type,
                creative_style,
                aspect_ratio,
                json.dumps(required_skills),
                json.dumps(preferred_tools),
                budget_min,
                budget_max,
                deadline,
                int(commercial_use_required),
                json.dumps(deliverables)
            )
        )

        conn.commit()

        return jsonify({
            "message": "Brand brief created successfully",
            "id": cursor.lastrowid
        }), 201

    finally:
        conn.close()


# ---------------- APPLICATIONS API ----------------

@app.route("/api/applications", methods=["GET"])
def get_applications():
    creator_id = request.args.get("creator_id")
    brief_id = request.args.get("brief_id")

    query = """
        SELECT
            applications.id,
            applications.creator_id,
            applications.brief_id,
            applications.proposal,
            applications.status,
            applications.created_at,
            creators.name AS creator_name,
            briefs.title AS campaign_title,
            briefs.brand_name
        FROM applications
        JOIN creators ON applications.creator_id = creators.id
        JOIN briefs ON applications.brief_id = briefs.id
        WHERE 1 = 1
    """
    params = []

    if creator_id:
        try:
            creator_id = int(creator_id)
        except ValueError:
            return jsonify({"error": "Invalid creator_id"}), 400

        query += " AND applications.creator_id = ?"
        params.append(creator_id)

    if brief_id:
        try:
            brief_id = int(brief_id)
        except ValueError:
            return jsonify({"error": "Invalid brief_id"}), 400

        query += " AND applications.brief_id = ?"
        params.append(brief_id)

    query += " ORDER BY applications.id DESC"

    conn = get_connection()
    try:
        rows = conn.execute(query, params).fetchall()
        return jsonify([dict(row) for row in rows])
    finally:
        conn.close()


@app.route("/api/applications", methods=["POST"])
def add_application():
    data = request.get_json(silent=True) or {}

    try:
        creator_id = int(data.get("creator_id"))
        brief_id = int(data.get("brief_id"))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Valid creator_id and brief_id are required"
        }), 400

    proposal = str(data.get("proposal", "")).strip()

    if not proposal:
        return jsonify({
            "error": "Proposal is required"
        }), 400

    conn = get_connection()
    try:
        creator = conn.execute(
            "SELECT id FROM creators WHERE id = ?",
            (creator_id,)
        ).fetchone()

        if creator is None:
            return jsonify({"error": "Creator not found"}), 404

        brief = conn.execute(
            "SELECT id FROM briefs WHERE id = ?",
            (brief_id,)
        ).fetchone()

        if brief is None:
            return jsonify({"error": "Campaign not found"}), 404

        existing = conn.execute(
            """
            SELECT id FROM applications
            WHERE creator_id = ? AND brief_id = ?
            """,
            (creator_id, brief_id)
        ).fetchone()

        if existing:
            return jsonify({
                "error": "You have already applied to this campaign"
            }), 409

        cursor = conn.execute(
            """
            INSERT INTO applications (creator_id, brief_id, proposal)
            VALUES (?, ?, ?)
            """,
            (creator_id, brief_id, proposal)
        )
        conn.commit()

        return jsonify({
            "message": "Application submitted successfully",
            "application_id": cursor.lastrowid
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "error": "Could not submit application. Please check the creator and campaign IDs."
        }), 400

    finally:
        conn.close()


# ---------------- ACCEPT / REJECT APPLICATION API ----------------

@app.route("/api/applications/<int:application_id>", methods=["PATCH"])
def update_application_status(application_id):
    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    allowed_statuses = {"accepted", "rejected"}

    if status not in allowed_statuses:
        return jsonify({
            "error": "Status must be accepted or rejected"
        }), 400

    conn = get_connection()
    try:
        application = conn.execute(
            "SELECT id FROM applications WHERE id = ?",
            (application_id,)
        ).fetchone()

        if application is None:
            return jsonify({
                "error": "Application not found"
            }), 404

        conn.execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            (status, application_id)
        )
        conn.commit()

        return jsonify({
            "message": f"Application {status} successfully",
            "application_id": application_id,
            "status": status
        }), 200

    finally:
        conn.close()


# ---------------- RUN APPLICATION ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)