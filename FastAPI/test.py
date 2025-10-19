from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv()
API_TOKEN = os.getenv("API_TOKEN")

#CORS (クロスオリジン制約) 
#VSCode Live Server から FastAPI にアクセスするのを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # すべてのオリジンを許可
    #本番で公開するときは自分のサイトだけ許可する
    allow_credentials=True,
    allow_methods=["*"], # すべてのHTTPメソッドを許可
    allow_headers=["*"], # すべてのヘッダーを許可
)

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/weather")
def get_weather(lat: float, lon: float):
    response = requests.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={
            "lat": lat,
            "lon": lon,
            "appid": API_TOKEN,
            "units": "metric",
            "lang": "ja",
        },
    )

    return response.json() 

# http://127.0.0.1:8000/docs
# uvicorn test:app --reload