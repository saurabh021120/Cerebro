# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
# pyrefly: ignore [missing-import]
from sqlalchemy.future import select
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import selectinload
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
import uuid
import logging
from typing import List

from app.models import (
    CourseDB,
    ModuleDB,
    LessonDB,
    QuizDB,
    QuizQuestionDB,
    UserProgressDB,
)
from app.dto import (
    Course,
    CourseCreateRequest,
    Module,
    Lesson,
    Quiz,
    QuizQuestion,
    Resource,
)
from app.services.ai_service import generate_course_content
from app.services.resource_validator import validate_and_filter_resources

logger = logging.getLogger(__name__)


def _convert_course_to_dto(course: CourseDB) -> Course:
    """Convert CourseDB model to Course DTO with all nested data"""
    modules = []
    for module_db in course.modules:
        lessons = []
        for lesson_db in module_db.lessons:
            lessons.append(
                Lesson(
                    id=str(lesson_db.id),
                    title=lesson_db.title,
                    content=lesson_db.content,
                    resources=[Resource(**r) for r in (lesson_db.resources or [])],
                    duration_minutes=lesson_db.duration_minutes,
                    order=lesson_db.order,
                )
            )

        quiz = None
        if module_db.quiz:
            quiz_db = module_db.quiz
            questions = []
            for q_db in quiz_db.questions:
                questions.append(
                    QuizQuestion(
                        id=str(q_db.id),
                        question=q_db.question,
                        options=q_db.options,
                        correct_answer=q_db.correct_answer,
                        explanation=q_db.explanation,
                    )
                )
            quiz = Quiz(
                id=str(quiz_db.id),
                title=quiz_db.title,
                questions=questions,
                passing_score=80,  # Default passing score
            )

        module_dict = {
            "id": str(module_db.id),
            "title": module_db.title,
            "description": module_db.description,
            "lessons": [l.model_dump() for l in lessons],
            "quiz": quiz.model_dump() if quiz else None,
            "order": module_db.order,
        }
        modules.append(Module.model_validate(module_dict))

    return Course(
        id=str(course.id),
        title=course.title,
        description=course.description,
        topic=course.topic,
        goal=course.goal,
        duration_weeks=course.duration_weeks,
        difficulty=course.difficulty,
        thumbnail=course.thumbnail,
        created_at=course.created_at.isoformat(),
        modules=modules,
    )


class CourseService:
    """Course business logic service"""

    @staticmethod
    async def create_course(session: AsyncSession, req: CourseCreateRequest) -> Course:
        """Generate and save a new course"""

        data = await generate_course_content(
            req.topic, req.goal, req.duration_weeks, req.additional_info
        )

        course = CourseDB(
            title=data["title"],
            description=data["description"],
            topic=req.topic,
            goal=req.goal,
            duration_weeks=req.duration_weeks,
            difficulty=data.get("difficulty", "intermediate"),
            thumbnail=data.get("thumbnail", ""),
        )

        for m in data["modules"]:
            module = ModuleDB(
                title=m["title"], description=m["description"], order=m["order"]
            )

            for l in m["lessons"]:
                # Validate and filter resources to remove invalid URLs
                raw_resources = l.get("resources", [])
                valid_resources = validate_and_filter_resources(raw_resources)

                if len(valid_resources) < len(raw_resources):
                    logger.warning(
                        f"Filtered {len(raw_resources) - len(valid_resources)} invalid "
                        f"resource(s) from lesson '{l['title']}'"
                    )

                module.lessons.append(
                    LessonDB(
                        title=l["title"],
                        content=l["content"],
                        duration_minutes=l["duration_minutes"],
                        order=l["order"],
                        resources=valid_resources,
                    )
                )

            if m.get("quiz"):
                quiz = QuizDB(title=m["quiz"]["title"])
                for q in m["quiz"]["questions"]:
                    quiz.questions.append(
                        QuizQuestionDB(
                            question=q["question"],
                            options=q["options"],
                            correct_answer=q["correct_answer"],
                            explanation=q["explanation"],
                        )
                    )
                module.quiz = quiz

            course.modules.append(module)

        session.add(course)
        session.add(UserProgressDB(course_id=course.id))
        await session.commit()

        # Re-query with eager loading to get all relationships
        result = await session.execute(
            select(CourseDB)
            .where(CourseDB.id == course.id)
            .options(
                selectinload(CourseDB.modules).selectinload(ModuleDB.lessons),
                selectinload(CourseDB.modules)
                .selectinload(ModuleDB.quiz)
                .selectinload(QuizDB.questions),
            )
        )
        course = result.scalar_one()

        return _convert_course_to_dto(course)

    @staticmethod
    async def get_all_courses(session: AsyncSession) -> List[Course]:
        """Retrieve all courses"""

        result = await session.execute(
            select(CourseDB).options(
                selectinload(CourseDB.modules).selectinload(ModuleDB.lessons),
                selectinload(CourseDB.modules)
                .selectinload(ModuleDB.quiz)
                .selectinload(QuizDB.questions),
            )
        )
        courses = result.scalars().all()

        return [_convert_course_to_dto(c) for c in courses]

    @staticmethod
    async def get_course_by_id(session: AsyncSession, course_id: str) -> Course:
        """Retrieve a specific course with all details"""

        result = await session.execute(
            select(CourseDB)
            .where(CourseDB.id == uuid.UUID(course_id))
            .options(
                selectinload(CourseDB.modules).selectinload(ModuleDB.lessons),
                selectinload(CourseDB.modules)
                .selectinload(ModuleDB.quiz)
                .selectinload(QuizDB.questions),
            )
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(404, "Course not found")

        return _convert_course_to_dto(course)

    @staticmethod
    async def delete_course(session: AsyncSession, course_id: str) -> dict:
        """Delete a course"""

        course = await session.get(CourseDB, uuid.UUID(course_id))
        if not course:
            raise HTTPException(404, "Course not found")

        await session.delete(course)
        await session.commit()

        return {"message": "deleted"}
