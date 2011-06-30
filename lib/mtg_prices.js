YUI.add("mtg-prices", function(Y) {
 
    Y.namespace("MTG");
    
    Y.MTG.Set = Y.Base.create('card', Y.Model, [], {
        sync: function(action, options, callback) {
            if (action !== "read") {
                return callback(null);
            }
            
            // implmentation here
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
            }
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
    
    
    // bad
//    var card = new Y.MTG.Card({name: "Serra Angel", set: "Revised Edition"});
    var set = new Y.MTG.Set({name: "Revised Edition"});
    Y.MTG.query = set.get("query");
    
//    Y.MTG.query = "select * from html where url='" + card.get("url") + "' and xpath='" + xpath + "'";
    
}, "0.1", { requires: ["yql", "app"] });