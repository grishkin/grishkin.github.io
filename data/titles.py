import pandas as pd
import json

df = pd.read_csv('./movies_metadata.csv')

column_list = df.iloc[:, 19].dropna().tolist()
# column_list.to_csv('movie_titles.csv', index=False)
# print(column_list)

# with open('movie_titles.txt', 'w') as f:
#     for item in column_list:
#         f.write(f"{item}\n")

with open('output.json', 'w') as f:
    json.dump(column_list, f)