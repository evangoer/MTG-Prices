YUI.add("mtg-prices", function(Y) {
 
    Y.namespace("MTG");
    
    Y.MTG.YQLSync = function(){};
    Y.MTG.YQLSync.prototype = {
        query: function() {
            return "SELECT * FROM html WHERE url='" + this.get("url") 
                + "' AND xpath='" + this.get("xpath") + "'";
        }
    }
    
    // TODO: factor out common logic between SetNames and Set
    Y.MTG.SetNames = Y.Base.create('setNames', Y.Model, [Y.MTG.YQLSync], {
        
        sync: function(action, options, callback) {
            var sn = this, cache, setNames = {};
            if (action != "read") {
                return callback("Invalid Action");
            }
            
            cache = localStorage.getItem(this.get("id"));
            if (cache) {
                Y.log("Data for " + this.get("id") + " was cached locally.");
                setNames = (Y.JSON.parse(cache)).setNames;
                this.set("setNames", setNames);
                return callback(null, setNames);
            }
            
            Y.YQL(this.query(), function(r) {
                var i, name;
                var results = r.query.results.a;
                
                Y.log("Fetching data from YQL for " + sn.get("id") + "...");
                for (var i=0; i < results.length; i++) {
                    name = results[i].content;
                    if (typeof name === "string") {
                        name = name.replace(/\s+/g, " ");
                        // inelegant. possibly should just be an array?
                        // do we care about iterating through setNames sequentially? or doing lookups?
                        setNames[name] = name;
                    }
                }
                
                sn.set("setNames", setNames);
                localStorage.setItem(sn.get("id"), Y.JSON.stringify(sn.toJSON()));
                return callback(r.error, setNames);
            });
        }
    }, {
        ATTRS: {
            id: { value: "SET_NAMES" },
            setNames: {},
            url: { value: "http://magic.tcgplayer.com/magic_price_guides.asp" },
            xpath: { value: "//table/tr/td/table[2]/tr/td[2]/table//a" }
        }
    });
    
    Y.MTG.Set = Y.Base.create('set', Y.Model, [Y.MTG.YQLSync], {
        
        sync: function(action, options, callback) {
            var cardSet = this, cache, cards = {};
            if (action !== "read") {
                return callback("Invalid Action");
            }

            cache = localStorage.getItem(this.get("id"));
            if (cache) {
                Y.log("Data for " + this.get("id") + " was cached locally.");
                cards = (Y.JSON.parse(cache)).cards;
                this.set("cards", cards);
                return callback(null, cards);
            }
            
            Y.YQL(this.query(), function(r) {
                var i, name, price;
                var results = r.query.results.font;
                
                Y.log("Fetching data from YQL for " + cardSet.get("id") + "...");
                for (i = 0; i < results.length; i += 2) {
                    name = results[i].content;
                    price = results[i+1].content.replace("$", "") - 0;
                    cards[name] = { "price": price };
                }
                
                cardSet.set("cards", cards);
                localStorage.setItem(cardSet.get("id"), Y.JSON.stringify(cardSet.toJSON()));
                return callback(r.error, cards);
            });
        },
        
    }, {
        ATTRS: {
            cards: {},
            url: {
                getter: function() {
                    return "http://magic.tcgplayer.com/db/price_guide.asp?setname=" + this.getAsURL("id");
                }
            },
            xpath: { value: "//table[2]/tr/td[position()=1 or position()=7]/font" }
        }
    });
    
}, "0.1", { requires: ["json", "yql", "app"] });