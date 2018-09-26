//get jquery and needed jsdom modules
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

//includes XMLHTTPREQUEST module
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const req = new XMLHttpRequest();

//get the html doc of Historical Snapshots
req.open('GET', 'https://coinmarketcap.com/historical/', false);
req.send(null);
var hsResponseText;

//check if request worked and save the answer
if (req.status === 200) {
    var hsResponseText = req.responseText;
} else {
    console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
}

//make an array of the sundays available
var sundays = [];
var sundaysLink = [];
$('<div/>').html(hsResponseText).find('.col-sm-4').each(function(){
    $(this).find('.list-unstyled').each(function(){
        $(this).find('.text-center').each(function(){
            let date = $(this).children().attr('href');
            sundaysLink.push("https://coinmarketcap.com" + date);
            sundays.push(date.substring(12, date.length-1));
    })})});

//get the list of coins (for developing sake)
var coins = ['ethereum', 'ripple', 'bitcoin-cash', 'eos', 'stellar']

//creation of object containing name, price and date data
var obj = [];
coins.forEach(function(element){
    obj.push({
    name : element,
    price : [],
    date : [],
    isAlive : true,
})})

//implement global is alive check to exit data recuperation loop
function checker(){
    let isItAlive = [];
    //iterate through object keys
    Object.keys(obj).forEach(function(key) {
        //get the value of name
        let val = obj[key]['isAlive'];
        //push the name string in the array
        isItAlive.push(val);
    })
    //check if all array variables are set to true and return result
    return((isItAlive.every(a => a === true)))
};

//get last date to know to which point data will be weighted
var sourceDate;

//for each sundays starting now towards 2013 (until a coin has no data, then break)
    for(var i = sundays.length - 1; i >= 0; i--){
        if (checker() === true){
            req.open('GET', sundaysLink[i], false);
            req.send(null);
            if (req.status === 200) {
            let coinMacroLocation = $('<div/>').html(req.responseText).find("#currencies-all > tbody");

            //for each coin for a working link (until a coin has no data, then break)
             for (var l = 0, m = coins.length; l < m; l++){
                //start constructing array of prices
                let data = $('<div/>').html(coinMacroLocation).find('#id-' + coins[l]+ ' > td:nth-child(5) > a').data("usd");;

                    if (data === undefined) {
                        sourceDate = sundays[i];
                        obj[l]['isAlive'] = false;
                        break;
                    }
                    else {
                        obj[l]['price'].push(data);
                        console.log(l, i)
                    }
                }
            } else {
                console.log("data missing, status != 200");
            }
        }
        else {
        break;
        }
    }
