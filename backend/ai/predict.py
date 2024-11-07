import numpy as np
from .modules.Preprocessing import preprocess_text, tokenize
from .modules.FeatureExtraction import *
from .modules.EmotionModel import *
from transformers import DistilBertTokenizer
from torch.utils.data import DataLoader
from api.models import DumpEmotion,Emotion
import torch
import json

class EmotionPredictor:
    def __init__(self, model_path, tokenizer_path, device='cuda'):
        self.device = device if torch.cuda.is_available() else 'cpu'
        self.tokenizer = DistilBertTokenizer.from_pretrained(tokenizer_path)
        self.model = DistilBERTClass()
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

    def preprocess(self, tweet):
        inputs = preprocess_text(tweet)
        tokens = tokenize(inputs)
        return ' '.join(tokens)

    def predict(self, dump):
        clean_tweet = self.preprocess(dump.dump_content)
        average_score = get_average_score(clean_tweet)
        dataset = SingleTweetDataset(clean_tweet, average_score, self.tokenizer, max_len=128)
        loader = DataLoader(dataset, batch_size=1, shuffle=False, num_workers=0)
        probabilities = np.array(evaluate_data_loader(loader, self.model))
        return self.convert_to_json(probabilities.flatten(), dump)

    def convert_to_json(self, probabilities, dump):
        emotions = Emotion.objects.all()  # Retrieve all emotions from the database
        emotion_scores = {}
        for i, emotion in enumerate(emotions):
            # Create DumpEmotion instances for each emotion and store the probabilities
            dump_emotion = DumpEmotion(dump_id=dump, emotion_id=emotion, probability=probabilities[i] * 100)
            dump_emotion.save()
            emotion_scores[emotion.emotion_name] = probabilities[i] * 100
        return json.dumps(emotion_scores)
    

# model_path = 'models/distilbert_emotions.bin'
# tokenizer_path = 'models/vocab_distilbert_emotions.bin'
# predictor = EmotionPredictor(model_path, tokenizer_path)

# tweet = "Ew, such a freak"
# result_json = predictor.predict(tweet)
# print(result_json)