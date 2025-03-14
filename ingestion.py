import json
import os

from dotenv import load_dotenv
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


with open("articles.json", "r", encoding="utf-8") as file:
    json_data = json.load(file)

documents_json = []

for item in json_data:

    def get_value(key):
        return item.get(key, "")

    page_content = f"""
    Title: {get_value('title')}
    Content: {get_value('content')}
    Url: {get_value('url')}
    Date: {get_value('date')}
    """

    metadata = {
        "title": get_value("title"),
        "url": get_value("url"),
        "date": get_value("date"),
    }

    document = Document(page_content=page_content, metadata=metadata)
    documents_json.append(document)

print(len(documents_json))


vector_store = QdrantVectorStore.from_documents(
    url=QDRANT_URL,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=OpenAIEmbeddings(model="text-embedding-ada-002"),
    documents=documents_json,
    timeout=600,
    api_key=QDRANT_API_KEY,
)
