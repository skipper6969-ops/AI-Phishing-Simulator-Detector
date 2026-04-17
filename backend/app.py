from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load variables from .env file
load_dotenv()

# 🔑 Load API key securely from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "AI Phishing Detector Backend Running 🚀"


@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    text = data.get("text", "")

    prompt = f"""
    You are a cybersecurity expert. Analyze this message and determine if it's phishing.
    
    Message:
    "{text}"
    
    Respond with a JSON object containing EXACTLY these keys:
    "score": an integer from 0 to 100 representing phishing probability.
    "isPhishing": a boolean, true if likely phishing.
    "radar_vectors": an array of exactly 5 integers (0-100), representing scores for [Urgency, Links, Sender, Formatting, Data Request].
    "threats": an array of string sentences explaining the identified threats or reasons it is safe.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content
        return jsonify(json.loads(result))

    except Exception as e:
        return jsonify({
            "error": str(e)
        })


@app.route('/simulate', methods=['GET'])
def simulate():
    prompt = """
    Generate a realistic phishing message. Make it convincing but clearly fake.
    Example types: bank alert, job offer, OTP scam.
    
    Respond with a JSON object containing EXACTLY these keys:
    "sender": the spoofed sender name and email address. Example: 'HR Payroll <hr-update@payro11.com>'
    "subject": the subject line of the email.
    "body": the HTML body of the email. Use <p> tags and a fake <a href="#" class="fake-link"> link for the call to action. Keep it short.
    "reasoning": A brief explanation of why this is a phishing attempt to show the user after they guess.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content
        return jsonify(json.loads(result))

    except Exception as e:
        return jsonify({
            "error": str(e)
        })


if __name__ == '__main__':
    app.run(debug=True)
