def process_input(raw_text: str, source: str = "mobile"):
    return {
        "text": raw_text,
        "intent": "unknown",
        "domain": "general",
        "urgency": "normal",
        "metadata": {}
    }\n