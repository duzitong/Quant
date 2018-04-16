// ==UserScript==
// @name         stock
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  show current price of stock!
// @author       duzitong
// @include      http://*
// @include      https://*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const regex = /^(.+?)(<.*?)?(>.*?)?$/g;
    var stocks = new Map();
    stocks.set('sh000001', '上证指数<0>10000');
    stocks.set('sz399001', '深证成指<0');
    stocks.set('sz399006', '创业板指>10000');
    stocks.set('sz399300', '沪深300');
    stocks.set('sh510880', '红利ETF');
    stocks.set('sz159952', '创业ETF');
    stocks.set('sz159920', '恒生ETF');
    stocks.set('sh601318', '中国平安');

    var alerted = new Map();

    var current = '';

    function hide_stock() {
        document.getElementById("stock-popup").style.display = 'None';
        document.getElementById('lines').style.display = 'None';
        window.clearInterval(updater);
    }

    function create_container(e, type) {
        var container = document.createElement('div');
        if (type == "left") {
            container.setAttribute("style", "height: 30px; width: 80px; float: left;");
        } else if (type == "mid") {
            container.setAttribute("style", "height: 30px; width: 80px;  float: left;");
        } else {
            container.setAttribute("style", "height: 30px; width: 80px;  float: right;");
        }
        container.appendChild(e);
        return container;
    }

    function set_font(e) {
        e.setAttribute("style", "font-size:14px; text-align: center; vertical-align: middle; line-height: 30px; font-family: Arial, Helvetica, sans-serif;");
        return e;
    }

    function get_matched(value) {
        var match = regex.exec(value);
        if (match == null) {
            match = regex.exec(value);
        }
        return match;
    }

    function add_stock(value, key, map) {
        var stock = document.createElement ('div');
        stock.setAttribute("style", "height: 30px; width: 240px;");
        document.getElementById("stock-popup").appendChild(stock);
        var name = document.createElement('b');
        name.setAttribute("id", key);
        name.innerHTML = get_matched(value)[1];
        name.addEventListener('mouseover', function(e) {
            if (current != e.srcElement.id) {
                current = e.srcElement.id;
                document.getElementById('timeline').src = 'http://image.sinajs.cn/newchart/min/n/' + e.srcElement.id + '.gif';
                document.getElementById('lines').style.display = '';
                document.getElementById('status').style.display = '';
                update_stock('', key);
            }
        });
        name.addEventListener('mouseout', function(e) {
            document.getElementById('timeline').src = '';
            document.getElementById('lines').style.display = 'none';
            document.getElementById('status').style.display = 'none';
            current = '';
        });
        stock.appendChild(create_container(set_font(name), "left"));
        name.style.color = "white";
        var price = document.createElement('b');
        price.setAttribute("id", key + "-price");
        stock.appendChild(create_container(set_font(price), "mid"));
        var change = document.createElement('b');
        change.setAttribute("id", key + "-change");
        stock.appendChild(create_container(set_font(change), "right"));
    }

    function update_stock(value, key, map) {
        GM_xmlhttpRequest({
            method: 'get',
            url: 'http://hq.sinajs.cn/list=' + key,
            onload : function (response) {
                var resp = response.responseText;
                var price = resp.split(",")[3];
                document.getElementById(key + "-price").innerHTML = price;
                let name = get_matched(value)[1];
                let lowerPrice = get_matched(value)[2];
                let upperPrice = get_matched(value)[3];
                if (lowerPrice != null && Number(price) < Number(lowerPrice.substr(1)) && !alerted[key]) {
                    alert(name + '低于警示价！');
                    alerted[key] = true;
                }
                if (upperPrice != null && Number(price) > Number(upperPrice.substr(1)) && !alerted[key]) {
                    alert(name + '高于警示价！');
                    alerted[key] = true;
                }
                var change = (price - resp.split(",")[2]) / resp.split(",")[2];
                document.getElementById(key + "-change").innerHTML = Number(change*100).toFixed(2) + '%';
                if (change > 0) {
                    document.getElementById(key + "-price").style.color = "red";
                    document.getElementById(key + "-change").style.color = "red";
                } else if (change == 0) {
                    document.getElementById(key + "-price").style.color = "white";
                    document.getElementById(key + "-change").style.color = "white";
                } else {
                    document.getElementById(key + "-price").style.color = "green";
                    document.getElementById(key + "-change").style.color = "green";
                }
                var i = 0;

                if (current == key) {
                    for (i = 1; i <=5; i++) {
                        document.getElementById('buy'+i+'a').innerHTML=(resp.split(',')[8+2*i]/100).toFixed(0);
                        document.getElementById('buy'+i+'p').innerHTML=resp.split(',')[9+2*i];
                        document.getElementById('sell'+i+'a').innerHTML=(resp.split(',')[18+2*i]/100).toFixed(0);
                        document.getElementById('sell'+i+'p').innerHTML=resp.split(',')[19+2*i];
                    }
                }
            }
        });
    }

    function update() {
        stocks.forEach(update_stock);
    }

    var stockPopup = document.createElement ('div');
    stockPopup.setAttribute('style', 'position: fixed; top: 0px; right: 5px; width: 240px; z-index: 100000; background-color: rgba(0,0,0,0.8); overflow: visible; height: 0px;');
    stockPopup.setAttribute('id', 'stock-popup');

    var lines = document.createElement('div');
    lines.setAttribute('style', 'position: fixed; top: 0px; right: 245px; width: 600px; z-index: 100000; background-color: white; overflow: visible; height: auto; display: none;');
    lines.setAttribute('id', 'lines');
    lines.innerHTML = '<img src="" id="timeline" style="width: 600px;">';

    var status = document.createElement('div');
    status.setAttribute('style', 'position: fixed; top: 0px; right: 5px; width: 240px; z-index: 100000; background-color: rgba(0,0,0,0.8); overflow: visible; display: none;');
    status.setAttribute('id', 'status');
    status.innerHTML = "<table border='0' bgcolor: 'black' rules=none frame=void> \
<tr><td width='40px' class='red'><b>买1</b></td><td width='40px' class='red' id='buy1p'></td><td width='40px' class='red' id='buy1a'></td><td width='40px' class='green'><b>卖1</b></td><td width='40px' class='green' id='sell1p'</td><td width='40px' class='green' id='sell1a'></td></tr> \
<tr><td width='40px' class='red'><b>买2</b></td><td width='40px' class='red' id='buy2p'></td><td width='40px' class='red' id='buy2a'></td><td width='40px' class='green'><b>卖2</b></td><td width='40px' class='green' id='sell2p'</td><td width='40px' class='green' id='sell2a'></td></tr> \
<tr><td width='40px' class='red'><b>买3</b></td><td width='40px' class='red' id='buy3p'></td><td width='40px' class='red' id='buy3a'></td><td width='40px' class='green'><b>卖3</b></td><td width='40px' class='green' id='sell3p'</td><td width='40px' class='green' id='sell3a'></td></tr> \
<tr><td width='40px' class='red'><b>买4</b></td><td width='40px' class='red' id='buy4p'></td><td width='40px' class='red' id='buy4a'></td><td width='40px' class='green'><b>卖4</b></td><td width='40px' class='green' id='sell4p'</td><td width='40px' class='green' id='sell4a'></td></tr> \
<tr><td width='40px' class='red'><b>买5</b></td><td width='40px' class='red' id='buy5p'></td><td width='40px' class='red' id='buy5a'></td><td width='40px' class='green'><b>卖5</b></td><td width='40px' class='green' id='sell5p'</td><td width='40px' class='green' id='sell5a'></td></tr> \
</table>";

    document.body.appendChild (stockPopup);
    document.body.appendChild (lines);
    document.body.appendChild (status);
    GM_addStyle('td.red {height=30px; border: 0px; font-size:14px; text-align: center; vertical-align: middle; line-height: 30px; font-family: Arial, Helvetica, sans-serif; color: red;} \
td.green {height=30px; border: 0px; font-size:14px; text-align: center; vertical-align: middle; line-height: 30px; font-family: Arial, Helvetica, sans-serif; color: green;}');
    stockPopup.style.height = 30 * stocks.size + 'px';
    status.style.top = stockPopup.style.height;
    stocks.forEach(add_stock);
    stocks.forEach(update_stock);
    var updater = window.setInterval(update,1000);
    window.onfocus = function() {
        if (updater == null) {
            updater = window.setInterval(update,1000);
        }
    };
    window.onblur = function() {
        window.clearInterval(updater);
        updater = null;
    };

    dragElement(document.getElementById(("stock-popup")));

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, sPosX, sPosY;
        if (document.getElementById(elmnt.id + "header")) {
            /* if present, the header is where you move the DIV from:*/
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            /* otherwise, move the DIV from anywhere inside the DIV:*/
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e.preventDefault();
            e = e || window.event;
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            sPosX = pos3;
            sPosY = pos4;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement(e) {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
            e = e || window.event;
            if (Math.abs(sPosX - e.clientX) < 0.01 && Math.abs(sPosY - e.clientY) < 0.01) {
                hide_stock();
            }
        }
    }
})();
