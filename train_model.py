import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib
import os

# 1. Load Data
print("Loading dataset...")
try:
    data = pd.read_csv('data/fake_reviews_dataset.csv')
except FileNotFoundError:
    print("Error: Dataset not found in data/fake_reviews_dataset.csv")
    exit()

X = data['text']
y = data['label']

# 2. Build Pipeline
# We use a Pipeline to bundle the vectorizer and the classifier
print("Training model...")
model = make_pipeline(TfidfVectorizer(), MultinomialNB())

# 3. Train Model
model.fit(X, y)

# 4. Save Model
if not os.path.exists('models'):
    os.makedirs('models')

print("Saving model to models/fake_review_model.pkl...")
joblib.dump(model, 'models/fake_review_model.pkl')

print("Training complete! You can now run the app.")
