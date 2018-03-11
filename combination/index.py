
# coding: utf-8

# In[4]:

import pandas as pd
import numpy as np


# In[5]:

hs300 = pd.read_csv('399300.csv', encoding="gb2312")
cy = pd.read_csv('399006.csv', encoding="gb2312")


# In[65]:

def get_avg_and_std(series):
    return np.average(series), series.std()


# In[7]:

hc, cc = hs300['收盘价'][:1889], cy['收盘价']


# In[8]:

ha, hs = get_avg_and_std(hc)


# In[9]:

ca, cs = get_avg_and_std(cc)


# In[10]:

h, c = (hs/ha), (cs/ca)
h, c


# In[66]:

def search(begin, end, sli):
    if abs(end-begin)<=0.01:
        a,s = get_avg_and_std(hc[:sli] * begin + cc[:sli] * (1-begin))
        return a, s, begin, end
    mid = (begin + end) / 2
    a1, s1, b1, e1 = search(begin, mid, sli)
    a2, s2, b2, e2 = search(mid, end, sli)
    if s1/a1 < s2/a2:
        return a1, s1, b1, e1
    else:
        return a2, s2, b2, e2
    


# In[86]:

bests = []
for i in range(50, 801, 50):
    _,_,_, end = search(0, 1, i)
    bests.append(end)


# In[87]:

hac = [b*2 for b in bests]
cac = [1-b for b in bests]


# In[88]:

print(np.average(hac) / (np.average(hac)+np.average(cac)))


# In[ ]:



