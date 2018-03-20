// ==UserScript==
// @name         stock
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  show current price of stock!
// @author       duzitong
// @include      http://*
// @include      https://*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var stocks = new Map();
    stocks.set('159952', '创业ETF');
    stocks.set('159920', '恒生ETF');

    function hide_stock() {
        document.getElementById("stock-popup").style.display = 'None';
    }

    function addStock(value, key, map) {
        var stock = document.createElement ('div');
        stock.setAttribute("id", key);
        stock.setAttribute("style", "height: 30px; width: 200px;");
        document.getElementById("stock-popup").appendChild(stock);
        var name = document.createElement ('b');
        name.innerHTML = value;
        name.setAttribute("style", "color: white");
        stock.appendChild(name);
    }

    var stockPopup = document.createElement ('div');
    var style = 'position: fixed; top: 0px; right: 5px; width: 200px; z-index: 100000; background-color: rgba(0, 153, 204, 0.7); overflow: visible; height: 0px;';
    stockPopup.innerHTML   = '<div id="stock-popup" style="' + style + '" > \
    </div>';

    document.body.appendChild (stockPopup);
    document.getElementById("stock-popup").style.height = 30 * stocks.size + 'px';
    stocks.forEach(addStock);

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
