#!/usr/bin/env python3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Gabochie Marketing — Task List Agent
Reads the project task list + agent architecture, talks to LM Studio (Gemma 3),
and recommends the next task to execute.
"""

import json
import re
import requests
import sys
from pathlib import Path

# ── Config ──
LMSTUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL = "google/gemma-4-e4b"  # loaded in LM Studio
TASK_LIST_PATH = Path(__file__).parent / "project-task-list.html"
ARCH_PATH = Path(__file__).parent / "ai-agent-architecture.html"

# ── Load files ──
def load_task_list(path):
    """Parse the PHASES array from the HTML file by extracting task data via regex."""
    html = path.read_text(encoding="utf-8")
    
    # Extract all phase blocks: id, label
    phase_pattern = re.compile(
        r"id:\s*'(\w+)'[^}]+label:\s*'([^']+)'",
        re.DOTALL
    )
    # Extract all task entries: id, label, done
    task_pattern = re.compile(
        r"\{\s*id:\s*'([^']+)'[^}]*?label:\s*'([^']+)'[^}]*?done:\s*(true|false)\s*\}",
        re.DOTALL
    )
    
    phases = []
    # Find phase headers and their task blocks
    phase_blocks = re.findall(
        r"\{\s*id:\s*'(\w+)'[^}]*?label:\s*'([^']+)'[^}]*?tasks:\s*\[(.*?)\]\s*\}",
        html, re.DOTALL
    )
    
    for pid, label, tasks_str in phase_blocks:
        tasks = []
        for match in task_pattern.finditer(tasks_str):
            tasks.append({
                "id": match.group(1),
                "label": match.group(2),
                "done": match.group(3) == "true"
            })
        phases.append({
            "id": pid,
            "label": label,
            "tasks": tasks
        })
    
    if not phases:
        print("ERROR: Could not parse PHASES from task list HTML")
        print("Debug: checking file size and pattern...")
        print(f"  File size: {len(html)} bytes")
        # Try simpler pattern to debug
        simple = re.findall(r"id:\s*'p\d+'", html)
        print(f"  Found phase id patterns: {len(simple)}")
        sys.exit(1)
    
    return phases

def load_architecture(path):
    """Load architecture summary — extract headings and task info only."""
    html = path.read_text(encoding="utf-8")
    # Extract readable text portions: headings, agent names, descriptions, task IDs
    texts = re.findall(r'>([^<]{10,200})<', html)
    # Filter to meaningful lines
    lines = [t.strip() for t in texts if len(t.strip()) > 15 and not t.strip().startswith('<')]
    return "\n".join(lines[:60])  # Keep it concise

# ── Build status summary ──
def build_status_summary(phases):
    lines = []
    total, done_total = 0, 0
    for phase in phases:
        phase_done = sum(1 for t in phase["tasks"] if t["done"])
        phase_total = len(phase["tasks"])
        total += phase_total
        done_total += phase_done
        lines.append(f"{phase['label']}: {phase_done}/{phase_total} done")

        for task in phase["tasks"]:
            status = "[DONE]" if task["done"] else "[PENDING]"
            lines.append(f"  [{status}] {task['id']}: {task['label']}")
    
    lines.insert(0, f"Overall: {done_total}/{total} tasks completed ({done_total/max(total,1)*100:.0f}%)")
    return "\n".join(lines)

# ── Determine next pending task (dependency-aware) ──
def get_pending_tasks(phases):
    """Return list of pending tasks with their sequential index."""
    pending = []
    phase_order = {"p0": 0, "p1": 1, "p2": 2, "p3": 3, "p4": 4, "p5": 5, "p6": 6, "p7": 7}
    
    for phase in phases:
        phase_priority = phase_order.get(phase["id"], 99)
        for task in phase["tasks"]:
            if not task["done"]:
                pending.append({
                    "id": task["id"],
                    "label": task["label"],
                    "phase": phase["id"],
                    "phase_label": phase["label"],
                    "priority": phase_priority,
                })
    return pending

# ── Call LM Studio ──
def ask_lmstudio(system_prompt, user_prompt):
    # Print prompt size for debugging
    total_chars = len(system_prompt) + len(user_prompt)
    print(f"  Prompt size: ~{total_chars} chars (~{total_chars//4} tokens)")
    print("  Waiting for Gemma 4 response (may take 30-60s)...")
    
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 500,
    }
    try:
        resp = requests.post(LMSTUDIO_URL, json=payload, timeout=300)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to LM Studio at", LMSTUDIO_URL)
        print("Make sure LM Studio is running with the server enabled (Settings > Enable API Server).")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: LM Studio call failed: {e}")
        sys.exit(1)

# ── Main ──
def main():
    sep = "=" * 60
    print(sep)
    print("  Gabochie Marketing - Task List Agent")
    print("  Scanning project-task-list.html + ai-agent-architecture.html")
    print("  Asking LM Studio for next task...")
    print(sep)

    # Load data
    phases = load_task_list(TASK_LIST_PATH)
    arch_html = load_architecture(ARCH_PATH)
    status = build_status_summary(phases)
    pending = get_pending_tasks(phases)

    if not pending:
        print("\n✅ All tasks are complete! Nothing to do.")
        return

    # Build system prompt
    system_prompt = """You are the Exec VP Agent for Gabochie Marketing — an AI project manager overseeing a website buildout and AI agent swarm implementation.

Your job: analyze the current task list and the agent architecture plan, then recommend the SINGLE most important task to execute next.

Rules:
1. Consider dependencies — Phase 0 must be done before Phase 1, etc.
2. Consider priority — high-impact revenue tasks before nice-to-haves.
3. Consider the architecture — which agent/task unlocks the most value next.
4. Output ONLY a JSON object with these fields:
   - "task_id": string (e.g. "p6-1")
   - "task_label": string
   - "reasoning": string (1-2 sentence explanation)
   - "next_phase_ready": boolean (true if this phase has all dependencies met)
5. No markdown, no extra text — just valid JSON."""

    # Build user prompt
    pending_summary = "\n".join(
        f"  [{p['phase']}] {p['id']}: {p['label']}" for p in pending[:15]
    )
    if len(pending) > 15:
        pending_summary += f"\n  ... and {len(pending)-15} more pending"

    user_prompt = f"""CURRENT STATUS:
{status}

ARCHITECTURE PLAN:
The team is building an AI Agent Swarm with an Exec VP Orchestrator and specialized sub-agents for Sales, Operations, and Intelligence.

PENDING TASKS ({len(pending)} remaining):
{pending_summary}

Which single task should we execute next?"""

    # Ask LM Studio
    result = ask_lmstudio(system_prompt, user_prompt)
    
    # Parse JSON
    data = None
    try:
        json_match = re.search(r"\{.*\}", result, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
        else:
            data = json.loads(result)
    except (json.JSONDecodeError, KeyError, TypeError):
        pass
    
    if not data:
        first = pending[0]
        print(f"  (Model returned empty/invalid response — using fallback)")
        data = {
            "task_id": first["id"],
            "task_label": first["label"],
            "reasoning": f"First pending task by phase order ({first['phase_label']}).",
            "next_phase_ready": True,
        }

    # Output
    sep = "=" * 60
    print(f"\n{sep}")
    print(f"  RECOMMENDED NEXT TASK")
    print(f"{sep}")
    print(f"  ID:        {data['task_id']}")
    print(f"  Task:      {data['task_label']}")
    print(f"  Reasoning: {data['reasoning']}")
    print(f"{sep}")
    print(f"\n  Command: /task {data['task_id']} {data['task_label']}")
    print()

# ── Mark-Done Mode ──
def mark_done(task_id):
    """Set a task's done flag to true in the HTML file."""
    html = TASK_LIST_PATH.read_text(encoding="utf-8")
    # Pattern: { id: 'pX-Y', label: '...', done: false }
    pattern = re.compile(
        r"(id:\s*'" + re.escape(task_id) + r"'[^}]*?done:\s*)false",
        re.DOTALL
    )
    if pattern.search(html):
        html = pattern.sub(r"\1true", html)
        TASK_LIST_PATH.write_text(html, encoding="utf-8")
        print(f"  Marked {task_id} as DONE")
        return True
    else:
        print(f"  ERROR: Could not find task {task_id} or it's already done")
        return False

# ── Entry point ──
if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--mark-done":
        mark_done(sys.argv[2])
    elif len(sys.argv) == 2 and sys.argv[1] == "--recommend":
        main()
    else:
        main()
