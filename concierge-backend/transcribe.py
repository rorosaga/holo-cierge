import sys
import os
import whisper
import time

model = whisper.load_model("tiny")

def transcribe(audio_path):
    start_time = time.time()
    result = model.transcribe(audio_path, language="es", fp16=False)
    end_time = time.time()
    print(f"Transcription took {end_time - start_time} seconds")