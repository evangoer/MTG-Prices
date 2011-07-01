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
                // this.processData is responsible for returning the callback
                this.sync_callback = callback;
                Y.YQL(this.query(), Y.bind(this.processData, this));
            }
        }
    }
    
    // TODO: factor out common logic between SetNames and Set
    Y.MTG.SetNames = Y.Base.create('setNames', Y.Model, [Y.MTG.YQLSync], {
        processData: function(r) {
            var i, name, data = {};
            var results = r.query.results.a;
            
            Y.log("Fetching data from YQL for " + this.get("id") + "...");
            for (var i=0; i < results.length; i++) {
                name = results[i].content;
                if (typeof name === "string") {
                    name = name.replace(/\s+/g, " ");
                    // inelegant. possibly should just be an array?
                    // do we care about iterating through the list of names sequentially? or doing lookups?
                    data[name] = name;
                }
            }
            
            this.set("data", data);
            localStorage.setItem(this.get("id"), Y.JSON.stringify(this.toJSON()));
            return this.sync_callback(r.error, data);
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
            
            Y.log("Fetching data from YQL for " + this.get("id") + "...");
            for (i = 0; i < results.length; i += 2) {
                name = results[i].content;
                price = results[i+1].content.replace("$", "") - 0;
                data[name] = { "price": price };
            }
            
            this.set("data", data);
            localStorage.setItem(this.get("id"), Y.JSON.stringify(this.toJSON()));
            return this.sync_callback(r.error, data);
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
    
}, "0.1", { requires: ["json", "yql", "app"] });