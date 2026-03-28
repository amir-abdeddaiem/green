import asyncio
import os


def _bool_env(name: str) -> bool:
    value = os.getenv(name)
    return bool(value and value.strip())


async def main() -> None:
    from ai_chatbot import ai_chatbot  # import after env is loaded in ai_chatbot

    print("GEMINI_API_KEY loaded:", _bool_env("GEMINI_API_KEY"))
    print("HAS model:", bool(getattr(ai_chatbot, "model", None)))

    chunks: list[str] = []
    async for c in ai_chatbot.get_response("Hello, what is Verdustry?"):
        chunks.append(c)
        if sum(len(x) for x in chunks) >= 600:
            break

    text = "".join(chunks)
    print("--- RESPONSE (first 400 chars) ---")
    print(text[:400])


if __name__ == "__main__":
    asyncio.run(main())
