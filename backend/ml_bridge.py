import sys
import json
import joblib
import os

# Load model
# We assume this script is run from 'backend/' folder, so the model is in '../models/'
# Or if run from root, adjusted accordingly. Better to use absolute or relative to script.

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '../models/fake_review_model.pkl')

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

model = load_model()

def analyze_reasons(text):
    reasons = []
    
    # 1. Excessive Capitalization
    caps_count = sum(1 for c in text if c.isupper())
    if len(text) > 0 and (caps_count / len(text)) > 0.4:
        reasons.append("Excessive use of UPPERCASE letters")
        
    # 2. Promotional Keywords
    promo_words = ["free", "gift", "click here", "link", "money", "guaranteed", "offer", "discount", "buy now"]
    if any(word in text.lower() for word in promo_words):
        reasons.append("Contains promotional or spam keywords")
        
    # 3. Excessive Exclamation
    if text.count("!") > 3:
        reasons.append("Excessive use of exclamation marks!!!")
        
    # 4. Short & Generic
    if len(text) < 20 and "good" in text.lower():
        reasons.append("Suspiciously short and generic")
        
    # 5. First Person Overuse (often fake stories)
    if text.lower().count("i ") > 4:
        reasons.append("Unusual frequency of first-person pronouns")

    return reasons

def predict(text):
    if model is None:
        return {"error": "Model not found"}
    
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    
    result = "Fake" if prediction == 1 else "Real"
    conf = probabilities[1] if prediction == 1 else probabilities[0]
    
    reasons = analyze_reasons(text)
    
    return {
        "prediction": result,
        "confidence": float(conf),
        "reasons": reasons
    }

if __name__ == "__main__":
    # Read text from stdin or argument
    if len(sys.argv) > 1:
        text = sys.argv[1]
        print(json.dumps(predict(text)))
    else:
        print(json.dumps({"error": "No text provided"}))
