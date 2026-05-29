"""CmdRunner — Test Suite Database Helper"""
import os
import sqlite3
from typing import Optional


def get_db_path():
    return os.environ.get('DATABASE_PATH', '/workspace/cmdrunner.db')


def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ─── Test Suites ───────────────────────────────────────────

def list_test_suites():
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, name, created_at FROM test_suites ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_test_suite(suite_id: int):
    conn = get_connection()
    try:
        suite = conn.execute(
            "SELECT id, name, created_at FROM test_suites WHERE id = ?", (suite_id,)
        ).fetchone()
        if not suite:
            return None

        suite_dict = dict(suite)

        cases = conn.execute(
            "SELECT id, name, url, sort_order FROM test_cases WHERE test_suite_id = ? ORDER BY sort_order",
            (suite_id,),
        ).fetchall()

        suite_dict['test_cases'] = []
        for case in cases:
            case_dict = dict(case)
            steps = conn.execute(
                "SELECT id, name, expectation, notes, sort_order FROM test_case_steps WHERE test_case_id = ? ORDER BY sort_order",
                (case['id'],),
            ).fetchall()
            case_dict['steps'] = [dict(s) for s in steps]
            suite_dict['test_cases'].append(case_dict)

        return suite_dict
    finally:
        conn.close()


def create_test_suite(name: str, test_cases: list) -> int:
    conn = get_connection()
    try:
        cur = conn.execute("INSERT INTO test_suites (name) VALUES (?)", (name,))
        suite_id = cur.lastrowid

        for i, tc in enumerate(test_cases):
            cur = conn.execute(
                "INSERT INTO test_cases (test_suite_id, name, url, sort_order) VALUES (?, ?, ?, ?)",
                (suite_id, tc.get('name', ''), tc.get('url', ''), i),
            )
            case_id = cur.lastrowid

            for j, step in enumerate(tc.get('steps', [])):
                conn.execute(
                    "INSERT INTO test_case_steps (test_case_id, name, expectation, notes, sort_order) VALUES (?, ?, ?, ?, ?)",
                    (case_id, step.get('name', ''), step.get('expectation', ''), step.get('notes', ''), j),
                )

        conn.commit()
        return suite_id
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def update_test_suite(suite_id: int, name: str, test_cases: list):
    conn = get_connection()
    try:
        conn.execute("UPDATE test_suites SET name = ? WHERE id = ?", (name, suite_id))

        # Delete existing cases + steps (CASCADE handles steps)
        conn.execute("DELETE FROM test_cases WHERE test_suite_id = ?", (suite_id,))

        for i, tc in enumerate(test_cases):
            cur = conn.execute(
                "INSERT INTO test_cases (test_suite_id, name, url, sort_order) VALUES (?, ?, ?, ?)",
                (suite_id, tc.get('name', ''), tc.get('url', ''), i),
            )
            case_id = cur.lastrowid

            for j, step in enumerate(tc.get('steps', [])):
                conn.execute(
                    "INSERT INTO test_case_steps (test_case_id, name, expectation, notes, sort_order) VALUES (?, ?, ?, ?, ?)",
                    (case_id, step.get('name', ''), step.get('expectation', ''), step.get('notes', ''), j),
                )

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def delete_test_suite(suite_id: int):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM test_suites WHERE id = ?", (suite_id,))
        conn.commit()
    finally:
        conn.close()


# ─── Test Runs ──────────────────────────────────────────────

def list_test_runs():
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, test_suite_name, status, created_at FROM test_runs ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_test_run(run_id: int):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, test_suite_id, test_suite_name, status, created_at FROM test_runs WHERE id = ?", (run_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def create_test_run(test_suite_id: int, test_suite_name: str, status: str = 'not_started') -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO test_runs (test_suite_id, test_suite_name, status) VALUES (?, ?, ?)",
            (test_suite_id, test_suite_name, status),
        )
        conn.commit()
        return cur.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def delete_test_run(run_id: int):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM test_runs WHERE id = ?", (run_id,))
        conn.commit()
    finally:
        conn.close()