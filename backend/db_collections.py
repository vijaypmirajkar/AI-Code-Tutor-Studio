# ============================================================
# AI CODE TUTOR STUDIO
# db_collections.py
# ============================================================

from database import db

# ============================================================
# USERS
# ============================================================

users_collection = db["users"]

# ============================================================
# HISTORY
# ============================================================

history_collection = db["history"]

# ============================================================
# CHAT
# ============================================================

chat_collection = db["chat"]

# ============================================================
# PROJECTS
# ============================================================

projects_collection = db["projects"]

# ============================================================
# LEARNING
# ============================================================

learning_collection = db["learning"]

# ============================================================
# NOTIFICATIONS
# ============================================================

notifications_collection = db["notifications"]

# ============================================================
# DEBUG
# ============================================================

print("====================================")
print("MongoDB Collections Loaded")
print("====================================")

print(
    "users_collection         :",
    users_collection.name
)

print(
    "history_collection       :",
    history_collection.name
)

print(
    "chat_collection          :",
    chat_collection.name
)

print(
    "projects_collection      :",
    projects_collection.name
)

print(
    "learning_collection      :",
    learning_collection.name
)

print(
    "notifications_collection :",
    notifications_collection.name
)

print("====================================")
