import sys
import os
import whisper
import time
import json
import ssl

# Ignore SSL certificate verification       
ssl._create_default_https_context = ssl._create_unverified_context

def transcribe(audio_path):
    model = whisper.load_model("base")
    start_time = time.time()
    result = model.transcribe(audio_path, language="es", fp16=False)
    end_time = time.time()
    transcription_time = end_time - start_time
    return result['text'], transcription_time

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_path>")
        sys.exit(1)

    audio_path = sys.argv[1]

    if not os.path.exists(audio_path):
        print(f"Audio file not found: {audio_path}")
        sys.exit(1)

    transcription, transcription_time = transcribe(audio_path)
    
    output = {
        "transcription": transcription,
        "transcription_time": transcription_time
    }
    
    print(json.dumps(output))
