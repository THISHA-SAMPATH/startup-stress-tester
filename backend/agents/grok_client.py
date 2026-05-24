import os
import time
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openrouter/free"


def generate_text(prompt: str, retries: int = 3) -> str:
    if not API_KEY:
        raise RuntimeError(
            "❌ OPENROUTER_API_KEY is not set.\n"
            "Get your free key at openrouter.ai and set it in backend/.env"
        )

    payload = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1024,
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
        "HTTP-Referer": "https://startup-stress-tester.app",
        "X-Title": "Startup Stress Tester",
    }

    last_error = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                BASE_URL, data=payload, headers=headers, method="POST"
            )
            with urllib.request.urlopen(req, timeout=45) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                text = body["choices"][0]["message"]["content"]
                if not text or not text.strip():
                    raise RuntimeError("Empty response")
                return text.strip()

        except urllib.error.HTTPError as e:
            status = e.code
            err_body = e.read().decode("utf-8", errors="replace")
            last_error = RuntimeError(f"HTTP {status}: {err_body[:200]}")

            if status == 401:
                raise RuntimeError(
                    "❌ OPENROUTER_API_KEY is invalid.\n"
                    "Check your key at openrouter.ai"
                ) from last_error

            if status == 429:
                wait = 5 * (attempt + 1)
                print(f"  [openrouter] Rate limited. Waiting {wait}s...")
                time.sleep(wait)
                continue

            if status >= 500:
                print(f"  [openrouter] Server error. Retrying...")
                time.sleep(3)
                continue

            raise last_error

        except Exception as e:
            last_error = e
            print(f"  [openrouter] Error attempt {attempt+1}: {str(e)[:120]}")
            if attempt < retries - 1:
                time.sleep(2)
            continue

    raise RuntimeError(
        f"❌ OpenRouter API failed after {retries} attempts.\n"
        f"Last error: {last_error}"
    ) from last_error