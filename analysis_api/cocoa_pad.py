import requests
import base64
import json
import numpy as np
import pandas as pd
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet as wn
import os

from dotenv import load_dotenv
load_dotenv()

nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()

def lexical_frequency(word):
    rec = pd.read_csv("unigram_freq.csv")
    sum = np.sum(rec["count"])
    rec["count"] = rec["count"] / sum
    rec = rec.set_index("word")
    
    return float(rec.loc[word]["count"])
    
def repetition(list_):
    rep = 0
    _list = [lemmatizer.lemmatize(l) for l in list_]
    words_said = set(_list)
    return len(_list) - len(words_said)
    
from itertools import groupby
def switching_clustering(list_, word_dict):
    cat = []
    for l in list_:
        try:
            cat.append(word_dict[l])
        except:
            cat.append(["NA"])
            
    # clustering
    inter = []
    for i in range(len(cat) - 1):
        c1, c2 = cat[i], cat[i + 1]
        intersection = list(set(c1) & set(c2))
        try:
            inter.append(intersection[0])
        except:
            inter.append("")
    
    res = []
    for k, g in groupby(inter):
        res.extend([k, str(len(list(g)))])
    
        
    nb_clusters = 0
    for k in range(0, len(res) - 1, 2):
        c_name = res[k]
        c_size = res[k + 1]
        if c_name == "":
            nb_clusters += int(c_size)
        else:
            nb_clusters += 1
    
    if len(res) < 1:
        nb_clusters = 0
        nb_switches = 0
        res = 0
        return nb_clusters, nb_switches, res

    if res[0] == "" and len(res) == 2:
        nb_clusters = len(cat)
    nb_switches = nb_clusters - 1
    
    return nb_clusters, nb_switches, res
    
def generate_animal_dict():

    f = open("animal_groups.txt", "r")
    animal_dict = {}
    
    for line in f:
        split = line.split(":")
        cat, words = split[0], split[1].split(",")
        words = [w.strip() for w in words]
        
        for w in words:
            if w in animal_dict:
                animal_dict[w].append(cat)
            else:
                animal_dict[w] = [cat]

    return animal_dict

animal_dict = generate_animal_dict()

def clean_list(list_, word_dict):
    return [l for l in list_ if l in word_dict]

def animal_task(list_):
    measures = {}
    # discrepancy/asides
    cleaned_list = clean_list(list_, animal_dict)
    measures["total_word_count"] = len(list_)
    measures["lexical_frequency"] = [lexical_frequency(word) for word in cleaned_list]
    measures["repetition"] = repetition(cleaned_list)
    measures["word_count"] = len(cleaned_list)
    measures["unique_word_count"] = len(set([lemmatizer.lemmatize(l) for l in cleaned_list]))
    measures["error"] = len([w for w in list_ if w not in animal_dict])
    measures["nb_clusters"], measures["nb_switches"], measures["clusters"] = switching_clustering(cleaned_list, animal_dict)
    
    return measures


def fruit_veg_task(list_):
    measures = {}
    # discrepancy/asides
    measures["lexical_frequency"] = [lexical_frequency(word) for word in list_]
    measures["repetition"] = repetition(list_)
    measures["word_count"] = len(list_)
    measures["unique_word_count"] = len(set([lemmatizer.lemmatize(l) for l in list_]))
    measures["fruit_veg_categories"] = switching_clustering(list_, fruit_dict)
    measures["error"] = len([w for w in list_ if w not in fruit_dict])
    measures["nb_clusters"], measures["nb_switches"] = switching_clustering(list_)
    
    
def f_starting_words(list_):
    measures = {}
    # discrepancy/asides
    measures["lexical_frequency"] = [lexical_frequency(word) for word in list_]
    measures["repetition"] = repetition(list_)
    measures["error"] = len([word for word in list_ if not word[0].lower() == "f"])
    measures["word_count"] = len(list_)
    measures["unique_word_count"] = len(set([lemmatizer.lemmatize(l) for l in list_]))
    measures["nb_clusters"], measures["nb_switches"] = switching_clustering(list_)
    
    return measures
    
def a_starting_words(list_):
    measures = {}
    # discrepancy/asides
    measures["lexical_frequency"] = [lexical_frequency(word) for word in list_]
    measures["repetition"] = repetition(list_)
    measures["error"] = len([word for word in list_ if not word[0].lower() == "a"])
    measures["word_count"] = len(list_)
    measures["unique_word_count"] = len(set([lemmatizer.lemmatize(l) for l in list_]))
    measures["nb_clusters"], measures["nb_switches"] = switching_clustering(list_)
    
    return measures

    
def action_words(list_):
    measures = {}
    # discrepancy/asides
    measures["lexical_frequency"] = [lexical_frequency(word) for word in list_]
    measures["repetition"] = repetition(list_)
    measures["error"] = 0
    measures["word_count"] = len(list_)
    measures["unique_word_count"] = len(set([lemmatizer.lemmatize(l) for l in list_]))
    measures["nb_clusters"], measures["nb_switches"] = switching_clustering(list_)
    
    
    for w in list_:
        print(w)
        pos_l = []
        print(wn.synsets(w))
        for tmp in wn.synsets(w):
            if tmp.name().split('.')[0] == w:
                pos_l.append(tmp.pos())
        print(pos_l)
        if not "v" in pos_l:
            measures["error"] += 1
    
    return measures

def transcribe(audio_base64):
    try:
        endpoint_url = os.getenv('WHISPER_ENDPOINT')
        azureml_model_token = os.getenv('WHISPER_API_KEY')

        data =  {
            "input_data": {
                "audio": [audio_base64],
                "language": ["en"]
            },
        }

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {azureml_model_token}',  # You might need to manage authentication
            'azureml-model-deployment': 'openai-whisper-large-15'
        }
        response = requests.post(endpoint_url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            print("worked as expected")
            print(response.json()[0])
            text_data = response.json()[0]['text']
            return text_data
        else:
            print("error", response.status_code)
            return null
    except Exception as e:
        print(e)
        return null


if __name__ == "__main__":
    list = ["cat", "dog", "parrot", "dog", "tuna", "camel", "play"]
    list = [l.lower() for l in list]
    
    print(animal_task(list))