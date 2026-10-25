"""Small, readable RAG helper: chunk notes -> embed -> rank -> ask the LLM."""
import json
import math
import os

from fastapi import HTTPException
from google import genai
from google.genai import types


def split_into_chunks(notes):
    """Split long notes by paragraphs so retrieval can return only useful parts."""
    chunks = []
    for note in notes:
        paragraphs = [part.strip() for part in note.content.split("\n\n") if part.strip()]
        current_chunk = ""
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) > 700 and current_chunk:
                chunks.append({"title": note.title, "text": current_chunk})
                current_chunk = ""
            current_chunk = f"{current_chunk}\n{paragraph}".strip()
        if current_chunk:
            chunks.append({"title": note.title, "text": current_chunk})
    return chunks


def cosine_similarity(first_vector, second_vector):
    dot_product = sum(a * b for a, b in zip(first_vector, second_vector))
    first_length = math.sqrt(sum(value * value for value in first_vector))
    second_length = math.sqrt(sum(value * value for value in second_vector))
    return dot_product / (first_length * second_length) if first_length and second_length else 0


def analyze_job_fit(job_description, notes):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Job-Fit Assistant is not configured yet. Add GEMINI_API_KEY to the backend environment.")

    chunks = split_into_chunks(notes)
    if not chunks:
        raise HTTPException(status_code=400, detail="Add at least one profile note before running the analysis.")

    client = genai.Client(api_key=api_key)

    # Each short text gets one embedding vector. Keeping this as a small loop is
    # easy to read and is enough for a student's profile notes.
    job_vector = get_embedding(client, job_description)
    for chunk in chunks:
        chunk["similarity"] = cosine_similarity(job_vector, get_embedding(client, chunk["text"]))

    relevant_chunks = sorted(chunks, key=lambda chunk: chunk["similarity"], reverse=True)[:4]
    context = "\n\n".join(f"[{chunk['title']}]\n{chunk['text']}" for chunk in relevant_chunks)

    prompt = f"""Compare the candidate context with this job description. Use only the candidate context as evidence.

JOB DESCRIPTION:
{job_description}

RETRIEVED CANDIDATE CONTEXT:
{context}

Return JSON only with this exact shape:
{{
  "match_score": 0,
  "summary": "short honest explanation",
  "strengths": ["specific matching skill or experience"],
  "missing_skills": ["important requirement not shown in the notes"],
  "suggestions": ["specific resume or preparation improvement"]
}}
Use a realistic 0-100 score. Do not claim the candidate has a skill unless it appears in the context."""

    response = client.models.generate_content(
       model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    result = json.loads(response.text)
    result["retrieved_note_titles"] = list(dict.fromkeys(chunk["title"] for chunk in relevant_chunks))
    return result


def get_embedding(client, text):
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return response.embeddings[0].values
