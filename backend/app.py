from flask import Flask, request, jsonify
from openai import OpenAI

# 🔑 Replace with your API key
client = OpenAI(api_key="paste_key")

app = Flask(__name__)

@app.route('/')
def home():
    return "AI Phishing Detector Backend Running 🚀"


@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    text = data.get("text", "")

    prompt = f"""
    You are a cybersecurity expert.

    Analyze this message and determine if it's phishing.

    Message:
    "{text}"

    Respond ONLY in this format:

    Risk: <number 0-100>
    Verdict: <Safe / Suspicious / Dangerous>
    Reasons:
    - reason 1
    - reason 2
    - reason 3
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content

        return jsonify({
            "analysis": result
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })


@app.route('/simulate', methods=['GET'])
def simulate():
    prompt = """
    Generate a realistic phishing message.
    Make it convincing but clearly fake.
    Example types: bank alert, job offer, OTP scam.
    Keep it short.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content

        return jsonify({
            "phishing_example": result
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })


if __name__ == '__main__':
    app.run(debug=True)
