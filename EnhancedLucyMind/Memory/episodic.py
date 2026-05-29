import sqlite3
import json
import time

class EpisodicMemory:
    def __init__(self, db_path="lucy_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS episodic_traces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                trace_type TEXT,
                payload TEXT,
                timestamp INTEGER
            )
        """)
        conn.commit()
        conn.close()

    def log_trace(self, session_id: str, trace_type: str, payload: dict):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO episodic_traces (session_id, trace_type, payload, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, trace_type, json.dumps(payload), int(time.time() * 1000))
        )
        conn.commit()
        conn.close()

    def get_recent_traces(self, limit=50):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT session_id, trace_type, payload, timestamp FROM episodic_traces ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        
        traces = []
        for r in rows:
            traces.append({
                "session_id": r[0],
                "trace_type": r[1],
                "payload": json.loads(r[2]),
                "timestamp": r[3]
            })
        return traces
