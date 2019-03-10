import os
import tushare as ts

start, end = '2016-01-01', '2019-03-08'

sz50 = ts.get_hist_data('sz50', start=start,end=end)
cyb = sz50 = ts.get_hist_data('cyb', start=start,end=end)

class Simulator(object):
    def __init__(self, day1, money=100000, stock=0, ma='ma10', threshold=0.01, force=0.02, fee=0.001):
        self.pre_ma = day1[ma]
        self.money = money
        self.stock = stock
        self.ma = ma
        self.threshold = threshold
        self.force = force
        self.fee = fee
        self.today = day1
        self.state = 0 # 0 - empty 1 - full
        
    def buy(self, price):
        print('{}: Buy at {}'.format(self.today.name, price))
        price = price * (1 + self.fee)
        self.stock = self.money // price
        self.money -= self.stock * price
        self.state = 1
        
    def sell(self, price):
        print('{}: Sell at {}'.format(self.today.name, price))
        self.money += price * (1 - self.fee) * self.stock
        self.stock = 0
        self.state = 0
    
    def process(self, day):
        self.today = day
        if self.state == 0:
            if (day['open'] >= self.pre_ma * (1 + self.force)):
                self.buy(day['open'])
            elif (day['high'] >= self.pre_ma * (1 + self.threshold)):
                self.buy(self.pre_ma * (1 + self.threshold))
        elif self.state == 1:
            if (day['open'] <= self.pre_ma * (1 - self.force)):
                self.sell(day['open'])
            elif (day['low'] <= self.pre_ma * (1 - self.threshold)):
                self.sell(self.pre_ma * (1 - self.threshold))
        self.pre_ma = day[self.ma]
    
    def get(self, today):
        return self.money + self.stock * today['close']

sz50_rev = sz50.iloc[-2::-1]
cyb_rev = cyb.iloc[-2::-1]

sz50_sim = Simulator(sz50.iloc[-1], ma='ma10', threshold=0.03, force=0.08)

for _, day in sz50_rev.iterrows():
    sz50_sim.process(day)

sz50_sim.get(sz50.iloc[0])
