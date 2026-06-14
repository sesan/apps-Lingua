import os
import sys
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vision-agent")

# Load environment variables
local_env = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
if os.path.exists(local_env):
    logger.info(f"Loading local environment from {local_env}")
    load_dotenv(local_env)

parent_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(parent_env):
    logger.info(f"Loading parent environment from {parent_env}")
    load_dotenv(parent_env)

# Map parent Stream environment variables
if os.getenv("STREAM_SECRET_KEY") and not os.getenv("STREAM_API_SECRET"):
    os.environ["STREAM_API_SECRET"] = os.getenv("STREAM_SECRET_KEY")

# Check required keys
missing_keys = []
for key in ["STREAM_API_KEY", "STREAM_API_SECRET", "GEMINI_API_KEY"]:
    if not os.getenv(key):
        missing_keys.append(key)

if missing_keys:
    logger.warning(
        f"Missing environment variables: {', '.join(missing_keys)}. "
        "Ensure they are defined in your environment or parent .env file."
    )

from vision_agents.core import Runner, User, Agent
from vision_agents.core.agents import AgentLauncher
from vision_agents.plugins import gemini, getstream

async def create_agent(**kwargs) -> Agent:
    """Create the AI Teacher agent using Google Gemini Realtime."""
    # Instructions specify English language and language teaching context
    instructions = (
        "You are a warm, human, friendly, and energetic AI language teacher. "
        "You speak English and teach the student their selected language through English. "
        "Engage the student in an interactive, step-by-step dialogue. "
        "Keep your sentences short, clear, and conversational. "
        "Provide constructive feedback and encourage the student at every step."
    )
    
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(name="AI Teacher", id="ai-teacher"),
        instructions=instructions,
        llm=gemini.Realtime(
            model="gemini-3.0-flash"
        )
    )
    return agent

async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    """Join the call and keep running until it concludes."""
    logger.info(f"AI Teacher joining call: {call_type}:{call_id}")
    call = await agent.create_call(call_type, call_id)
    
    try:
        logger.info("Fetching call metadata to retrieve custom fields...")
        await call.get()
        custom = call.custom_data or {}
        
        lesson_title = custom.get("lesson_title", "Dynamic Lesson")
        lesson_description = custom.get("lesson_description", "")
        language_name = custom.get("language_name", "Target Language")
        goals = custom.get("goals", [])
        
        ai_teacher_prompt = custom.get("ai_teacher_prompt", {})
        persona = ai_teacher_prompt.get("persona", "You are Mateo, a warm, energetic, and patient Spanish teacher.")
        scenario = ai_teacher_prompt.get("scenario", "A casual encounter in a public plaza.")
        instructions = ai_teacher_prompt.get("instructions", "Start by greeting the user warmly.")
        
        vocab = custom.get("vocabulary", [])
        phrases = custom.get("phrases", [])
        
        vocab_str = ", ".join([f"'{v.get('word')}' ({v.get('translation')})" for v in vocab]) if vocab else "None"
        phrases_str = ", ".join([f"'{p.get('text')}' ({p.get('translation')})" for p in phrases]) if phrases else "None"
        
        dynamic_instructions = (
            f"{persona}\n\n"
            f"Context/Scenario: {scenario}\n"
            f"Lesson Title: {lesson_title}\n"
            f"Lesson Description: {lesson_description}\n"
            f"Target Language: {language_name}\n\n"
            f"Lesson Goals:\n"
        )
        for goal in goals:
            dynamic_instructions += f"- {goal}\n"
            
        dynamic_instructions += (
            f"\nExpected Vocabulary to practice: {vocab_str}\n"
            f"Expected Phrases to practice: {phrases_str}\n\n"
            f"Instructions:\n{instructions}\n\n"
            f"Teach the student the selected language ({language_name}) step-by-step. "
            f"Keep your replies conversational, short, and friendly. Speak primarily in English, "
            f"but use the target language ({language_name}) for vocabulary and phrases. "
            f"Encourage them, correct pronunciation/grammar gently, and guide them through the lesson."
        )
        
        logger.info(f"Setting dynamic instructions for agent: {dynamic_instructions}")
        from vision_agents.core.instructions import Instructions
        agent.instructions = Instructions(input_text=dynamic_instructions)
        agent.llm.set_instructions(agent.instructions)
    except Exception as e:
        logger.error(f"Error fetching call metadata or setting dynamic instructions: {e}. Falling back to default instructions.")
        
    try:
        logger.info("Going live on call...")
        await call.go_live()
    except Exception as e:
        logger.warning(f"Error calling go_live (might already be live or not needed): {e}")

    async with agent.join(call):
        await agent.finish()

if __name__ == "__main__":
    launcher = AgentLauncher(create_agent=create_agent, join_call=join_call)
    Runner(launcher).cli()
