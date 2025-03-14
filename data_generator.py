import json
import re
from docling.document_converter import DocumentConverter

articles = [
    ("BBC", "https://www.bbc.com/news/articles/cy4m84d2xz2o"),
    ("BBC", "https://www.bbc.com/news/articles/clyxypryrnko"),
    (
        "Gavi",
        "https://www.gavi.org/vaccineswork/cameroons-historic-malaria-vaccine-introduction-shows-signs-success-one-year",
    ),
    (
        "CNN",
        "https://edition.cnn.com/2025/01/20/politics/analysis-trump-inaugural-speech-great-power/index.html",
    ),
    ("Wikipedia", "https://en.wikipedia.org/wiki/2025_California_wildfires"),
    (
        "CNN",
        "https://edition.cnn.com/2025/01/24/business/trump-mass-deportations-los-angeles-fires/index.html",
    ),
    (
        "CNN",
        "https://edition.cnn.com/2025/01/23/business/unitedhealthcare-new-ceo/index.html",
    ),
    (
        "The Guardian",
        "https://www.theguardian.com/world/2025/jan/24/portuguese-politician-miguel-arruda-accused-of-stealing-suitcases-at-airports",
    ),
    (
        "Financial Times",
        "https://www.ft.com/content/5c57d37a-23f3-453b-b4c5-96a6d647ce1e",
    ),
    ("BBC", "https://www.bbc.com/news/articles/c878ryr04p8o"),
    (
        "DW",
        "https://www.dw.com/en/indonesia-officially-becomes-full-member-of-brics-bloc/a-71233628",
    ),
    (
        "Al Jazeera",
        "https://www.aljazeera.com/news/2025/1/7/earthquake-hits-tibets-shigatse-what-we-know-so-far",
    ),
    (
        "Economic Times",
        "https://economictimes.indiatimes.com/news/international/us/thailand-becomes-first-southeast-asian-country-to-legalize-same-sex-marriage-historic-step-for-lgbtq-rights/articleshow/117495194.cms",
    ),
    ("TechCrunch", "https://techcrunch.com/2024/12/20/openai-announces-new-o3-model/"),
    (
        "CNN",
        "https://edition.cnn.com/2024/07/22/us/microsoft-power-outage-crowdstrike-it/index.html",
    ),
    (
        "ABC News",
        "https://abcnews.go.com/International/astronomers-discover-repeating-radio-bursts-distant-dead-galaxy/story?id=118023080",
    ),
    (
        "ABC News",
        "https://abcnews.go.com/538/make-trumps-attempt-end-birthright-citizenship/story?id=118023941",
    ),
    (
        "Reuters",
        "https://www.reuters.com/technology/meta-invest-up-65-bln-capital-expenditure-this-year-2025-01-24/",
    ),
    (
        "Reuters",
        "https://www.reuters.com/technology/bytedance-plans-20-billion-capex-2025-mostly-ai-sources-say-2025-01-23/",
    ),
    ("CNN", "https://edition.cnn.com/2025/01/19/tech/tiktok-ban/index.html"),
    (
        "Channel Insider",
        "https://www.channelinsider.com/news-and-trends/us/new-snowflake-data-breach-exposes-millions-of-customers/",
    ),
    (
        "NY Post",
        "https://nypost.com/2024/08/11/sports/the-posts-10-best-moments-of-the-2024-paris-olympics",
    ),
]

converter = DocumentConverter()
data = []


def clean_text(text):
    return text.replace('"', "'")


def extract_date(url):
    match = re.search(r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})", url)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return "Unknown"


for source, url in articles:
    try:
        result = converter.convert(url)
        article_text = result.document.export_to_markdown()

        article_text_cleaned = clean_text(article_text)

        lines = article_text_cleaned.split("\n")
        title = lines[0].strip("# ") if lines else "Untitled"

        date = extract_date(url)

        data.append(
            {
                "title": title,
                "content": "\n".join(lines[1:]).strip(),
                "url": url,
                "date": date,
            }
        )
        print(f"✅ Success: {url}")
    except Exception as e:
        print(f"❌ Error processing {url}: {e}")

with open("articles.json", "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("Processing completed. Articles saved in 'articles.json'.")
