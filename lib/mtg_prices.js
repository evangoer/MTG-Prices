YUI.add("mtg-prices", function(Y) {
 
    Y.namespace("MTG");
    
    Y.MTG.Set = Y.Base.create('set', Y.Model, [], {
        
        sync: function(action, options, callback) {            
            if (action !== "read") {
                return callback("Invalid Action");
            }
            
            // TODO caching using HTML Storage
            // if the cache is empty -OR- if an option to force sync is set, go out to YQL
            // otherwise get from the cache

            Y.YQL(this.get("query"), function(r) {
                var cards = {}, i, name, price;
                var results = r.query.results.font;
                
                Y.log("Transforming data...");
                for (i = 0; i < results.length; i += 2) {
                    name = results[i].content;
                    price = results[i+1].content.replace("$", "") - 0;
                    cards[name] = { "price": price };
                }
                return callback(r.error, cards);
            });
        }
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
    
    
/*
    Y.MTG.Card = Y.Base.create('card', Y.Model, [], {
        sync: function(actions, options, callback) {
            
        }
    }, {
        ATTRS: {
            name: {},
            set: {
                value: null
            },
            price: {},
            url: {
                getter: function() {
                    var base = "http://magic.tcgplayer.com/db/magic_single_card.asp";
                    var cardName = "?cn=" + this.getAsURL("name");
                    var setName = this.get("set") ? "&sn=" + this.getAsURL("set") : '' ;
                    return base + cardName + setName;
                }
            }
        }
    })
    
*/    

    
}, "0.1", { requires: ["yql", "app"] });