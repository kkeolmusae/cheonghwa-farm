import os
import re
import time
import requests
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


BASE_URL = "https://story.kakao.com/_aYux23"
OUTPUT_DIR = "output"
SCROLL_PAUSE = 2


def init_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )
    return driver


def manual_login(driver):
    driver.get("https://accounts.kakao.com/login")
    print("👉 로그인 후 Enter")
    input()


def scroll_down(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE)

        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def parse_posts(driver):
    # 게시물: div.section._activity (data-model="userId.postId")
    posts = driver.find_elements(By.CSS_SELECTOR, "._activity")
    results = []

    for post in posts:
        try:
            # 작성자: .pf_name
            author = ""
            try:
                author = post.find_element(By.CSS_SELECTOR, ".pf_name").text.strip()
            except Exception:
                pass

            # 내용(텍스트): ._content — innerHTML에서 <br>을 줄바꿈(\n)으로 수집
            text = ""
            try:
                content_el = post.find_element(By.CSS_SELECTOR, "._content")
                html = content_el.get_attribute("innerHTML") or ""
                if html:
                    # <br> / <br/> / <br /> → 줄바꿈으로 보존
                    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
                    text = re.sub(r"<[^>]+>", "", text)
                    text = text.replace("&nbsp;", " ")
                if not (text or "").strip():
                    text = content_el.text.strip() or ""
                text = (text or "").strip()
            except Exception:
                text = ""

            # 날짜: a.time._linkPost (또는 title 속성)
            date = "unknown_date"
            try:
                date_el = post.find_element(By.CSS_SELECTOR, "a.time._linkPost")
                date = date_el.get_attribute("title") or date_el.text.strip()
            except Exception:
                pass

            # 이미지: .list_swipe._container → a[data-url] 우선(고해상도), 없으면 img src
            images = []
            try:
                container = post.find_element(By.CSS_SELECTOR, ".list_swipe._container")
                # 고해상도 URL (a.link_swipe._btnMediaView 의 data-url)
                for a in container.find_elements(By.CSS_SELECTOR, "a._btnMediaView[data-url]"):
                    url = a.get_attribute("data-url")
                    if url and ("kakaocdn" in url or "dn.kakao" in url):
                        images.append(url)
                # data-url 없으면 img src 사용
                if not images:
                    for img in container.find_elements(By.TAG_NAME, "img"):
                        src = img.get_attribute("src")
                        if src and ("kakaocdn" in src or "dn.kakao" in src):
                            images.append(src)
            except Exception:
                pass

            # 게시물 ID (중복 제거용): data-model
            post_id = post.get_attribute("data-model") or ""

            results.append({
                "date": date,
                "text": text,
                "images": images,
                "author": author,
                "post_id": post_id,
            })

        except Exception as e:
            print("parse error:", e)

    return results


def sanitize_date(date_str):
    return date_str.replace(".", "-").replace(" ", "")


def download_image(url, save_path):
    try:
        res = requests.get(url)
        if res.status_code == 200:
            with open(save_path, "wb") as f:
                f.write(res.content)
    except Exception as e:
        print("image download error:", e)


def save_post(post):
    date = sanitize_date(post["date"])
    dir_path = os.path.join(OUTPUT_DIR, date)
    os.makedirs(dir_path, exist_ok=True)

    md_path = os.path.join(dir_path, "README.md")

    image_md = ""
    for idx, img_url in enumerate(post["images"]):
        ext = os.path.splitext(urlparse(img_url).path)[-1] or ".jpg"
        img_name = f"img_{idx}{ext}"
        img_path = os.path.join(dir_path, img_name)

        download_image(img_url, img_path)
        image_md += f"![{img_name}]({img_name})\n"

    author_line = f"\n**{post['author']}**\n\n" if post.get("author") else ""
    content = f"""# {post["date"]}
{author_line}{post["text"]}

{image_md}
"""

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    driver = init_driver()

    driver.get(BASE_URL)
    time.sleep(3)

    scroll_down(driver)

    posts = parse_posts(driver)

    print(f"총 {len(posts)}개 게시물 수집")

    for post in posts:
        save_post(post)

    driver.quit()


if __name__ == "__main__":
    main()
