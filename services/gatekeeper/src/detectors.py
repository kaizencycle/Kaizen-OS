"""Heuristic detectors for prompt injection and jailbreak attempts."""
import re
import unicodedata

# Suspicious patterns that may indicate prompt injection or jailbreak attempts
SUSPICIOUS_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"disregard\s+safety",
    r"developer\s+mode",
    r"\bDAN\b",  # "Do Anything Now" jailbreak pattern
    r"bypass",
    r"disable\s+guardrails",
    r"base64\s*[,:]",
    r"\u202e",  # Right-to-left override character
    r"system\s*[:=]\s*",
    r"assistant\s*[:=]\s*",
    r"user\s*[:=]\s*",
    r"<\|[a-z_]+\|>",  # Token injection patterns
    r"\[INST\]",  # Llama instruction injection
    r"\{INST\}",  # Variant instruction injection
]

def normalize_text(text: str) -> str:
    """
    Normalize text for detection (lowercase, remove control chars).
    
    Args:
        text: Input text
        
    Returns:
        Normalized text
    """
    # Remove control characters except newlines and tabs
    text = "".join(
        char for char in text 
        if unicodedata.category(char)[0] != "C" or char in "\n\t"
    )
    return text.lower()

def looks_malicious(payload: dict) -> bool:
    """
    Check if payload contains suspicious patterns indicating injection attempts.
    
    Args:
        payload: Request payload dictionary
        
    Returns:
        True if payload looks malicious, False otherwise
    """
    # Convert payload to string for pattern matching
    blob = normalize_text(str(payload))
    
    # Check for suspicious patterns
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, blob, re.IGNORECASE):
            return True
    
    # Check for unusual Unicode sequences
    if len(blob) > 1000:  # Very long prompts may be suspicious
        # Additional heuristics for long inputs
        if blob.count("base64") > 2:
            return True
    
    return False

def detect_jailbreak_attempt(text: str) -> bool:
    """
    Detect common jailbreak patterns in text.
    
    Args:
        text: Input text to check
        
    Returns:
        True if jailbreak pattern detected
    """
    normalized = normalize_text(text)
    
    jailbreak_indicators = [
        "pretend you are",
        "act as if",
        "roleplay as",
        "ignore all previous",
        "override",
        "break out of",
        "jailbreak",
        "hack",
    ]
    
    return any(indicator in normalized for indicator in jailbreak_indicators)
