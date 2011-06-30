YUI.add("mtg-prices", function(Y) {
//    var url = "http://magic.tcgplayer.com/db/magic_single_card.asp?cn=Serra%20Angel&sn=Revised%20Edition";
    var xpath = '//td[@bgcolor="#D1DFFC"]/center/strong';
    
    Y.namespace("MTG");
    Y.MTG.Card = Y.Base.create('card', Y.Model, [], {
        
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
    
    // bad
    var card = new Y.MTG.Card({name: "Serra Angel", set: "Revised Edition"});
    
    Y.MTG.query = "select * from html where url='" + card.get("url") + "' and xpath='" + xpath + "'";
    
}, "0.1", { requires: ["yql", "app"] });