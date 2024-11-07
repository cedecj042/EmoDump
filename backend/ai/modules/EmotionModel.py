# Importing stock ml libraries
import warnings
warnings.simplefilter('ignore')
import numpy as np
from tqdm import tqdm
import torch
from torch.utils.data import Dataset
from transformers import DistilBertModel
import logging
logging.basicConfig(level=logging.ERROR)
from torch import cuda
from torch.utils.data import DataLoader



device = 'cuda' if cuda.is_available() else 'cpu'
#Parameters for fine-tuning distilbert
MAX_LEN = 64
TRAIN_BATCH_SIZE = 8
VALID_BATCH_SIZE = 8
EPOCHS = 12
LEARNING_RATE = 1e-06


class SingleTweetDataset(Dataset):
    def __init__(self, tweet, average_score, tokenizer, max_len):
        self.tokenizer = tokenizer
        self.text = tweet
        self.average_score = average_score
        self.max_len = max_len

    def __len__(self):
        return 1  # Only one tweet

    def __getitem__(self, index):
        text = " ".join(self.text.split())
        inputs = self.tokenizer.encode_plus(
            text,
            None,
            add_special_tokens=True,
            max_length=self.max_len,
            pad_to_max_length=True,
            return_token_type_ids=True
        )
        ids = inputs['input_ids']
        mask = inputs['attention_mask']
        token_type_ids = inputs["token_type_ids"]

        average_score = torch.tensor(self.average_score[index], dtype=torch.float)

        return {
            'ids': torch.tensor(ids, dtype=torch.long),
            'mask': torch.tensor(mask, dtype=torch.long),
            'token_type_ids': torch.tensor(token_type_ids, dtype=torch.long),
            'average_score': average_score
        }

class DistilBERTClass(torch.nn.Module):
    def __init__(self):
        super(DistilBERTClass, self).__init__()
        self.l1 = DistilBertModel.from_pretrained("distilbert-base-uncased")
        self.pre_classifier = torch.nn.Linear(768, 768)
        self.dropout = torch.nn.Dropout(0.1)
        self.classifier = torch.nn.Linear(768+8,8)

    def forward(self, input_ids, attention_mask, token_type_ids, average_score):
        output_1 = self.l1(input_ids=input_ids, attention_mask=attention_mask)
        hidden_state = output_1[0]
        pooler = hidden_state[:, 0]
        pooler = self.pre_classifier(pooler)
        pooler = torch.nn.Tanh()(pooler)
        pooler = self.dropout(pooler)
        combined = torch.cat((pooler,average_score), dim=1)
        output = self.classifier(combined)
        return output


class Emotion:
    def __init__(self, scores):
        self.emotions = {
            'anger': scores[0],
            'anticipation': scores[1],
            'disgust': scores[2],
            'fear': scores[3],
            'joy': scores[4],
            'sadness': scores[5],
            'surprise': scores[6],
            'trust': scores[7]
        }


def evaluate_tweet(data,model):
    ids = data['ids'].to(device, dtype=torch.long)
    mask = data['mask'].to(device, dtype=torch.long)
    token_type_ids = data['token_type_ids'].to(device, dtype=torch.long) 
    average_score = data['average_score'].to(device, dtype=torch.float)
    outputs = model(ids, mask, token_type_ids, average_score)

    with torch.no_grad():
        outputs = model(ids, mask, token_type_ids,average_score)
        probabilities = torch.sigmoid(outputs).cpu().numpy()
    return probabilities



def convert_percentage(probabilities):
    emotions = ["anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"]
    # Print the percentages for each emotion
    for i, emotion in enumerate(emotions):
        print(f"{emotion}: {probabilities[0][i] * 100:.2f}%")
    
def evaluate_data_loader(data_loader,model):
    probability = []
    for item in data_loader:
        probability.append(evaluate_tweet(item,model))
    return probability
