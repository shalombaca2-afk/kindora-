import json

with open("bootstrap.json", "r", encoding="utf-8") as f:
    data = json.load(f)

def clean_text(s):
    if not isinstance(s, str):
        return s
    try:
        return s.encode("latin1").decode("utf-8")
    except:
        return s

def extract_nodes(obj, path=""):
    results = {}
    if isinstance(obj, dict):
        # Look for dictionary with named element keys (e.g. app-brand, nav-home, etc.)
        for k, v in obj.items():
            if isinstance(v, dict):
                # if v has "A?" or similar
                node_data = {}
                for subk, subv in v.items():
                    if isinstance(subv, dict) and "A" in subv:
                        node_data[subk] = subv["A"]
                if node_data:
                    # check if it has text or styles
                    results[k] = node_data
            results.update(extract_nodes(v, f"{path}/{k}"))
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            results.update(extract_nodes(item, f"{path}[{idx}]"))
    return results

# Let's inspect the exact tree
raw_elements = data.get("page", {}).get("A", {}).get("d", {}).get("E", [])
print(f"Page elements count: {len(raw_elements)}")

# Let's search inside data
all_nodes = {}
def deep_scan(o, prefix=""):
    if isinstance(o, dict):
        if "A" in o and isinstance(o["A"], dict):
            # check if keys look like element IDs
            keys = list(o["A"].keys())
            if any("-" in str(k) or "btn" in str(k) or "card" in str(k) or "title" in str(k) or "text" in str(k) for k in keys):
                for el_id, el_val in o["A"].items():
                    all_nodes[el_id] = el_val
        for k, v in o.items():
            deep_scan(v, f"{prefix}.{k}")
    elif isinstance(o, list):
        for idx, item in enumerate(o):
            deep_scan(item, f"{prefix}[{idx}]")

deep_scan(data)
print(f"Total element definitions found: {len(all_nodes)}")

parsed_elements = {}
for k, v in all_nodes.items():
    entry = {"id": k}
    if isinstance(v, dict) and "A" in v and isinstance(v["A"], dict):
        prop_dict = v["A"]
        # extract properties
        # In Canva codelet JSON:
        # A: text content or value
        # C: color / background
        # F: text color
        # G: font weight
        # H: font style
        # K: font size
        # E: background color
        for p_key, p_val in prop_dict.items():
            if isinstance(p_val, dict) and "A" in p_val:
                val = p_val["A"]
                if isinstance(val, str):
                    val = clean_text(val)
                entry[p_key] = val
            elif isinstance(p_val, dict) and "A?" in p_val:
                entry[p_key] = p_val.get("A")
            else:
                entry[p_key] = p_val
    parsed_elements[k] = entry

with open("all_extracted_elements.json", "w", encoding="utf-8") as f:
    json.dump(parsed_elements, f, indent=2, ensure_ascii=False)

print("Saved all_extracted_elements.json!")
for k, v in sorted(parsed_elements.items()):
    print(f"Element: {k}")
    for pk, pv in v.items():
        if pk != "id":
            print(f"   {pk}: {pv}")
