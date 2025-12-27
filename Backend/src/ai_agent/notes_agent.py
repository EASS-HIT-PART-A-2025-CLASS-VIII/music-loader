import re
from pydantic_ai import Agent, DocumentUrl
from pydantic_ai.exceptions import ModelHTTPError
from src.schemas.agent_output import AgentNotesOutput


async def ai_pdf_to_notes(agent, pdf_url: str):
    SYSTEM_PROMPT = """You are receiving a PDF music sheet document. 
    Your task is to read the music notes and generate a time based event json code compatible with Tone.js library.
    I will give an exemple:
    
    -- Start of exemple --
    [
    {// 1st event
  time: "0:1:0",      // position musicale (bars:beats:sixteenths)
  note: "E4",         // pitch (notation anglo-saxonne)
  duration: "8n",     // durée musicale (notation Tone.js)
  velocity: 0.8       // intensité normalisée (0.0 → 1.0)
} 
{// 2nd event
  time: "0:1:2",
  note: "G4",
  duration: "8n",
  velocity: 0.8}
  
  {// nth event}
]
-- End of exemple --

-You don't need to explain anything, just return the json array as in the exemple and no comments, nothing else that would prevent a direct use/parsing of the result.
-include all notes you can read from the PDF (both treble and bass clefs if present).
-You must return also make polyphonic notes (chords) if present in the sheet.
-You need to send at least 40 notes if the PDF contains enough notes.
-Don't include anything else than the json array, not even backticks or quotes. Don't write ```json ``` or anything juste the array starting with '[' and ending with ']' (without ' characters).
-No Markdown code fences ! just the content of the json.
-Take into considerations the tempo and time signature indicated on the sheet to compute the time values correctly.
-If the tempo or time signature are not indicated, guess correctly the tempo or assume a default tempo of 90bpm and a 4/4 time signature.
    """
    
    try:
        result = await agent.run([DocumentUrl(pdf_url)], instructions=SYSTEM_PROMPT)
    except ModelHTTPError as e:
        # If the configured model isn't permitted, retry once with a safer fallback.
        if getattr(e, "status_code", None) == 403:
            fallback_agent = Agent("gateway/anthropic:claude-sonnet-4-5")
            result = await fallback_agent.run([DocumentUrl(pdf_url)], instructions=SYSTEM_PROMPT)
        else:
            raise e

    def _strip_markdown_fence(text: str) -> str:
        # Remove ```json ... ``` fences if the model added them
        cleaned = text.strip()
        fenced = re.match(r"```(?:json)?\s*(.*)```", cleaned, flags=re.DOTALL)
        return fenced.group(1).strip() if fenced else cleaned

    cleaned_output = _strip_markdown_fence(result.output)
    # pydantic validation
    validated = AgentNotesOutput.model_validate({"notes": cleaned_output})
    return validated.notes
