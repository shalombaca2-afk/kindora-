import json
import re
import urllib.request

with open("canva_page.html", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

print("File size:", len(content))

# Extract title & og tags
titles = re.findall(r"<title>(.*?)</title>", content)
print("Titles:", titles)
og_titles = re.findall(r'<meta property="og:title" content="(.*?)"', content)
og_desc = re.findall(r'<meta property="og:description" content="(.*?)"', content)
print("OG Title:", og_titles)
print("OG Desc:", og_desc)

# Find bootstrap
bootstrap_match = re.search(r"window\['bootstrap'\]\s*=\s*JSON\.parse\('(.*?)'\);", content)
if bootstrap_match:
    raw_str = bootstrap_match.group(1)
    # decode javascript string escapes
    # Replace \x22 with ", \\ with \, etc.
    try:
        # standard unescape
        import codecs
        decoded = codecs.decode(raw_str, 'unicode_escape')
        data = json.loads(decoded)
        with open("bootstrap.json", "w", encoding="utf-8") as bf:
            json.dump(data, bf, indent=2, ensure_ascii=False)
        print("Successfully extracted bootstrap.json!")
    except Exception as e:
        print("Bootstrap parse error:", e)

# Also check for codelet embed URL
embed_urls = re.findall(r'https?://canva-hosted-embed\.com/codelet/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+', content)
print("Found embed URLs:", embed_urls)
for url in embed_urls:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            embed_content = resp.read().decode("utf-8")
            print(f"Downloaded embed {url} ({len(embed_content)} bytes)")
            with open("embed_page.html", "w", encoding="utf-8") as ef:
                ef.write(embed_content)
    except Exception as e:
        print("Error fetching embed:", e)
