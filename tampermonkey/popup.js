// ==UserScript==
// @name         stock
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  show current price of stock!
// @author       duzitong
// @include      http://*
// @include      https://*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var stocks = new Map();
    stocks.set('sz159952', '创业ETF');
    stocks.set('sz159920', '恒生ETF');
    stocks.set('sh601318', '中国平安');

    function hide_stock() {
        document.getElementById("stock-popup").style.display = 'None';
        window.clearInterval(updater);
    }

    function create_container(e, type) {
        var container = document.createElement('div');
        if (type == "left") {
            container.setAttribute("style", "height: 30px; width: 70px; float: left;");
        } else if (type == "mid") {
            container.setAttribute("style", "height: 30px; width: 70px;  float: left;");
        } else {
            container.setAttribute("style", "height: 30px; width: 70px;  float: right;");
        }
        container.appendChild(e);
        return container;
    }

    function set_font(e) {
        e.setAttribute("style", "font-size:14px; vertical-align: middle; line-height: 30px;");
        return e;
    }

    function add_stock(value, key, map) {
        var stock = document.createElement ('div');
        stock.setAttribute("id", key);
        stock.setAttribute("style", "height: 30px; width: 210px;");
        document.getElementById("stock-popup").appendChild(stock);
        var name = document.createElement('b');
        name.innerHTML = value;
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
            }
        });
    }

    var stockPopup = document.createElement ('div');
    var style = 'position: fixed; top: 0px; right: 5px; width: 210px; z-index: 100000; background-color: rgba(0,0,0,0.8); overflow: visible; height: 0px;';
    stockPopup.innerHTML   = '<div id="stock-popup" style="' + style + '" > \
</div>';

    document.body.appendChild (stockPopup);
    document.getElementById("stock-popup").style.height = 30 * stocks.size + 'px';
    stocks.forEach(add_stock);
    stocks.forEach(update_stock);
    var updater = window.setInterval(function(){stocks.forEach(update_stock);},1000);
    window.onfocus = function() {
        console.log('focus');
        if (updater == null) {
            updater = window.setInterval(function(){stocks.forEach(update_stock);},1000);
        }
    };
    window.onblur = function() {
        console.log('blur');
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
