YUI.add("mtg-prices", function(Y) {
 
    Y.namespace("MTG");
    
    // TODO: factor out common logic between SetNames and Set
    // query should probably not be an attribute
    // - but xpath and url probably should be
    // - turn query() into a common method that uses xpath and url
    Y.MTG.SetNames = Y.Base.create('setNames', Y.Model, [], {
        
        sync: function(action, options, callback) {
            var sn = this, cache, setNames = {};
            if (action != "read") {
                return callback("Invalid Action");
            }
            
            cache = localStorage.getItem(this.get("setNames"));
            if (cache) {
                Y.log("Set names were cached locally.");
                setNames = (Y.JSON.parse(cache)).setNames;
                this.set("setNames", setNames);
                return callback(null, setNames);
            }
            
            Y.YQL(this.get("query"), function(r) {
                var i, name;
                var results = r.query.results.a;
                
                Y.log("Fetching data from YQL for setName...");
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
                localStorage.setItem("setNames", Y.JSON.stringify(sn.toJSON));
                return callback(r.error, setNames);
            });
        }
    }, {
        ATTRS: {
            setNames: {},
            query: {
                getter: function() {
                    var url = "http://magic.tcgplayer.com/magic_price_guides.asp";
                    var xpath = "//table/tr/td/table[2]/tr/td[2]/table//a";
                    return "select * from html where url='" + url + "' and xpath='" + xpath + "'";
                }
            }
        }
    });
    
    Y.MTG.Set = Y.Base.create('set', Y.Model, [], {
        
        sync: function(action, options, callback) {
            var cardSet = this, cache, cards = {};
            if (action !== "read") {
                return callback("Invalid Action");
            }

            cache = localStorage.getItem(this.get("name"));
            if (cache) {
                Y.log("Set " + this.get("name") + " was cached locally.");
                cards = (Y.JSON.parse(cache)).cards;
                this.set("cards", cards);
                return callback(null, cards);
            }
            
            Y.YQL(this.get("query"), function(r) {
                var i, name, price;
                var results = r.query.results.font;
                
                Y.log("Fetching data from YQL for " + cardSet.get("name") + "...");
                for (i = 0; i < results.length; i += 2) {
                    name = results[i].content;
                    price = results[i+1].content.replace("$", "") - 0;
                    cards[name] = { "price": price };
                }
                
                cardSet.set("cards", cards);
                localStorage.setItem(cardSet.get("name"), Y.JSON.stringify(cardSet.toJSON()));
                return callback(r.error, cards);
            });
        },
        
    }, {
        ATTRS: {
            name: {},
            query: {
                getter: function() {
                    var url = 'http://magic.tcgplayer.com/db/price_guide.asp?setname=' + this.getAsURL("name");
                    var xpath = '//table[2]/tr/td[position()=1 or position()=7]/font';
                    return "select * from html where url='" + url + "' and xpath='" + xpath + "'";
                }
            },
            cards: {}
        }
    });
    
}, "0.1", { requires: ["json", "yql", "app"] });