from pydantic_ai import DocumentUrl


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
-For now only use the beginning of the piece (first 30 seconds max or less or anything that is in your capability).
-Don't include anything else than the json array, not even backticks or quotes. Don't write ```json ``` or anything juste the array starting with '[' and ending with ']' (without ' characters).
-No Markdown code fences ! just the content of the json.
-Take into considerations the tempo and time signature indicated on the sheet to compute the time values correctly.
    """
    
    
    result = await agent.run([DocumentUrl(pdf_url)], instructions=SYSTEM_PROMPT)
    
    return result.output
