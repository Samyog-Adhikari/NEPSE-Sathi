import httpx
from bs4 import BeautifulSoup
import sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml"
}

def test_sharesansar_news():
    url = "https://www.sharesansar.com/category/latest"
    r = httpx.get(url, headers=headers, timeout=15.0, follow_redirects=True)
    soup = BeautifulSoup(r.text, "html.parser")

    # Parse the featured-news-list divs
    articles = soup.find_all("div", class_="featured-news-list")
    print(f"Featured articles: {len(articles)}")
    for art in articles[:3]:
        title_tag = art.find("a")
        date_tag = art.find("span", class_="text-muted") or art.find("span")
        title = title_tag.get_text(strip=True) if title_tag else "N/A"
        href = title_tag.get("href", "") if title_tag else ""
        date = date_tag.get_text(strip=True) if date_tag else "N/A"
        print(f"  Title: {title[:100]}")
        print(f"  Link: {href}")
        print(f"  Date: {date}")
        print()
    
    # Also parse the media items (sidebar/older news)
    media_items = soup.find_all("div", class_="media")
    print(f"Media news items: {len(media_items)}")
    for m in media_items[:3]:
        a = m.find("a")
        if a:
            print(f"  -> {a.get_text(strip=True)[:100]} | {a.get('href','')[:80]}")

def test_merolagani_news():
    url = "https://merolagani.com/NewsList.aspx"
    r = httpx.get(url, headers=headers, timeout=15.0, follow_redirects=True)
    soup = BeautifulSoup(r.text, "html.parser")

    # Find news media blocks
    media = soup.find_all("div", class_="media")
    print(f"\nMerolagani media blocks: {len(media)}")
    for m in media[:5]:
        a = m.find("a")
        date_tag = m.find("span", class_="text-muted")
        if a:
            title = a.get_text(strip=True)
            href = a.get("href", "")
            date = date_tag.get_text(strip=True) if date_tag else ""
            print(f"  Title: {title[:100]}")
            print(f"  Link: {href}")
            print(f"  Date: {date}")
            print()

if __name__ == "__main__":
    test_sharesansar_news()
    test_merolagani_news()
