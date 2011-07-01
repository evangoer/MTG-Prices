YUI.add("mtg-prices", function(Y) {
 
    Y.namespace("MTG");
    
    Y.MTG.Set = Y.Base.create('set', Y.Model, [], {
        
        sync: function(action, options, callback) {
            var cardSet = this, cache, cards = {};
            if (action !== "read") {
                return callback("Invalid Action");
            }

            cache = localStorage.getItem(this.get("name"));
            if (cache) {
                Y.log("Data was cached locally");
                cards = (Y.JSON.parse(cache)).cards;
                this.set("cards", cards);
                return callback(null, cards);
            }
            
            Y.YQL(this.get("query"), function(r) {
                var i, name, price;
                var results = r.query.results.font;
                
                Y.log("Fetching data from YQL...");
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