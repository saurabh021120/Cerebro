import requests
import json
import asyncio
import time
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini API configuration
# ---------------------------------------------------------------------------

GEMINI_API_KEY = settings.GEMINI_API_KEY
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)


# ---------------------------------------------------------------------------
# Low-level Gemini call (synchronous, run in thread pool)
# ---------------------------------------------------------------------------

def _generate_content_sync(
    system_prompt: str,
    user_prompt: str,
    max_retries: int = 3,
    max_output_tokens: int = 8192,
) -> str:
    """
    Call the Gemini REST API and return the raw text response.
    Retries with exponential backoff on failure.
    """
    payload = {
        "contents": [
            {"parts": [{"text": f"{system_prompt}\n\n{user_prompt}".strip()}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": max_output_tokens,
            "responseMimeType": "application/json",
        },
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=payload,
                timeout=300,
            )

            if response.status_code == 200:
                result = response.json()
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    complete_text = "".join(p.get("text", "") for p in parts)
                    if complete_text:
                        return complete_text
                raise ValueError(
                    f"Unexpected response format: {json.dumps(result)[:500]}"
                )

            error_msg = (
                f"API returned status {response.status_code}: {response.text[:500]}"
            )
            logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {error_msg}")
            if attempt == max_retries - 1:
                raise Exception(error_msg)

        except requests.exceptions.Timeout:
            logger.warning(f"Attempt {attempt + 1}/{max_retries} timed out.")
            if attempt == max_retries - 1:
                raise

        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt == max_retries - 1:
                raise

        wait_time = 2 ** attempt
        logger.info(f"Retrying in {wait_time}s...")
        time.sleep(wait_time)

    raise Exception("Failed to generate content after all retries")


def _parse_json(raw: str, context: str = "") -> dict:
    """Parse JSON from Gemini response, stripping accidental markdown fences."""
    # Strip ```json ... ``` wrappers Gemini sometimes adds despite responseMimeType
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error ({context}): {e}")
        logger.error(f"  first 500 chars: {cleaned[:500]}")
        logger.error(f"  last  500 chars: {cleaned[-500:]}")
        raise ValueError(f"Failed to parse Gemini response as JSON ({context}): {e}")


# ---------------------------------------------------------------------------
# Phase 1 — generate the course outline (fast, small payload)
# ---------------------------------------------------------------------------

_OUTLINE_SYSTEM = """You are a course curriculum designer.
Generate a high-level course outline in JSON.
Return ONLY valid JSON — no markdown fences, no explanations."""

_OUTLINE_USER = """Create a course outline for:
Topic: {topic}
Goal: {goal}
Duration: {duration_weeks} weeks
Additional info: {additional_info}

Return this exact structure:
{{
  "title": "Course title",
  "description": "One-paragraph course description",
  "difficulty": "beginner|intermediate|advanced",
  "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  "modules": [
    {{
      "order": 1,
      "title": "Module title",
      "description": "Module description",
      "lesson_titles": ["Lesson A", "Lesson B", "Lesson C"]
    }}
  ]
}}

Rules:
- Create one module per week (so {duration_weeks} modules total).
- Each module should have 3-5 lessons.
- lesson_titles must be specific and actionable, e.g. "Setting up your Python environment"
  not just "Introduction".
"""


async def _generate_outline(
    topic: str, goal: str, duration_weeks: int, additional_info: str
) -> dict:
    user_prompt = _OUTLINE_USER.format(
        topic=topic,
        goal=goal,
        duration_weeks=duration_weeks,
        additional_info=additional_info or "None",
    )
    raw = await asyncio.to_thread(
        _generate_content_sync,
        _OUTLINE_SYSTEM,
        user_prompt,
        3,       # max_retries
        4096,    # smaller token budget — outline only
    )
    return _parse_json(raw, context="outline")


# ---------------------------------------------------------------------------
# Phase 2 — generate full content for a single module
# ---------------------------------------------------------------------------

_MODULE_SYSTEM = """You are a course content writer.
Generate detailed lesson content and a quiz for one course module.
Return ONLY valid JSON — no markdown fences, no explanations.

CRITICAL RULES FOR RESOURCES:
- Do NOT invent any URLs.
- Instead, provide two short search-engine queries per lesson:
    article_query  — a precise Google search query for a documentation page or tutorial article.
    video_query    — a precise YouTube search query for a tutorial video.
- Queries must be specific enough that the top result will be exactly what the lesson needs.
- Good article_query examples:
    "site:developer.mozilla.org CSS flexbox guide"
    "site:docs.python.org asyncio tutorial"
    "Python decorators explained real python"
- Good video_query examples:
    "CSS flexbox crash course traversy media"
    "Python asyncio explained 2024"
"""

_MODULE_USER = """Generate the full module content for a course on "{topic}".

Module {order}: {title}
Description: {description}
Lessons to cover: {lesson_titles}

Return this exact structure:
{{
  "title": "{title}",
  "description": "{description}",
  "order": {order},
  "lessons": [
    {{
      "title": "Exact lesson title from the list above",
      "content": "Detailed lesson content in markdown.\\n\\nUse:\\n- ### subheadings\\n- **bold** for key terms\\n- Bullet lists\\n- Numbered steps\\n- ```language\\ncode blocks\\n```\\n\\nAim for 400-600 words per lesson.",
      "duration_minutes": 30,
      "order": 1,
      "article_query": "specific google search query for an article or doc page",
      "video_query": "specific youtube search query for a tutorial video"
    }}
  ],
  "quiz": {{
    "title": "Module {order} Quiz",
    "questions": [
      {{
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Clear explanation of why this answer is correct."
      }}
    ]
  }}
}}

Requirements:
- Write one lesson entry for every title in the lesson list, in order.
- Each lesson content must be a full markdown document (400-600 words).
- Include 4-6 quiz questions that test key concepts from the module.
- article_query and video_query must be specific, not generic.
"""


async def _generate_module_content(topic: str, module_stub: dict) -> dict:
    """Generate full lesson content + quiz for a single module."""
    lesson_titles_str = ", ".join(
        f'"{t}"' for t in module_stub.get("lesson_titles", [])
    )
    user_prompt = _MODULE_USER.format(
        topic=topic,
        order=module_stub["order"],
        title=module_stub["title"],
        description=module_stub.get("description", ""),
        lesson_titles=lesson_titles_str,
    )
    raw = await asyncio.to_thread(
        _generate_content_sync,
        _MODULE_SYSTEM,
        user_prompt,
        3,       # max_retries
        8192,    # full token budget per module
    )
    data = _parse_json(raw, context=f"module {module_stub['order']}")

    # Preserve order from stub if Gemini drops it
    if "order" not in data:
        data["order"] = module_stub["order"]

    return data


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def generate_course_content(
    topic: str,
    goal: str,
    duration_weeks: int,
    additional_info: str,
) -> dict:
    """
    Generate a full course using a two-phase approach:

    Phase 1 — outline:
        A single fast Gemini call that returns the course skeleton (module titles
        and lesson titles only, no URLs, no body content). This keeps the first
        call small so it never truncates.

    Phase 2 — module content (parallel):
        One Gemini call per module, all fired concurrently with asyncio.gather.
        Each call produces detailed markdown lesson content plus search queries
        (article_query, video_query) that the resource_fetcher will use to
        retrieve real, verified URLs from SerpAPI and the YouTube Data API.

    This approach solves:
    - Hallucinated / 404 URLs  → LLM never generates URLs; search APIs do.
    - Irrelevant links          → search queries are crafted per-lesson topic.
    - Truncated content         → each module is its own API call with full budget.
    - Missing / bad videos      → video_query is resolved via YouTube Data API v3.
    """
    # ------------------------------------------------------------------
    # Phase 1: outline
    # ------------------------------------------------------------------
    logger.info(f"Generating outline for topic='{topic}' ({duration_weeks} weeks)")
    outline = await _generate_outline(topic, goal, duration_weeks, additional_info)

    modules_stubs: list[dict] = outline.get("modules", [])
    if not modules_stubs:
        raise ValueError("Gemini returned an outline with no modules.")

    logger.info(f"Outline has {len(modules_stubs)} module(s). Generating content in parallel...")

    # ------------------------------------------------------------------
    # Phase 2: full module content — all modules in parallel
    # ------------------------------------------------------------------
    module_tasks = [
        _generate_module_content(topic, stub)
        for stub in modules_stubs
    ]
    filled_modules = await asyncio.gather(*module_tasks, return_exceptions=True)

    # Surface any per-module errors without killing the whole course
    good_modules = []
    for i, result in enumerate(filled_modules):
        if isinstance(result, Exception):
            logger.error(
                f"Module {i + 1} generation failed: {result}. "
                "It will be skipped."
            )
        else:
            good_modules.append(result)

    if not good_modules:
        raise ValueError("All module generations failed — cannot build course.")

    # ------------------------------------------------------------------
    # Assemble final course dict (same shape as before for course_service)
    # ------------------------------------------------------------------
    course = {
        "title": outline.get("title", f"{topic} Course"),
        "description": outline.get("description", ""),
        "difficulty": outline.get("difficulty", "intermediate"),
        "thumbnail": outline.get(
            "thumbnail",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        ),
        "modules": good_modules,
    }

    logger.info(
        f"Course '{course['title']}' generated with {len(good_modules)} module(s)."
    )
    return course