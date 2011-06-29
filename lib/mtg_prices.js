YUI.add("mtg-prices", function(Y){
    var url = "http://magic.tcgplayer.com/db/magic_single_card.asp?cn=Serra%20Angel&sn=Revised%20Edition";
    var xpath = '//td[@bgcolor="#D1DFFC"]/center/strong';
    
    Y.namespace("MTG");
    Y.MTG.query = "select * from html where url='" + url + "' and xpath='" + xpath + "'";
    
    
}, "0.1", { requires: ["yql"] });