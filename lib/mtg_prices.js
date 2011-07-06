YUI.add("mtg-prices", function(Y) {
    Y.namespace("MTG");
    
    Y.MTG.YQLSync = function(){};
    Y.MTG.YQLSync.prototype = {
        query: function() {
            return "SELECT * FROM html WHERE url='" + this.get("url") 
                + "' AND xpath='" + this.get("xpath") + "'";
        },
        sync: function(action, options, callback) {
            var sn = this, cache, data;
            if (action != "read") {
                return callback("Invalid Action");
            }
            
            cache = localStorage.getItem(this.get("id"));
            if (cache) {
                Y.log("Data for " + this.get("id") + " was cached locally.");
                data = (Y.JSON.parse(cache)).data;
                this.set("data", data);
                return callback(null, data);
            }
            else {
                this.sync_callback = callback;        
                Y.YQL(this.query(), Y.bind(function(r) {
                    Y.log("Fetching data from YQL for " + this.get("id") + "...");                    
                    this.set("data", this.processData(r));
                    localStorage.setItem(this.get("id"), Y.JSON.stringify(this.toJSON()));
                    return this.sync_callback(r.error, data);
                }, this));
            }
        }
    };
    
    Y.MTG.SetNames = Y.Base.create('setNames', Y.Model, [Y.MTG.YQLSync], {
        processData: function(r) {
            var i, name, data = []; // possibly change to [] depending on usage
            var results = r.query.results.a;
            for (i = 0; i < results.length; i++) {
                name = results[i].content;
                if (typeof name === "string") {
                    name = name.replace(/\s+/g, " ");
                    data.push(name);
                }
            }
            return data;
        }
    }, {
        ATTRS: {
            id: { value: "SET_NAMES" },
            data: {},
            url: { value: "http://magic.tcgplayer.com/magic_price_guides.asp" },
            xpath: { value: "//table/tr/td/table[2]/tr/td[2]/table//a" }
        }
    });
    
    Y.MTG.Set = Y.Base.create('set', Y.Model, [Y.MTG.YQLSync], {
        processData: function(r) {
            var i, name, price, data = {};
            var results = r.query.results.font;
            
            for (i = 0; i < results.length; i += 2) {
                name = results[i].content;
                price = results[i+1].content.replace("$", "") - 0;
                data[name] = { "price": price };
            }
            return data;
        }
    }, {
        ATTRS: {
            data: {},
            url: {
                getter: function() {
                    return "http://magic.tcgplayer.com/db/price_guide.asp?setname=" + this.getAsURL("id");
                }
            },
            xpath: { value: "//table[2]/tr/td[position()=1 or position()=7]/font" }
        }
    });
    
    // Y.MTG.SetList -- a ModelList of Y.MTG.Sets
    //  - holds all Y.MTG.Set instances
    //  - getById(id) to grab an individual Set
    //  - keep separate from a Y.MTG.Collection. You could merge the two (count = 0 means the user doesn't have that card), but:
    //      - Y.MTG.SetList is just a holder for overall pricing data, that can sync remotely using YQL
    //      - the colletion is the USER's data, and does not sync remotely using YQL
    Y.MTG.SetList = Y.Base.create('setList', Y.ModelList, []);
    
    // Y.MTG.Collection
    // Stores the user's actual collection of cards
    // Does not sync with YQL, but does with localStorage
    // This object expects an array of: { name: <name>, set: <set>, count: <n> }. Count is optional, defaults to 1.
    // 
    
}, "0.1", { requires: ["json", "yql", "app"] });