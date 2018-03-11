
# coding: utf-8

# In[51]:

import tushare
import pandas as pd
import numpy as np


# In[52]:

hs300 = pd.read_csv('399300.csv', encoding="gb2312")
cy = pd.read_csv('399006.csv', encoding="gb2312")


# In[53]:

def get_avg_and_std(series):
    return series.sum()/len(series), series.std()


# In[137]:

hc, cc = hs300['收盘价'][:1889], cy['收盘价']


# In[124]:

ha, hs = get_avg_and_std(hc)


# In[125]:

ca, cs = get_avg_and_std(cc)


# In[126]:

h, c = (hs/ha), (cs/ca)
h, c


# In[148]:

def search(sa, sb, begin, end):
    if end <= begin or end < 0.00001:
        return begin
    mid = (begin + end) / 2
    a1, s1 = get_avg_and_std(sa)
    a2, s2 = get_avg_and_std(sb)
    if s1/a1 < s2/a2:
        return search(sa, sa * (1-mid) + sb * mid, begin, mid)
    else:
        return search(sa * (1-mid) + sb * mid, sb, mid, end)
    


# In[155]:

for i in range(50, 1850, 50):
    print(i, search(hc[:i], cc[:i], 0, 1))


# In[156]:

best, sli = 0.5, 50
a, b = get_avg_and_std(hc[:sli] * (1-best) + cc[:sli] * best)
b/a


# In[157]:

13300*best / (1-best)


# In[ ]:



