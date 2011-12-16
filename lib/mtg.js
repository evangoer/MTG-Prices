YUI.add('mtg', function (Y) {  
    Y.namespace('MTG');
    
    Y.MTG.url = 'http://magic.tcgplayer.com';

    Y.MTG.YQLSync = function () {};
    Y.MTG.YQLSync.prototype = {
        query: function () {
            var query = 'SELECT * FROM html WHERE url="{url}" AND xpath="{xpath}"';
            return Y.Lang.sub(query, this.toJSON());
        },
        sync: function (action, options, callback) {
            var processData = this.processData;
            if (action !== 'read') {
                return callback('Invalid Action');
            }
            
            Y.YQL(this.query(), function (r) {
                callback(r.error, processData(r));
            });
        }
    };

    Y.MTG.SetNames = Y.Base.create('setNames', Y.Model, [Y.MTG.YQLSync], {
        processData: function(r) {
            var i, name, names = [],
                results = r.query.results.a;
                
            for (i = 0; i < results.length; i++) {
                name = results[i].content;
                if (typeof name === 'string') {
                    name = name.replace(/\s+/g, ' ');
                    names.push(name);
                }
            }
            return { 'names': names };
        }
    }, {
        ATTRS: {
            id:    { value: 'SET_NAMES', readOnly: true },
            names: { value: [] },
            url:   { value: Y.MTG.url + '/magic_price_guides.asp' },
            xpath: { value: '//table/tr/td/table[2]/tr/td[2]/table//a' }
        }
    });    
    
    Y.MTG.Card = Y.Base.create('card', Y.Model, [], {
        processData: function () {}
    }, {
        ATTRS: {
            name:      {},
            set:       {},
            mana:      {},
            color:     {},
            type:      {},
            rarity:    {},
            text:      {},
            img:       {},
            priceHigh: { value: 0 },
            priceMed:  { value: 0 },
            priceLow:  { value: 0 },
            url: {
                getter: function () {
                    var url = Y.MTG.url + '/db/magic_single_card.asp?cn={name}&sn={set}';
                    return Y.Lang.sub(url, {
                        name: this.getAsURL('name'),
                        set:  this.getAsURL('set')
                    });
                }
            },
            xpath: { value: '' }
        }
    });
}, '0.1', { requires: ['app', 'yql'] });