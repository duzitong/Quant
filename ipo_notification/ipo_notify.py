
# coding: utf-8

import requests
from bs4 import BeautifulSoup
import datetime
import traceback
from tabulate import tabulate
from email import encoders
from email.header import Header
from email.mime.text import MIMEText
from email.utils import parseaddr, formataddr
import smtplib
import json

resp = requests.get('http://vip.stock.finance.sina.com.cn/corp/go.php/vRPD_NewStockIssue/page/1.phtml')
resp.encoding = 'gb18030' 
soup = BeautifulSoup(resp.text, 'lxml')

stocks = [['证券代码', '申购代码', '证券简称', '上网发行日期', '上市日期', 
          '发行数量(万股)', '上网发行数量(万股)', '发行价格(元)', '市盈率']]

for line in soup.find(id='NewStockTable').find_all('tr')[3:]:
    try:
        info = [td.get_text().strip() for td in line.find_all('td')]
        ipo_date = info[3]
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
        if ipo_date == tomorrow:
            stocks.append(info[:-6])
        elif ipo_date < tomorrow:
            break
    except:
        traceback.print_exc()
        continue

with open('smtp.json') as f:
    config = json.load(f)

msg = MIMEText(tabulate(stocks), 'plain', 'utf-8')
msg['From'] = config['from']
msg['To'] = ','.join(config['to'])
msg['Subject'] = Header(u'明日新股', 'utf-8').encode()

server = smtplib.SMTP_SSL(config['server'], 465)
server.set_debuglevel(1)
server.login(config['from'], config['password'])
server.sendmail(from_addr, config['to'], msg.as_string())
server.quit()
