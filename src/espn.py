import requests
from bs4 import BeautifulSoup
import json

url = 'https://www.espn.com/nfl/fpi'

headers = requests.utils.default_headers()
headers.update({
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0',
})

espn = requests.get(url, headers=headers)

espnSoup = BeautifulSoup(espn.content, "html.parser")

tbodies = espnSoup.find_all("tbody", {"class": "Table__TBODY"})
teams = []

for row in tbodies[0]:
    print('row', row)
    texts = row.find_all('span', {'class': 'TeamLink__Name'})
    for name in texts:
        teams.append(name.text)

rankings = []

for row in tbodies[1]:
    columns = row.find_all('td', {'class': 'Table__TD'})
    rankings.append(columns[1].text)

done = []
for idx, team in enumerate(teams):
    obj = {}
    obj['name'] = team
    obj['rankings'] = rankings[idx] 
    done.append(obj)

doneJson = json.dumps(done, indent=4)
with open("../csv/espn.json", "w") as outfile:
    outfile.write(doneJson)