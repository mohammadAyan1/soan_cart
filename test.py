import pandas as pd
import requests
from io import StringIO


def create_grid(data):    
    max_x = 0
    max_y = 0
    
    for item in data:
        x = item["x"]
        y = item["y"]
        
        print(x,"X")
        print(y,"Y")
        
        if x > max_x:
            max_x = x
            print(max_y,"MAX_B")
            
        if y > max_y:
            max_y = y
            print(max_y,"MAX_Y")
            
    print("max_x =", max_x)
    print("max_y =", max_y)
    
    grid = []
    
    for y in range(max_y + 1):
        row = []
        
        print(row)
        
        for x in range(max_x + 1):
            row.append(" ")
            print(row)
            
        grid.append(row)
        
        print(grid)
    for item in data:
        character = item["character"]
        x = item["x"]
        y = item["y"]
        
        grid[y][x] = character
        
        print(x)
        print(y)
        print(character)
        print(grid)
    for row in grid:
        print("".join(row))

url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"

response = requests.get(url)

html = response.content.decode("utf-8")

tables = pd.read_html(StringIO(html))

df = tables[0]

df.columns = df.iloc[0]

df = df.iloc[1:].reset_index(drop=True)

print(df)

data = []

for _, row in df.iterrows():

    item = {
        "character": row["Character"],
        "x": int(row["x-coordinate"]),
        "y": int(row["y-coordinate"])
    }

    data.append(item)


print(data[:10])

create_grid(data)