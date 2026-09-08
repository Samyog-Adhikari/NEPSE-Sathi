import httpx
from bs4 import BeautifulSoup
import re
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

def test_sharesansar():
    url = "https://www.sharesansar.com/existing-issues"
    r = httpx.get(url, headers=headers, follow_redirects=True, timeout=15.0)
    print(f"Sharesansar {url}: {r.status_code}")
    soup = BeautifulSoup(r.text, "html.parser")
    # check script tags for datatables ajax
    for script in soup.find_all("script"):
        text = script.string or ""
        if "ajax" in text or "table" in text:
            matches = re.findall(r"url\s*:\s*['\"]([^'\"]+)['\"]", text)
            if matches:
                print("Ajax endpoints:", matches)

def test_nepalipaisa():
    url = "https://nepalipaisa.com/ipo"
    r = httpx.get(url, headers=headers, follow_redirects=True, timeout=15.0)
    print(f"NepaliPaisa status: {r.status_code}")
    # find api calls in html
    apis = re.findall(r"['\"](/api/[^'\"]+)['\"]", r.text)
    print("Found APIs in HTML:", set(apis))

def test_sharesansar_ajax():
    headers_ajax = dict(headers)
    headers_ajax["X-Requested-With"] = "XMLHttpRequest"
    headers_ajax["Referer"] = "https://www.sharesansar.com/existing-issues"
    
    params = {
        "draw": 1,
        "start": 0,
        "length": 50,
        "search[value]": "",
        "search[regex]": "false",
        "type": 1
    }
    r_upcoming = httpx.get("https://www.sharesansar.com/upcoming-issue", params=params, headers=headers_ajax, timeout=15.0)
    print(f"Upcoming Status: {r_upcoming.status_code}")
    data_up = r_upcoming.json()
    print("Upcoming recordsTotal:", data_up.get("recordsTotal"))
    if data_up.get("data"):
        print("Upcoming Sample 0:", data_up["data"][0])


if __name__ == "__main__":
    test_sharesansar_ajax()









