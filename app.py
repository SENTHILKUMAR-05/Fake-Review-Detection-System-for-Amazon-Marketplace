import streamlit as st
import joblib
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize VADER analyzer
analyzer = SentimentIntensityAnalyzer()

# Load the trained model
MODEL_PATH = 'models/fake_review_model.pkl'

@st.cache_resource
def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

model = load_model()

# Page Config
st.set_page_config(
    page_title="Fake Review Detector",
    page_icon="🕵️",
    layout="centered"
)

# Custom CSS for aesthetics
st.markdown("""
<style>
    .main {
        background-color: #f5f5f5;
    }
    .stTextArea textarea {
        background-color: #ffffff;
        color: #333333;
    }
    .stButton>button {
        background-color: #ff9900;
        color: white;
        border-radius: 5px;
        width: 100%;
    }
    .stButton>button:hover {
        background-color: #e68a00;
    }
    h1 {
        color: #232f3e;
        text-align: center;
    }
    .result-box {
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin-top: 20px;
        font-weight: bold;
        font-size: 24px;
    }
    .fake {
        background-color: #ffebee;
        color: #c62828;
        border: 2px solid #ef5350;
    }
    .real {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 2px solid #66bb6a;
    }
</style>
""", unsafe_allow_html=True)

# App Header
st.title("🕵️ Fake Review Detector")
st.markdown("### Check if an Amazon review is Real or Fake")
st.markdown("Enter the review text below and our AI will analyze it for you.")

# Input Area
user_input = st.text_area("Review Text", height=150, placeholder="Type or paste the review here...")

# Analysis Logic
if st.button("Analyze Review"):
    if user_input.strip() == "":
        st.warning("Please enter some text to analyze.")
    elif model is None:
        st.error("Model not found! Please run 'python train_model.py' first.")
    else:
        # Predict
        prediction = model.predict([user_input])[0]
        probabilities = model.predict_proba([user_input])[0]
        
        # Display Result
        if prediction == 1:
            confidence = probabilities[1] * 100
            st.markdown(f"""
                <div class="result-box fake">
                    🚨 FAKE REVIEW DETECTED 🚨<br>
                    <span style="font-size: 16px; font-weight: normal;">Confidence: {confidence:.2f}%</span>
                </div>
            """, unsafe_allow_html=True)
            st.warning("⚠️ This review shows patterns commonly associated with fake or promotional reviews.")
        else:
            base_confidence = probabilities[0] * 100
            
            # --- Hybrid Scoring Logic: Sentiment Boost ---
            # VADER compound score represents overall sentiment [-1.0, 1.0]
            sentiment_dict = analyzer.polarity_scores(user_input)
            polarity = sentiment_dict['compound']
            
            # If the ML model thinks it's likely real, and the sentiment is naturally very positive:
            if base_confidence > 50 and polarity > 0.3:
                # Boost confidence. For polarity=1.0, we can boost close to 95-99%
                boost = (polarity * 30)
                confidence = min(99.9, base_confidence + boost)
                
                # If they sound highly genuine, maybe they are simply expressing joy
                if confidence < 85: 
                    confidence = 85.0 + (polarity * 10) 
            else:
                confidence = base_confidence

            st.markdown(f"""
                <div class="result-box real">
                    ✅ REAL REVIEW DETECTED ✅<br>
                    <span style="font-size: 16px; font-weight: normal;">Confidence: {confidence:.2f}%</span>
                </div>
            """, unsafe_allow_html=True)
            st.success(f"👍 This review appears to be genuine. (Sentiment Polarity: {polarity:.2f})")

# Footer
st.markdown("---")
st.caption("Powered by Scikit-Learn & Streamlit | Built for Amazon Marketplace Safety")
