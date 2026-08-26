import json

with open("all_extracted_elements.json", "r", encoding="utf-8") as f:
    elements = json.load(f)

print(f"Total elements: {len(elements)}")
for k in sorted(elements.keys()):
    el = elements[k]
    text = el.get("A", "")
    bg = el.get("E", {})
    color = el.get("F", {})
    font_size = el.get("K", "")
    print(f"{k:30} | text: {str(text):40} | bg: {str(bg):25} | color: {str(color):25} | size: {font_size}")
